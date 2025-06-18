package com.coding.coding.Entity;

import java.util.List;

import lombok.Data;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

@Data
@Document(collection = "questions")
public class Questions {
    @Id
    @JsonIgnore // Ignore the default ObjectId serialization
    private ObjectId id;
    private String title;
    private String description;
    private String difficulty;  // "Easy", "Medium", "Hard"
    private String inputFormat;
    private String outputFormat;
    private String sampleInput;
    private String sampleOutput;
    private List<TestCase> testCases;
    private List<String> expectedOutputs;
    private Integer timeLimit; // Time limit in milliseconds
    private Integer memoryLimit; // Memory limit in MB
    private String complexity; // EASY, MEDIUM, HARD

    @DBRef
    private User createdBy;
    @Data
    public static class TestCase {
        private String input;
        private String output;
    }

    // Custom getter to return id as String for JSON serialization
    @JsonProperty("id") // Map this method to the "id" JSON property
    public String getQuestionId() {
        return id != null ? id.toHexString() : null;
    }
}







