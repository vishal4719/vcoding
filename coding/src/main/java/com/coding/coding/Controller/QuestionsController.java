package com.coding.coding.Controller;

import com.coding.coding.Entity.Questions;
import com.coding.coding.Services.QuestionsService;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/questions")
public class QuestionsController {

    @Autowired
    private QuestionsService questionsService;

    @PostMapping
    public Questions addQuestion(@RequestBody Questions question) {
        return questionsService.addQuestion(question);
    }


    // Add this endpoint for adding multiple questions at once
    @PostMapping("/bulk")
    public ResponseEntity<List<Questions>> addMultipleQuestions(@RequestBody List<Questions> questions) {
        List<Questions> savedQuestions = questionsService.addMultipleQuestions(questions);
        return ResponseEntity.ok(savedQuestions);
    }

    @GetMapping
    public List<Questions> getAllQuestions() {
        List<Questions> questions = questionsService.getAllQuestions();
        // Assign a number to each question for display (1-based index)
        for (int i = 0; i < questions.size(); i++) {
            questions.get(i).setTitle((i + 1) + ". " + questions.get(i).getTitle());
        }
        return questions;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Questions> getQuestionById(@PathVariable ObjectId id) {
        Optional<Questions> opt = questionsService.getQuestionById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        Questions q = opt.get();
        if (q.getTestCases() != null && q.getTestCases().size() > 2) {
            q.setTestCases(q.getTestCases().subList(0, 2));
        }
        return ResponseEntity.ok(q);
    }
}

