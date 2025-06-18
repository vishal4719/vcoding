package com.coding.coding.Config;

import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
@Profile("worker")
public class WorkerConfig {
    
    @Value("${worker.id:worker-1}")
    private String workerId;
    
    @Bean
    public Queue codeSubmissionsQueue() {
        return new Queue("code-submissions", true);
    }

    @Bean
    public Queue runCodeQueue() {
        return new Queue("run-code", true);
    }

    @Bean
    public Queue runTestCasesQueue() {
        return new Queue("run-test-cases", true);
    }

    @Bean
    public Jackson2JsonMessageConverter jackson2JsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jackson2JsonMessageConverter());
        return template;
    }
    
    @Bean
    public String workerId() {
        return workerId;
    }
} 