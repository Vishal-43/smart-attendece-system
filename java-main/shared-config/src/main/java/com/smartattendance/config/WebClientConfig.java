package com.smartattendance.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Value("${python.backend.url:http://localhost:8000}")
    private String pythonBackendUrl;

    @Bean
    public WebClient webClient(WebClient.Builder builder) {
        return builder
                .baseUrl(pythonBackendUrl)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

}
