package com.coding.coding.Worker;

import com.coding.coding.DTO.RunTestCasesRequest;
import com.coding.coding.DTO.RunTestCasesResult;
import com.fasterxml.jackson.databind.ObjectMapper;
import okhttp3.*;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;
import org.springframework.context.annotation.Profile;

import java.util.Map;

@Service
@Profile("runtestcasesworker")
public class RunTestCasesWorker {
    @Autowired
    private MongoTemplate mongoTemplate;

    @RabbitListener(queues = "run-test-cases")
    public void processRunTestCases(RunTestCasesRequest req) {
        String[] outputs = new String[req.getInputs().length];
        String[] errors = new String[req.getInputs().length];
        try {
            OkHttpClient client = new OkHttpClient();
            for (int i = 0; i < req.getInputs().length; i++) {
                String json = String.format(
                    "{\"language_id\": %d, \"source_code\": \"%s\", \"stdin\": \"%s\"}",
                    req.getLanguageId(),
                    req.getCode().replace("\"", "\\\"").replace("\n", "\\n"),
                    req.getInputs()[i].replace("\"", "\\\"").replace("\n", "\\n")
                );
                RequestBody body = RequestBody.create(json, MediaType.parse("application/json"));
                Request request = new Request.Builder()
                    .url("http://localhost:2358/submissions?base64_encoded=false&wait=true")
                    .post(body)
                    .addHeader("content-type", "application/json")
                    .build();
                try (Response response = client.newCall(request).execute()) {
                    String responseBody = response.body().string();
                    ObjectMapper mapper = new ObjectMapper();
                    Map<String, Object> judgeResult = mapper.readValue(responseBody, Map.class);
                    outputs[i] = (String) judgeResult.getOrDefault("stdout", "");
                    errors[i] = (String) judgeResult.getOrDefault("stderr", "");
                }
            }
            RunTestCasesResult result = new RunTestCasesResult();
            result.setSubmissionId(req.getSubmissionId());
            result.setOutputs(outputs);
            result.setErrors(errors);
            result.setStatus("DONE");
            mongoTemplate.save(result);
        } catch (Exception e) {
            RunTestCasesResult result = new RunTestCasesResult();
            result.setSubmissionId(req.getSubmissionId());
            result.setOutputs(outputs);
            result.setErrors(errors);
            result.setStatus("ERROR: " + e.getMessage());
            mongoTemplate.save(result);
        }
    }
} 