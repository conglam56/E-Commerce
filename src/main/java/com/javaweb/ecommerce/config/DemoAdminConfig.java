package com.javaweb.ecommerce.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.javaweb.ecommerce.repository.UserRepository;

@Configuration
@ConditionalOnProperty(name = "demo.admin.email")
public class DemoAdminConfig {

    @Bean
    public ApplicationRunner promoteDemoAdmin(UserRepository users,
            @Value("${demo.admin.email}") String email) {
        return arguments -> {
            var user = users.findByEmail(email)
                    .orElseThrow(() -> new IllegalStateException("Register the configured demo admin before deployment."));
            if (!user.isEnabled()) {
                throw new IllegalStateException("The configured demo account must be active.");
            }
            if (!"ADMIN".equals(user.getRole())) {
                user.setRole("ADMIN");
                users.save(user);
            }
        };
    }
}
