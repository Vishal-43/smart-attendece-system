package com.smartattendance.data.service;

import com.smartattendance.dto.users.UserOut;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.reactive.function.client.ClientResponse;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class UserServiceTest {

    @Test
    void listUsersShouldReturnUsers() {
        String body = "[{\"id\":1,\"email\":\"admin@test.com\",\"username\":\"admin\",\"role\":\"admin\",\"is_active\":true}]";
        WebClient webClient = WebClient.builder()
                .exchangeFunction(request -> {
                    assertEquals("/api/v1/users/", request.url().getPath());
                    return Mono.just(ClientResponse.create(HttpStatus.OK)
                            .header("Content-Type", "application/json")
                            .body(body)
                            .build());
                })
                .build();

        UserService service = new UserService(webClient);
        List<UserOut> users = service.listUsers();

        assertEquals(1, users.size());
        assertEquals("admin", users.get(0).getUsername());
    }
}
