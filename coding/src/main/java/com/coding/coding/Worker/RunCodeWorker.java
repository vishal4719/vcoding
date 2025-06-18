package com.coding.coding.Worker;

import com.coding.coding.DTO.RunCodeRequest;
import com.coding.coding.DTO.RunCodeResult;
import com.fasterxml.jackson.databind.ObjectMapper;
import okhttp3.*;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;
import org.springframework.context.annotation.Profile;

import java.util.Map;

@Service
@Profile("runcodeworker")
public class RunCodeWorker {
    @Autowired
    private MongoTemplate mongoTemplate;

    @RabbitListener(queues = "run-code")
    public void processRunCode(RunCodeRequest req) {
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
                .url("http://192.168.0.103:2358/submissions?base64_encoded=false&wait=true")
                .post(body)
                .addHeader("content-type", "application/json")
                .build();
            try (Response response = client.newCall(request).execute()) {
                String responseBody = response.body().string();
                ObjectMapper mapper = new ObjectMapper();
                Map<String, Object> judgeResult = mapper.readValue(responseBody, Map.class);
                String output = (String) judgeResult.getOrDefault("stdout", "");
                String error = (String) judgeResult.getOrDefault("stderr", "");
                String status = judgeResult.get("status") != null ? judgeResult.get("status").toString() : "UNKNOWN";

                RunCodeResult result = new RunCodeResult();
                result.setSubmissionId(req.getSubmissionId());
                result.setOutput(output);
                result.setError(error);
                result.setStatus(status);
                mongoTemplate.save(result);
            }
        } catch (Exception e) {
            RunCodeResult result = new RunCodeResult();
            result.setSubmissionId(req.getSubmissionId());
            result.setOutput("");
            result.setError(e.getMessage());
            result.setStatus("ERROR");
            mongoTemplate.save(result);
        }
    }
} 