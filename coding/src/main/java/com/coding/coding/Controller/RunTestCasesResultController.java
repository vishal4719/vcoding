package com.coding.coding.Controller;

import com.coding.coding.DTO.RunTestCasesResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class RunTestCasesResultController {
    @Autowired
    private MongoTemplate mongoTemplate;

    @GetMapping("/api/run-test-cases-result/{submissionId}")
    public ResponseEntity<?> getRunTestCasesResult(@PathVariable String submissionId) {
        RunTestCasesResult result = mongoTemplate.findById(submissionId, RunTestCasesResult.class);
        if (result == null) {
            return ResponseEntity.ok(java.util.Map.of("status", "PENDING"));
        }
        return ResponseEntity.ok(result);
    }
} 