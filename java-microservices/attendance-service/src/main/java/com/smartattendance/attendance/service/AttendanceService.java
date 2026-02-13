package com.smartattendance.attendance.service;

import com.smartattendance.dto.attendance.AttendanceRecordCreate;
import com.smartattendance.dto.attendance.AttendanceRecordOut;
import com.smartattendance.dto.attendance.AttendanceRecordUpdate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AttendanceService {

    private final WebClient webClient;

    @Value("${python.backend.url:http://localhost:8000}")
    private String pythonBackendUrl;

    public List<AttendanceRecordOut> listAttendanceRecords() {
        try {
            return webClient.get()
                    .uri("/api/v1/attendance/")
                    .retrieve()
                    .bodyToFlux(AttendanceRecordOut.class)
                    .collectList()
                    .block();
        } catch (Exception e) {
            log.error("Failed to list attendance records: {}", e.getMessage());
            throw new RuntimeException("Failed to fetch attendance records", e);
        }
    }

    public List<AttendanceRecordOut> getAttendanceRecord(Integer id) {
        try {
            return webClient.get()
                    .uri("/api/v1/attendance/{id}", id)
                    .retrieve()
                    .bodyToFlux(AttendanceRecordOut.class)
                    .collectList()
                    .block();
        } catch (Exception e) {
            log.error("Failed to get attendance record {}: {}", id, e.getMessage());
            throw new RuntimeException("Failed to fetch attendance record", e);
        }
    }

    public List<AttendanceRecordOut> getAttendanceByStudentId(Integer studentId) {
        try {
            return webClient.get()
                    .uri("/api/v1/attendance/student_id:{id}", studentId)
                    .retrieve()
                    .bodyToFlux(AttendanceRecordOut.class)
                    .collectList()
                    .block();
        } catch (Exception e) {
            log.error("Failed to get attendance for student {}: {}", studentId, e.getMessage());
            throw new RuntimeException("Failed to fetch student attendance records", e);
        }
    }

    public AttendanceRecordOut createAttendanceRecord(AttendanceRecordCreate request) {
        try {
            return webClient.post()
                    .uri("/api/v1/attendance/")
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(AttendanceRecordOut.class)
                    .block();
        } catch (Exception e) {
            log.error("Failed to create attendance record: {}", e.getMessage());
            throw new RuntimeException("Failed to create attendance record", e);
        }
    }

    public AttendanceRecordOut updateAttendanceRecord(Integer recordId, AttendanceRecordUpdate request) {
        try {
            return webClient.put()
                    .uri("/api/v1/attendance/{record_id}", recordId)
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(AttendanceRecordOut.class)
                    .block();
        } catch (Exception e) {
            log.error("Failed to update attendance record {}: {}", recordId, e.getMessage());
            throw new RuntimeException("Failed to update attendance record", e);
        }
    }

    public AttendanceRecordOut deleteAttendanceRecord(Integer recordId) {
        try {
            return webClient.delete()
                    .uri("/api/v1/attendance/{record_id}", recordId)
                    .retrieve()
                    .bodyToMono(AttendanceRecordOut.class)
                    .block();
        } catch (Exception e) {
            log.error("Failed to delete attendance record {}: {}", recordId, e.getMessage());
            throw new RuntimeException("Failed to delete attendance record", e);
        }
    }

}
