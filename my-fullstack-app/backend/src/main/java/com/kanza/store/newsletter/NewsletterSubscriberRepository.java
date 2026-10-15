package com.kanza.store.newsletter;

import org.springframework.data.jpa.repository.JpaRepository;

public interface NewsletterSubscriberRepository extends JpaRepository<NewsletterSubscriber, Long> {

    boolean existsByEmail(String email);
}
