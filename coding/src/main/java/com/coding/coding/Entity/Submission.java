package com.coding.coding.Entity;

import lombok.Data;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;

import java.time.LocalDateTime;

@Data
@Document(collection = "submissions")
public class Submission {
    @Id
    private ObjectId id;
    private String userId;
    private String questionId;
    @DBRef
    private Test test;
    private String code;
    private int marks;
    private LocalDateTime submittedAt;
}
