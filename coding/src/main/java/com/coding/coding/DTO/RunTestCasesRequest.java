package com.coding.coding.DTO;

public class RunTestCasesRequest {
    private String submissionId;
    private String code;
    private int languageId;
    private String[] inputs;
    // getters and setters
    public String getSubmissionId() { return submissionId; }
    public void setSubmissionId(String submissionId) { this.submissionId = submissionId; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public int getLanguageId() { return languageId; }
    public void setLanguageId(int languageId) { this.languageId = languageId; }
    public String[] getInputs() { return inputs; }
    public void setInputs(String[] inputs) { this.inputs = inputs; }
} 