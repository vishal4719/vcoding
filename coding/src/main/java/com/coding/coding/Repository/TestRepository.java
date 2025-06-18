package com.coding.coding.Repository;

import com.coding.coding.Entity.Test;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TestRepository extends MongoRepository<Test, ObjectId> {
    List<Test> findByUserId(ObjectId userId);
    List<Test> findByStartDateTimeBeforeAndEndDateTimeAfter(LocalDateTime now, LocalDateTime now2);
    List<Test> findByIsActiveTrue();
    List<Test> findByIsActiveFalse();
    List<Test> findByQuestions_Id(ObjectId questionId);
} 