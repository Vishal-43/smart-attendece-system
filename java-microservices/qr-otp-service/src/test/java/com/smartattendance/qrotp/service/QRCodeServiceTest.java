package com.smartattendance.qrotp.service;

import com.smartattendance.dto.codes.QRCodeOut;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.reactive.function.client.ClientResponse;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class QRCodeServiceTest {

    @Test
    void listAllQRCodesShouldReturnCodes() {
        String body = "[{\"id\":10,\"timetable_id\":4,\"code\":\"abc123\"}]";
        WebClient webClient = WebClient.builder()
                .exchangeFunction(request -> {
                    assertEquals("/api/v1/codes/", request.url().getPath());
                    return Mono.just(ClientResponse.create(HttpStatus.OK)
                            .header("Content-Type", "application/json")
                            .body(body)
                            .build());
                })
                .build();

        QRCodeService service = new QRCodeService(webClient);
        List<QRCodeOut> records = service.listAllQRCodes();

        assertEquals(1, records.size());
        assertEquals(10, records.get(0).getId());
    }
}
