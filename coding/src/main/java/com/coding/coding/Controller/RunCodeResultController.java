package com.coding.coding.Controller;

import com.coding.coding.DTO.RunCodeResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class RunCodeResultController {
    @Autowired
    private MongoTemplate mongoTemplate;

    @GetMapping("/api/run-result/{submissionId}")
    public ResponseEntity<?> getRunResult(@PathVariable String submissionId) {
        RunCodeResult result = mongoTemplate.findById(submissionId, RunCodeResult.class);
        if (result == null) {
            return ResponseEntity.ok(java.util.Map.of("status", "PENDING"));
        }
        return ResponseEntity.ok(result);
    }
} 