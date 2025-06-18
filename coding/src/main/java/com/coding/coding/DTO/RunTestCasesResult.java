package com.coding.coding.DTO;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "run_testcase_results")
public class RunTestCasesResult {
    @Id
    private String submissionId;
    private String[] outputs;
    private String[] errors;
    private String status;
    // getters and setters
    public String getSubmissionId() { return submissionId; }
    public void setSubmissionId(String submissionId) { this.submissionId = submissionId; }
    public String[] getOutputs() { return outputs; }
    public void setOutputs(String[] outputs) { this.outputs = outputs; }
    public String[] getErrors() { return errors; }
    public void setErrors(String[] errors) { this.errors = errors; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
} 