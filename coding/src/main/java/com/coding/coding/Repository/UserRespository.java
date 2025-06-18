package com.coding.coding.Repository;

import com.coding.coding.Entity.User;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRespository extends MongoRepository<User, ObjectId> {
    User findByEmail(String email);
}