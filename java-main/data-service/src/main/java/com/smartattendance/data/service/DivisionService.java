package com.smartattendance.data.service;

import com.smartattendance.dto.divisions.DivisionCreate;
import com.smartattendance.dto.divisions.DivisionOut;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class DivisionService {

    private final WebClient webClient;

    @Value("${python.backend.url:http://localhost:8000}")
    private String pythonBackendUrl;

    public List<DivisionOut> listAllDivisions() {
        try {
            return webClient.get()
                    .uri("/api/v1/divisions/")
                    .retrieve()
                    .bodyToFlux(DivisionOut.class)
                    .collectList()
                    .block();
        } catch (Exception e) {
            log.error("Failed to list divisions: {}", e.getMessage());
            throw new RuntimeException("Failed to fetch divisions", e);
        }
    }

    public List<DivisionOut> listByCourse(Integer courseId) {
        try {
            return webClient.get()
                    .uri("/api/v1/divisions/course:{course_id}", courseId)
                    .retrieve()
                    .bodyToFlux(DivisionOut.class)
                    .collectList()
                    .block();
        } catch (Exception e) {
            log.error("Failed to get divisions for course {}: {}", courseId, e.getMessage());
            throw new RuntimeException("Failed to fetch divisions for course", e);
        }
    }

    public List<DivisionOut> listByBranch(Integer branchId) {
        try {
            return webClient.get()
                    .uri("/api/v1/divisions/branch_id:{branch_id}", branchId)
                    .retrieve()
                    .bodyToFlux(DivisionOut.class)
                    .collectList()
                    .block();
        } catch (Exception e) {
            log.error("Failed to get divisions for branch {}: {}", branchId, e.getMessage());
            throw new RuntimeException("Failed to fetch divisions for branch", e);
        }
    }

    public DivisionOut createDivision(DivisionCreate request) {
        try {
            return webClient.post()
                    .uri("/api/v1/divisions/")
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(DivisionOut.class)
                    .block();
        } catch (Exception e) {
            log.error("Failed to create division: {}", e.getMessage());
            throw new RuntimeException("Failed to create division", e);
        }
    }

    public DivisionOut updateDivision(Integer divisionId, DivisionCreate request) {
        try {
            return webClient.put()
                    .uri("/api/v1/divisions/{division_id}", divisionId)
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(DivisionOut.class)
                    .block();
        } catch (Exception e) {
            log.error("Failed to update division {}: {}", divisionId, e.getMessage());
            throw new RuntimeException("Failed to update division", e);
        }
    }

    public void deleteDivision(Integer divisionId) {
        try {
            webClient.delete()
                    .uri("/api/v1/divisions/{division_id}", divisionId)
                    .retrieve()
                    .toBodilessEntity()
                    .block();
        } catch (Exception e) {
            log.error("Failed to delete division {}: {}", divisionId, e.getMessage());
            throw new RuntimeException("Failed to delete division", e);
        }
    }

}
