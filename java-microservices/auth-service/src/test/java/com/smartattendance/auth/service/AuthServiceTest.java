package com.smartattendance.auth.service;

import com.smartattendance.dto.auth.AuthLoginRequest;
import com.smartattendance.dto.auth.AuthTokens;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.reactive.function.client.ClientResponse;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import static org.junit.jupiter.api.Assertions.assertEquals;

class AuthServiceTest {

    @Test
    void loginShouldProxyAndDeserializeTokens() {
        String body = "{\"access_token\":\"acc\",\"refresh_token\":\"ref\"}";
        WebClient webClient = WebClient.builder()
                .exchangeFunction(request -> {
                    assertEquals("/api/v1/auth/login", request.url().getPath());
                    return Mono.just(ClientResponse.create(HttpStatus.OK)
                            .header("Content-Type", "application/json")
                            .body(body)
                            .build());
                })
                .build();

        AuthService service = new AuthService(webClient);
        AuthTokens tokens = service.login(new AuthLoginRequest("a@test.com", "secret", null));

        assertEquals("acc", tokens.getAccess_token());
        assertEquals("ref", tokens.getRefresh_token());
    }
}
