package com.smartattendance.attendance.service;

import com.smartattendance.dto.attendance.AttendanceRecordOut;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.reactive.function.client.ClientResponse;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class AttendanceServiceTest {

    @Test
    void listAttendanceRecordsShouldReturnRecords() {
        String body = "[{\"id\":1,\"student_id\":2,\"teacher_id\":3,\"timetable_id\":4,\"enrollment_id\":5,\"division_id\":6,\"batch_id\":7,\"status\":\"present\"}]";
        WebClient webClient = WebClient.builder()
                .exchangeFunction(request -> {
                    assertEquals("/api/v1/attendance/", request.url().getPath());
                    return Mono.just(ClientResponse.create(HttpStatus.OK)
                            .header("Content-Type", "application/json")
                            .body(body)
                            .build());
                })
                .build();

        AttendanceService service = new AttendanceService(webClient);
        List<AttendanceRecordOut> records = service.listAttendanceRecords();

        assertEquals(1, records.size());
        assertEquals(1, records.get(0).getId());
        assertEquals("present", records.get(0).getStatus());
    }
}
