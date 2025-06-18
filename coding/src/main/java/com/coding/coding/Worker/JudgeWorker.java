package com.coding.coding.Worker;

import com.coding.coding.DTO.SubmissionRequest;
import com.coding.coding.DTO.SubmissionResult;
import com.fasterxml.jackson.databind.ObjectMapper;
import okhttp3.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;
import org.springframework.context.annotation.Profile;

import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@Profile("judgeworker")
public class JudgeWorker {
    private static final Logger logger = LoggerFactory.getLogger(JudgeWorker.class);
    
    @Value("${worker.id}")
    private String workerId;
    
    private final AtomicInteger processedJobs = new AtomicInteger(0);
    
    @Autowired
    private MongoTemplate mongoTemplate;

    @RabbitListener(queues = "code-submissions")
    public void processSubmission(SubmissionRequest req) {
        int jobCount = processedJobs.incrementAndGet();
        logger.info("[{}] Starting to process submission: {} (Total jobs processed: {})", 
            workerId, req.getSubmissionId(), jobCount);
            
        try {
            OkHttpClient client = new OkHttpClient();
            String json = String.format(
                "{\"language_id\": %d, \"source_code\": \"%s\", \"stdin\": \"%s\"}",
                req.getLanguageId(),
                req.getCode().replace("\"", "\\\"").replace("\n", "\\n"),
                req.getStdin().replace("\"", "\\\"").replace("\n", "\\n")
            );
            RequestBody body = RequestBody.create(json, MediaType.parse("application/json"));
            Request request = new Request.Builder()
                .url("http://localhost:2358/submissions?base64_encoded=false&wait=true")
                .post(body)
                .addHeader("content-type", "application/json")
                .build();
                
            logger.info("[{}] Sending code to Judge0 for submission: {}", workerId, req.getSubmissionId());
            
            try (Response response = client.newCall(request).execute()) {
                String responseBody = response.body().string();
                ObjectMapper mapper = new ObjectMapper();
                Map<String, Object> judgeResult = mapper.readValue(responseBody, Map.class);
                String output = (String) judgeResult.getOrDefault("stdout", "");
                String error = (String) judgeResult.getOrDefault("stderr", "");
                String status = judgeResult.get("status") != null ? judgeResult.get("status").toString() : "UNKNOWN";

                SubmissionResult result = new SubmissionResult();
                result.setSubmissionId(req.getSubmissionId());
                result.setOutput(output);
                result.setError(error);
                result.setStatus(status);
                mongoTemplate.save(result);
                
                logger.info("[{}] Successfully processed submission: {} (Status: {})", 
                    workerId, req.getSubmissionId(), status);
            }
        } catch (Exception e) {
            logger.error("[{}] Error processing submission {}: {}", workerId, req.getSubmissionId(), e.getMessage());
            SubmissionResult result = new SubmissionResult();
            result.setSubmissionId(req.getSubmissionId());
            result.setOutput("");
            result.setError(e.getMessage());
            result.setStatus("ERROR");
            mongoTemplate.save(result);
        }
    }
} 