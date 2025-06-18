package com.coding.coding.DTO;

import lombok.Data;

@Data
public class CodeExecutionResponse {
    private boolean success;
    private String output;
    private String error;
    private Long executionTime; // in milliseconds
    private Long memoryUsed; // in MB
} 