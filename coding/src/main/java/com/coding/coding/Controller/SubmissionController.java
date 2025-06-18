package com.coding.coding.Controller;

import com.coding.coding.Entity.Submission;
import com.coding.coding.Entity.User;
import com.coding.coding.Entity.Questions;
import com.coding.coding.Entity.Test;
import com.coding.coding.Repository.SubmissionRepository;
import com.coding.coding.Repository.UserRespository;
import com.coding.coding.Repository.QuestionsRepository;
import com.coding.coding.Repository.TestRepository;
import com.coding.coding.DTO.SubmissionRequest;
import com.coding.coding.DTO.SubmissionResult;
import org.bson.types.ObjectId;
import org.springframework.amqp.core.AmqpTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.UUID;

@RestController
@RequestMapping("/api/submissions")
public class SubmissionController {
    @Autowired
    private SubmissionRepository submissionRepository;
    @Autowired
    private UserRespository userRepository;
    @Autowired
    private QuestionsRepository questionsRepository;
    @Autowired
    private TestRepository testRepository;
    @Autowired
    private AmqpTemplate amqpTemplate;
    @Autowired
    private MongoTemplate mongoTemplate;

    @GetMapping("/by-test/{testId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> getSubmissionsByTest(@PathVariable String testId) {
        try {
            // First try to find the test
            Test test = testRepository.findById(new ObjectId(testId)).orElse(null);
            if (test == null) {
                return ResponseEntity.badRequest().body("Test not found");
            }

            // Try different methods to find submissions
            List<Submission> submissions;
            try {
                // First try using the test object
                submissions = submissionRepository.findByTest(test);
                if (submissions.isEmpty()) {
                    // If no results, try using the test ID
                    submissions = submissionRepository.findByTest_Id(testId);
                }
            } catch (Exception e) {
                // If that fails, try a direct query
                Query query = new Query(Criteria.where("test.$id").is(new ObjectId(testId)));
                submissions = mongoTemplate.find(query, Submission.class);
            }

            // Transform submissions to include user and question details
            List<Map<String, Object>> result = submissions.stream().map(sub -> {
                Map<String, Object> map = new java.util.HashMap<>();
                try {
                    User user = userRepository.findByEmail(sub.getUserId());
                    String userName = user != null ? user.getName() : sub.getUserId();
                    Questions question = null;
                    String questionTitle = sub.getQuestionId();
                    try {
                        question = questionsRepository.findById(new ObjectId(sub.getQuestionId())).orElse(null);
                        if (question != null) questionTitle = question.getTitle();
                    } catch (Exception ignored) {}

                    map.put("id", sub.getId() != null ? sub.getId().toString() : null);
                    map.put("userId", sub.getUserId());
                    map.put("userName", userName);
                    map.put("submittedAt", sub.getSubmittedAt());
                    map.put("marks", sub.getMarks());
                    map.put("questionId", sub.getQuestionId());
                    map.put("questionTitle", questionTitle);
                    map.put("code", sub.getCode());
                    map.put("testId", testId);
                } catch (Exception e) {
                    // If there's an error processing a submission, log it but continue
                    System.err.println("Error processing submission: " + e.getMessage());
                }
                return map;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching submissions: " + e.getMessage());
        }
    }

    @PostMapping("/api/submit")
    public ResponseEntity<?> submit(@RequestBody SubmissionRequest req) {
        String submissionId = UUID.randomUUID().toString();
        req.setSubmissionId(submissionId);
        amqpTemplate.convertAndSend("code-submissions", req);
        return ResponseEntity.ok(Map.of("submissionId", submissionId));
    }

    @GetMapping("/api/result/{submissionId}")
    public ResponseEntity<?> getResult(@PathVariable String submissionId) {
        SubmissionResult result = mongoTemplate.findById(submissionId, SubmissionResult.class);
        if (result == null) {
            return ResponseEntity.ok(Map.of("status", "PENDING"));
        }
        return ResponseEntity.ok(result);
    }
} 