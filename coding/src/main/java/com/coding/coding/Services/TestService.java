package com.coding.coding.Services;

import com.coding.coding.Entity.Questions;
import com.coding.coding.Entity.Test;
import com.coding.coding.Repository.TestRepository;
import com.coding.coding.Repository.QuestionsRepository;
import com.coding.coding.Repository.UserRespository;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class TestService {

    @Autowired
    private TestRepository testRepository;

    @Autowired
    private QuestionsRepository questionRepository;

    @Autowired
    private UserRespository userRepository;

    public Test createTest(List<String> questionIds, LocalDateTime startDateTime, LocalDateTime endDateTime) {
        Test test = new Test();
        List<Questions> questions = questionIds.stream()
            .map(id -> questionRepository.findById(new ObjectId(id))
                .orElseThrow(() -> new RuntimeException("Question not found: " + id)))
            .toList();
        test.setQuestions(questions);
        test.setStartDateTime(startDateTime);
        test.setEndDateTime(endDateTime);
        test.setTestLink(generateTestLink());
        test.setActive(true);
        Test savedTest = testRepository.save(test);
        savedTest.setTestLink("/test/" + savedTest.getId());
        return testRepository.save(savedTest);
    }

    public Test getTest(ObjectId id) {
        return testRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Test not found"));
    }

    public List<Test> getTestsByUser(ObjectId userId) {
        return testRepository.findByUserId(userId);
    }

    public List<Test> getActiveTests() {
        return testRepository.findByIsActiveTrue();
    }

    public List<Test> getCurrentTests() {
        LocalDateTime now = LocalDateTime.now();
        return testRepository.findByStartDateTimeBeforeAndEndDateTimeAfter(now, now);
    }

    public Test updateTest(ObjectId id, LocalDateTime startDateTime, LocalDateTime endDateTime) {
        Test test = getTest(id);
        test.setStartDateTime(startDateTime);
        test.setEndDateTime(endDateTime);
        return testRepository.save(test);
    }

    public void deactivateTest(ObjectId id) {
        Test test = getTest(id);
        test.setActive(false);
        testRepository.save(test);
    }

    public List<Test> getActiveTestsForUser() {
        LocalDateTime now = LocalDateTime.now();
        return testRepository.findByIsActiveTrue().stream()
            .filter(test -> !now.isBefore(test.getStartDateTime()) && !now.isAfter(test.getEndDateTime()))
            .toList();
    }

    public Test launchTest(ObjectId id) {
        Test test = getTest(id);
        LocalDateTime now = LocalDateTime.now();
        test.setStartDateTime(now);
        test.setActive(true);
        return testRepository.save(test);
    }

    public List<Test> getInactiveTests() {
        return testRepository.findByIsActiveFalse();
    }

    private String generateTestLink() {
        // Generate a unique test link using UUID
        return "/test/" + UUID.randomUUID().toString();
    }
}