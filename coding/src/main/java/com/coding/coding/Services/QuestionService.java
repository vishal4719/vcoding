package com.coding.coding.Services;

import com.coding.coding.Entity.Questions;
import com.coding.coding.Repository.QuestionRepository;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class QuestionService {

    @Autowired
    private QuestionRepository questionRepository;

    public Questions getQuestionById(ObjectId id) {
        return questionRepository.findById(id).orElse(null);
    }

    public Questions saveQuestion(Questions question) {
        return questionRepository.save(question);
    }
} 