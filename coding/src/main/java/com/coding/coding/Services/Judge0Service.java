package com.coding.coding.Services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.Map;
import java.util.HashMap;
import java.util.List;

@Service
public class Judge0Service {

    @Value("${judge0.api.url}")
    private String judge0ApiUrl;

    private final RestTemplate restTemplate;

    public Judge0Service() {
        this.restTemplate = new RestTemplate();
    }

    public Map<String, Object> submitCode(String sourceCode, String languageId) {
        // Validate input
        if (sourceCode == null || sourceCode.trim().isEmpty() || languageId == null || languageId.trim().isEmpty()) {
            throw new IllegalArgumentException("Source code and language ID must not be blank");
        }

        // Create submission request
        Map<String, Object> submissionRequest = new HashMap<>();
        submissionRequest.put("source_code", sourceCode);
        submissionRequest.put("language_id", languageId);
        submissionRequest.put("stdin", ""); // You can add input if needed
        submissionRequest.put("cpu_time_limit", 5); // 5 seconds
        submissionRequest.put("memory_limit", 128000); // 128MB

        // Log the payload for debugging
        System.out.println("Judge0 payload: " + submissionRequest);

        // Set headers
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Create request entity
        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(submissionRequest, headers);

        // Submit code
        String submissionUrl = judge0ApiUrl + "/submissions";
        Map<String, Object> response = restTemplate.postForObject(submissionUrl, requestEntity, Map.class);

        // Get token from response
        String token = (String) response.get("token");

        // Wait a bit for compilation
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // Get submission result
        return getSubmissionResult(token);
    }

    public Map<String, Object> getSubmissionResult(String token) {
        String resultUrl = judge0ApiUrl + "/submissions/" + token;
        return restTemplate.getForObject(resultUrl, Map.class);
    }

    public List<Map<String, Object>> getLanguages() {
        String languagesUrl = judge0ApiUrl + "/languages";
        return restTemplate.getForObject(languagesUrl, List.class);
    }
} 