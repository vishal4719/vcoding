package com.coding.coding.Repository;

import com.coding.coding.Entity.Submission;
import com.coding.coding.Entity.Test;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface SubmissionRepository extends MongoRepository<Submission, ObjectId> {
    Submission findByUserIdAndQuestionId(String userId, String questionId);
    java.util.List<Submission> findByTestId(String testId);
    java.util.List<Submission> findByTest(Test test);
    java.util.List<Submission> findByTest_Id(String testId);
}