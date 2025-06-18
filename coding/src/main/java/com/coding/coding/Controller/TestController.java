package com.coding.coding.Controller;

import com.coding.coding.Entity.Test;
import com.coding.coding.Services.TestService;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

// DTO for test creation
class CreateTestRequest {
    private List<String> questionIds;
    private String startDateTime;
    private String endDateTime;

    public CreateTestRequest() {}

    public List<String> getQuestionIds() { return questionIds; }
    public void setQuestionIds(List<String> questionIds) { this.questionIds = questionIds; }

    public String getStartDateTime() { return startDateTime; }
    public void setStartDateTime(String startDateTime) { this.startDateTime = startDateTime; }

    public String getEndDateTime() { return endDateTime; }
    public void setEndDateTime(String endDateTime) { this.endDateTime = endDateTime; }
}

@RestController
@RequestMapping("/api/tests")
public class TestController {

    @Autowired
    private TestService testService;

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Test> createTest(@RequestBody CreateTestRequest request) {
        try {
            LocalDateTime startDateTime = LocalDateTime.parse(request.getStartDateTime());
            LocalDateTime endDateTime = LocalDateTime.parse(request.getEndDateTime());
            Test test = testService.createTest(
                    request.getQuestionIds(),
                    startDateTime,
                    endDateTime
            );
            return ResponseEntity.ok(test);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Test> getTest(@PathVariable String id) {
        try {
            Test test = testService.getTest(new org.bson.types.ObjectId(id));
            return ResponseEntity.ok(test);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/active")
    public ResponseEntity<List<Test>> getActiveTests() {
        List<Test> tests = testService.getActiveTests();
        return ResponseEntity.ok(tests);
    }

    @GetMapping("/current")
    public ResponseEntity<List<Test>> getCurrentTests() {
        List<Test> tests = testService.getCurrentTests();
        return ResponseEntity.ok(tests);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Test> updateTest(
            @PathVariable String id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDateTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDateTime) {
        try {
            Test test = testService.updateTest(new org.bson.types.ObjectId(id), startDateTime, endDateTime);
            return ResponseEntity.ok(test);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> deactivateTest(@PathVariable String id) {
        try {
            testService.deactivateTest(new org.bson.types.ObjectId(id));
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/active-for-user")
    public ResponseEntity<List<Test>> getActiveTestsForUser() {
        List<Test> tests = testService.getActiveTestsForUser();
        return ResponseEntity.ok(tests);
    }

    @PostMapping("/{id}/launch")
    public ResponseEntity<Test> launchTest(@PathVariable String id) {
        Test test = testService.launchTest(new ObjectId(id));
        return ResponseEntity.ok(test);
    }

    @GetMapping("/inactive-for-user")
    public ResponseEntity<List<Test>> getInactiveTestsForUser() {
        List<Test> tests = testService.getInactiveTests();
        return ResponseEntity.ok(tests);
    }
}