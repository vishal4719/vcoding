package com.coding.coding.Repository;


import com.coding.coding.Entity.AllowedDomain;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface AllowedDomainRepository extends MongoRepository<AllowedDomain, String> {
    boolean existsByDomain(String domain);
}
