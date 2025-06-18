package com.coding.coding.Services;

import com.coding.coding.Entity.Questions;
import com.coding.coding.Repository.QuestionsRepository;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class QuestionsService {

    @Autowired
    private QuestionsRepository questionsRepository;

    public Questions addQuestion(Questions question) {
        return questionsRepository.save(question);
    }

    public List<Questions> getAllQuestions() {
        return questionsRepository.findAll();
    }

    public Optional<Questions> getQuestionById(ObjectId id) {
        return questionsRepository.findById(id);
    }


    public List<Questions> addMultipleQuestions(List<Questions> questions) {
        return questionsRepository.saveAll(questions);
    }

}

