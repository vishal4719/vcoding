package com.coding.coding.Entity;

import lombok.Data;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Document(collection = "tests")
public class Test {
    @Id
    private ObjectId id;

    // Add this getter to properly serialize the ID
    public String getId() {
        return id != null ? id.toHexString() : null;
    }

    // Add this setter to handle string IDs
    public void setId(String id) {
        this.id = id != null ? new ObjectId(id) : null;
    }

    private String testLink;
    private String testName; // Add test name for better identification
    private String description; // Optional description
    private LocalDateTime startDateTime;
    private LocalDateTime endDateTime;
    private int duration; // Duration in minutes
    private int maxAttempts; // Maximum attempts per user (default 1)

    @DBRef
    private List<Questions> questions;

     @DBRef
     private User user;

    private boolean isActive = true;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructor
    public Test() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.maxAttempts = 1; // Default to 1 attempt
    }
}