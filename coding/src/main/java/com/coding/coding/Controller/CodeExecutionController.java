package com.coding.coding.Controller;

import com.coding.coding.Entity.Questions;
import com.coding.coding.Entity.Submission;
import com.coding.coding.Entity.Test;
import com.coding.coding.Repository.QuestionsRepository;
import com.coding.coding.Repository.SubmissionRepository;
import com.coding.coding.Repository.TestRepository;
import com.coding.coding.Utils.JwtUtilis;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import org.bson.types.ObjectId;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.core.AmqpTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.GetMapping;

import java.io.IOException;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.net.SocketException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.TimeUnit;

import com.coding.coding.DTO.RunCodeRequest;
import com.coding.coding.DTO.RunTestCasesRequest;
import com.coding.coding.DTO.CodeExecutionRequest;
import com.coding.coding.DTO.CodeExecutionResponse;
import com.coding.coding.Services.CodeExecutionService;
import com.coding.coding.Services.QuestionService;
import com.coding.coding.Utils.NetworkConfigUtil;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class CodeExecutionController {

    private static final Logger logger = LoggerFactory.getLogger(CodeExecutionController.class);

    @Value("${judge0.api.url:http://localhost:2358}")
    private String judge0BaseUrl;

    private final OkHttpClient client = new OkHttpClient.Builder()
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .build();

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private QuestionsRepository questionsRepository;

    @Autowired
    private SubmissionRepository submissionRepository;

    @Autowired
    private TestRepository testRepository;

    @Autowired
    private JwtUtilis jwtUtil;

    @Autowired
    private AmqpTemplate amqpTemplate;

    @Autowired
    private CodeExecutionService codeExecutionService;

    @Autowired
    private QuestionService questionService;

    @Autowired
    private NetworkConfigUtil networkConfigUtil;

    /**
     * Get the current network IP address for Judge0
     */
    private String getJudge0Url() {
        return networkConfigUtil.getJudge0Url();
    }

    /**
     * Detect the local network IP address
     */
    private String getLocalNetworkIp() {
        return networkConfigUtil.getLocalNetworkIp();
    }

    @PostMapping("/code/run")
    public ResponseEntity<?> runCode(@RequestBody Map<String, Object> request) {
        String code = (String) request.get("code");
        Object languageIdObj = request.get("languageId");
        String stdin = (String) request.getOrDefault("stdin", "");
        int languageId = (languageIdObj instanceof String)
                ? Integer.parseInt((String) languageIdObj)
                : (Integer) languageIdObj;
        String submissionId = UUID.randomUUID().toString();
        RunCodeRequest runReq = new RunCodeRequest();
        runReq.setSubmissionId(submissionId);
        runReq.setCode(code);
        runReq.setLanguageId(languageId);
        runReq.setStdin(stdin);
        amqpTemplate.convertAndSend("run-code", runReq);
        return ResponseEntity.ok(Map.of("submissionId", submissionId));
    }

    @PostMapping("/questions/{questionId}/submit")
    public ResponseEntity<?> submitQuestionCode(
            @PathVariable String questionId,
            @RequestBody Map<String, Object> request) {
        try {
            String code = (String) request.get("code");
            Object languageIdObj = request.get("languageId");
            int languageId = (languageIdObj instanceof String)
                    ? Integer.parseInt((String) languageIdObj)
                    : (Integer) languageIdObj;

            // 1. Fetch the question and its test cases
            Questions question = questionsRepository.findById(new ObjectId(questionId))
                    .orElseThrow(() -> new RuntimeException("Question not found"));
            List<Questions.TestCase> testCases = question.getTestCases();

            // 2. For each test case, run code and compare output
            List<Map<String, Object>> results = new ArrayList<>();
            int passed = 0;
            for (int i = 0; i < testCases.size(); i++) {
                Questions.TestCase testCase = testCases.get(i);
                String input = testCase.getInput();
                String expected = testCase.getOutput();

                // Submit to Judge0
                String token = submitCode(code, languageId, input);
                Map<String, Object> judgeResult = getExecutionResult(token);

                String actual = (String) judgeResult.getOrDefault("stdout", "");
                boolean isPassed = actual != null && actual.trim().equals(expected.trim());

                if (isPassed) passed++;

                results.add(Map.of(
                        "testCase", i + 1,
                        "input", input,
                        "expected", expected,
                        "actual", actual,
                        "passed", isPassed,
                        "visible", true // or false for hidden test cases
                ));
            }

            Map<String, Object> summary = Map.of(
                    "passed", passed,
                    "total", testCases.size(),
                    "score", (int) ((passed * 100.0) / testCases.size())
            );

            return ResponseEntity.ok(Map.of(
                    "summary", summary,
                    "results", results
            ));

        } catch (Exception e) {
            logger.error("Error submitting code for question {}: {}", questionId, e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Internal server error: " + e.getMessage()));
        }
    }

    @PostMapping("/questions/{questionId}/submit-test")
    public ResponseEntity<?> submitTest(
            @PathVariable String questionId,
            @RequestBody Map<String, Object> request,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String code = (String) request.get("code");
            Object languageIdObj = request.get("languageId");
            int languageId = (languageIdObj instanceof String)
                    ? Integer.parseInt((String) languageIdObj)
                    : (Integer) languageIdObj;
            // Get testId from request
            String testId = (String) request.get("testId");
            Test test = null;
            if (testId != null) {
                test = testRepository.findById(new org.bson.types.ObjectId(testId)).orElse(null);
                if (test == null) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Test not found"));
                }
            }

            // 1. Fetch the question and its test cases
            Questions question = questionsRepository.findById(new ObjectId(questionId))
                    .orElseThrow(() -> new RuntimeException("Question not found"));
            List<Questions.TestCase> testCases = question.getTestCases();

            // 2. For each test case, run code and compare output
            int passed = 0;
            for (Questions.TestCase testCase : testCases) {
                String input = testCase.getInput();
                String expected = testCase.getOutput();
                String token = submitCode(code, languageId, input);
                Map<String, Object> judgeResult = getExecutionResult(token);
                String actual = (String) judgeResult.getOrDefault("stdout", "");
                boolean isPassed = actual != null && actual.trim().equals(expected.trim());
                if (isPassed) passed++;
            }

            // 3. Calculate marks
            int marks = passed * 10; // 1 pass = 10, 2 = 20, ..., 5 = 50

            // 4. Extract userId from JWT
            String jwt = authHeader.replace("Bearer ", "");
            String userId = jwtUtil.extractUsername(jwt);

            // 5. Always create a new submission for test submissions
            Submission submission = new Submission();
            submission.setUserId(userId);
            submission.setQuestionId(questionId);
            submission.setCode(code);
            submission.setMarks(marks);
            submission.setSubmittedAt(LocalDateTime.now());
            if (test != null) {
                submission.setTest(test);
            }
            submissionRepository.save(submission);
            logger.info("Created new test submission for user {} and question {} with marks {}", userId, questionId, marks);

            return ResponseEntity.ok(Map.of(
                    "marks", marks,
                    "passed", passed,
                    "total", testCases.size(),
                    "submissionId", submission.getId()
            ));

        } catch (Exception e) {
            logger.error("Error submitting test: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Internal server error: " + e.getMessage()));
        }
    }

    @PostMapping("/run-test-cases")
    public ResponseEntity<?> runTestCases(@RequestBody RunTestCasesRequest req) {
        String submissionId = UUID.randomUUID().toString();
        req.setSubmissionId(submissionId);
        amqpTemplate.convertAndSend("run-test-cases", req);
        return ResponseEntity.ok(Map.of("submissionId", submissionId));
    }

    @PostMapping("/code/execute")
    public ResponseEntity<CodeExecutionResponse> executeCode(@RequestBody CodeExecutionRequest request) {
        try {
            ObjectId questionId = new ObjectId(request.getQuestionId());
            Questions question = questionService.getQuestionById(questionId);
            if (question == null) {
                CodeExecutionResponse response = new CodeExecutionResponse();
                response.setSuccess(false);
                response.setError("Question not found");
                return ResponseEntity.badRequest().body(response);
            }

            CodeExecutionResponse response = codeExecutionService.executeCode(request, question);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            CodeExecutionResponse response = new CodeExecutionResponse();
            response.setSuccess(false);
            response.setError("Error executing code: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @GetMapping("/network/info")
    public ResponseEntity<?> getNetworkInfo() {
        try {
            Map<String, String> networkInfo = networkConfigUtil.getNetworkInfo();
            networkInfo.put("environment", networkConfigUtil.getNetworkEnvironment());
            networkInfo.put("judge0Accessible", String.valueOf(networkConfigUtil.isJudge0Accessible()));
            
            return ResponseEntity.ok(networkInfo);
        } catch (Exception e) {
            logger.error("Error getting network info: {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", "Failed to get network information"));
        }
    }

    private String sanitizeInput(String input) {
        if (input == null) return "";
        // Normalize newlines and trim leading/trailing whitespace
        return input.replace("\r\n", "\n").replace("\r", "\n").trim();
    }

    private String submitCode(String code, int languageId, String stdin) throws IOException {
        MediaType mediaType = MediaType.parse("application/json");

        String escapedCode = code.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");

        String sanitizedStdin = sanitizeInput(stdin);
        String escapedStdin = sanitizedStdin.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");

        System.out.println("Sanitized stdin: [" + sanitizedStdin + "]");

        String json = String.format(
                "{\"language_id\": %d, \"source_code\": \"%s\", \"stdin\": \"%s\"}",
                languageId, escapedCode, escapedStdin
        );

        okhttp3.RequestBody body = okhttp3.RequestBody.create(json, mediaType);

        Request request = new Request.Builder()
                .url(getJudge0Url() + "/submissions?base64_encoded=false&wait=false")
                .post(body)
                .addHeader("content-type", "application/json")
                .build();

        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                logger.error("Failed to submit code: HTTP {}", response.code());
                return null;
            }

            String responseBody = response.body().string();
            JsonNode jsonNode = objectMapper.readTree(responseBody);
            return jsonNode.get("token").asText();
        }
    }

    private Map<String, Object> getExecutionResult(String token) throws IOException, InterruptedException {
        Request request = new Request.Builder()
                .url(getJudge0Url() + "/submissions/" + token + "?base64_encoded=false&fields=*")
                .get()
                .build();

        for (int i = 0; i < 20; i++) {
            try (Response response = client.newCall(request).execute()) {
                if (!response.isSuccessful()) {
                    logger.error("Failed to get execution result: HTTP {}", response.code());
                    return Map.of("error", "Failed to get execution result from Judge0");
                }

                String responseBody = response.body().string();
                JsonNode result = objectMapper.readTree(responseBody);

                JsonNode statusNode = result.get("status");
                if (statusNode != null) {
                    int statusId = statusNode.get("id").asInt();
                    String statusDescription = statusNode.get("description").asText();

                    logger.info("Execution status: {} - {}", statusId, statusDescription);

                    if (statusId != 1 && statusId != 2) {
                        return parseExecutionResult(result);
                    }
                }

                Thread.sleep(500);
            }
        }

        return Map.of("error", "Execution timeout - code took too long to execute");
    }

    private Map<String, Object> parseExecutionResult(JsonNode result) {
        try {
            String stdout = getNodeAsString(result, "stdout");
            String stderr = getNodeAsString(result, "stderr");
            String compileOutput = getNodeAsString(result, "compile_output");

            JsonNode statusNode = result.get("status");
            String statusDescription = statusNode != null ? statusNode.get("description").asText() : "Unknown";
            int statusId = statusNode != null ? statusNode.get("id").asInt() : -1;

            String output;
            if (statusId == 3) {
                output = stdout != null && !stdout.trim().isEmpty() ? stdout : "Program executed successfully (no output)";
            } else if (statusId == 6) {
                output = "Compilation Error:\n" + (compileOutput != null ? compileOutput : "Unknown compilation error");
            } else if (statusId == 5) {
                output = "Time Limit Exceeded";
            } else if (statusId == 4) {
                output = stdout != null ? stdout : "Execution completed";
            } else if (stderr != null && !stderr.trim().isEmpty()) {
                output = "Runtime Error:\n" + stderr;
            } else {
                output = "Status: " + statusDescription +
                        (stdout != null && !stdout.trim().isEmpty() ? "\nOutput: " + stdout : "");
            }

            return Map.of(
                    "stdout", stdout != null ? stdout : "",
                    "stderr", stderr != null ? stderr : "",
                    "compile_output", compileOutput != null ? compileOutput : "",
                    "status", statusDescription,
                    "status_id", statusId,
                    "output", output
            );

        } catch (Exception e) {
            logger.error("Error parsing execution result: {}", e.getMessage());
            return Map.of("error", "Error parsing execution result: " + e.getMessage());
        }
    }

    private String getNodeAsString(JsonNode parent, String fieldName) {
        JsonNode node = parent.get(fieldName);
        return (node != null && !node.isNull()) ? node.asText() : null;
    }
} 