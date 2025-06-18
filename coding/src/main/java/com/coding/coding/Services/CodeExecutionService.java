package com.coding.coding.Services;

import com.coding.coding.DTO.CodeExecutionRequest;
import com.coding.coding.DTO.CodeExecutionResponse;
import com.coding.coding.Entity.Questions;
import org.springframework.stereotype.Service;
import java.io.*;
import java.util.concurrent.*;

@Service
public class CodeExecutionService {
    
    public CodeExecutionResponse executeCode(CodeExecutionRequest request, Questions question) {
        CodeExecutionResponse response = new CodeExecutionResponse();
        
        try {
            // Create a temporary file for the code
            File codeFile = createTempFile(request.getCode(), request.getLanguage());
            
            // Execute the code with time and memory limits
            ProcessBuilder processBuilder = new ProcessBuilder();
            processBuilder.command(getExecutionCommand(request.getLanguage(), codeFile.getPath()));
            
            // Set memory limit
            processBuilder.environment().put("JAVA_OPTS", "-Xmx" + question.getMemoryLimit() + "m");
            
            Process process = processBuilder.start();
            
            // Set up timeout
            ExecutorService executor = Executors.newSingleThreadExecutor();
            Future<?> future = executor.submit(() -> {
                try {
                    // Write test case input to process
                    try (OutputStreamWriter writer = new OutputStreamWriter(process.getOutputStream())) {
                        // Get the first test case input
                        if (!question.getTestCases().isEmpty()) {
                            Questions.TestCase testCase = question.getTestCases().get(0);
                            writer.write(testCase.getInput());
                            writer.flush();
                        }
                    }
                    
                    // Read output
                    try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                        StringBuilder output = new StringBuilder();
                        String line;
                        while ((line = reader.readLine()) != null) {
                            output.append(line).append("\n");
                        }
                        response.setOutput(output.toString().trim());
                    }
                    
                    // Read error if any
                    try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getErrorStream()))) {
                        StringBuilder error = new StringBuilder();
                        String line;
                        while ((line = reader.readLine()) != null) {
                            error.append(line).append("\n");
                        }
                        if (error.length() > 0) {
                            response.setError(error.toString().trim());
                        }
                    }
                } catch (IOException e) {
                    response.setError("Error during code execution: " + e.getMessage());
                }
            });
            
            // Wait for execution with timeout
            try {
                future.get(question.getTimeLimit(), TimeUnit.MILLISECONDS);
                response.setSuccess(true);
            } catch (TimeoutException e) {
                process.destroyForcibly();
                response.setError("Time Limit Exceeded: Code execution took longer than " + question.getTimeLimit() + "ms");
                response.setSuccess(false);
            } catch (ExecutionException e) {
                response.setError("Execution Error: " + e.getCause().getMessage());
                response.setSuccess(false);
            } catch (InterruptedException e) {
                response.setError("Execution Interrupted: " + e.getMessage());
                response.setSuccess(false);
            } finally {
                executor.shutdownNow();
            }
            
            // Clean up
            codeFile.delete();
            
        } catch (Exception e) {
            response.setError("Error: " + e.getMessage());
            response.setSuccess(false);
        }
        
        return response;
    }
    
    private File createTempFile(String code, String language) throws IOException {
        String extension = getFileExtension(language);
        File tempFile = File.createTempFile("code", extension);
        try (FileWriter writer = new FileWriter(tempFile)) {
            writer.write(code);
        }
        return tempFile;
    }
    
    private String[] getExecutionCommand(String language, String filePath) {
        switch (language.toLowerCase()) {
            case "java":
                return new String[]{"java", filePath};
            case "python":
                return new String[]{"python", filePath};
            case "cpp":
                return new String[]{"g++", filePath, "-o", filePath + ".exe", "&&", filePath + ".exe"};
            default:
                throw new IllegalArgumentException("Unsupported language: " + language);
        }
    }
    
    private String getFileExtension(String language) {
        switch (language.toLowerCase()) {
            case "java":
                return ".java";
            case "python":
                return ".py";
            case "cpp":
                return ".cpp";
            default:
                throw new IllegalArgumentException("Unsupported language: " + language);
        }
    }
} 