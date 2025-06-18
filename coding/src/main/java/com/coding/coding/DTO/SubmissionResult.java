package com.coding.coding.DTO;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "results")
public class SubmissionResult {
    @Id
    private String submissionId;
    private String output;
    private String error;
    private String status;
    // getters and setters
    public String getSubmissionId() { return submissionId; }
    public void setSubmissionId(String submissionId) { this.submissionId = submissionId; }
    public String getOutput() { return output; }
    public void setOutput(String output) { this.output = output; }
    public String getError() { return error; }
    public void setError(String error) { this.error = error; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
} 