package com.coding.coding.DTO;

import lombok.Data;

@Data
public class CodeExecutionRequest {
    private String code;
    private String language;
    private String questionId;
} 