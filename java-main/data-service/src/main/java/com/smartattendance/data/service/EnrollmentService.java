package com.smartattendance.data.service;

import com.smartattendance.dto.enrollments.EnrollmentCreate;
import com.smartattendance.dto.enrollments.EnrollmentOut;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class EnrollmentService {

    private final WebClient webClient;

    @Value("${python.backend.url:http://localhost:8000}")
    private String pythonBackendUrl;

    public List<EnrollmentOut> listEnrollments() {
        try {
            return webClient.get()
                    .uri("/api/v1/enrollments/")
                    .retrieve()
                    .bodyToFlux(EnrollmentOut.class)
                    .collectList()
                    .block();
        } catch (Exception e) {
            log.error("Failed to list enrollments: {}", e.getMessage());
            throw new RuntimeException("Failed to fetch enrollments", e);
        }
    }

    public List<EnrollmentOut> getEnrollmentById(Integer id) {
        try {
            return webClient.get()
                    .uri("/api/v1/enrollments/id:{id}", id)
                    .retrieve()
                    .bodyToFlux(EnrollmentOut.class)
                    .collectList()
                    .block();
        } catch (Exception e) {
            log.error("Failed to get enrollment {}: {}", id, e.getMessage());
            throw new RuntimeException("Failed to fetch enrollment", e);
        }
    }

    public List<EnrollmentOut> getByStudent(Integer studentId) {
        try {
            return webClient.get()
                    .uri("/api/v1/enrollments/student_id:{id}", studentId)
                    .retrieve()
                    .bodyToFlux(EnrollmentOut.class)
                    .collectList()
                    .block();
        } catch (Exception e) {
            log.error("Failed to get enrollments for student {}: {}", studentId, e.getMessage());
            throw new RuntimeException("Failed to fetch student enrollments", e);
        }
    }

    public List<EnrollmentOut> getByCourse(Integer courseId) {
        try {
            return webClient.get()
                    .uri("/api/v1/enrollments/course_id:{id}", courseId)
                    .retrieve()
                    .bodyToFlux(EnrollmentOut.class)
                    .collectList()
                    .block();
        } catch (Exception e) {
            log.error("Failed to get enrollments for course {}: {}", courseId, e.getMessage());
            throw new RuntimeException("Failed to fetch course enrollments", e);
        }
    }

    public List<EnrollmentOut> getByBranch(Integer branchId) {
        try {
            return webClient.get()
                    .uri("/api/v1/enrollments/branch_id:{id}", branchId)
                    .retrieve()
                    .bodyToFlux(EnrollmentOut.class)
                    .collectList()
                    .block();
        } catch (Exception e) {
            log.error("Failed to get enrollments for branch {}: {}", branchId, e.getMessage());
            throw new RuntimeException("Failed to fetch branch enrollments", e);
        }
    }

    public List<EnrollmentOut> getByDivision(Integer divisionId) {
        try {
            return webClient.get()
                    .uri("/api/v1/enrollments/division_id:{id}", divisionId)
                    .retrieve()
                    .bodyToFlux(EnrollmentOut.class)
                    .collectList()
                    .block();
        } catch (Exception e) {
            log.error("Failed to get enrollments for division {}: {}", divisionId, e.getMessage());
            throw new RuntimeException("Failed to fetch division enrollments", e);
        }
    }

    public EnrollmentOut createEnrollment(EnrollmentCreate request) {
        try {
            return webClient.post()
                    .uri("/api/v1/enrollments/")
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(EnrollmentOut.class)
                    .block();
        } catch (Exception e) {
            log.error("Failed to create enrollment: {}", e.getMessage());
            throw new RuntimeException("Failed to create enrollment", e);
        }
    }

    public EnrollmentOut updateEnrollment(Integer id, EnrollmentCreate request) {
        try {
            return webClient.put()
                    .uri("/api/v1/enrollments/{id}", id)
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(EnrollmentOut.class)
                    .block();
        } catch (Exception e) {
            log.error("Failed to update enrollment {}: {}", id, e.getMessage());
            throw new RuntimeException("Failed to update enrollment", e);
        }
    }

    public void deleteEnrollment(Integer id) {
        try {
            webClient.delete()
                    .uri("/api/v1/enrollments/{id}", id)
                    .retrieve()
                    .toBodilessEntity()
                    .block();
        } catch (Exception e) {
            log.error("Failed to delete enrollment {}: {}", id, e.getMessage());
            throw new RuntimeException("Failed to delete enrollment", e);
        }
    }

}
