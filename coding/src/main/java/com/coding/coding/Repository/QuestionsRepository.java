package com.coding.coding.Repository;


import com.coding.coding.Entity.Questions;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QuestionsRepository extends MongoRepository<Questions, ObjectId> {
    // You can add custom queries if needed later
}
