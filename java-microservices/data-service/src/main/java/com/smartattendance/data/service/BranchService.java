package com.smartattendance.data.service;

import com.smartattendance.dto.branches.BranchCreate;
import com.smartattendance.dto.branches.BranchOut;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class BranchService {

    private final WebClient webClient;

    @Value("${python.backend.url:http://localhost:8000}")
    private String pythonBackendUrl;

    public List<BranchOut> listAllBranches() {
        try {
            return webClient.get()
                    .uri("/api/v1/branches/")
                    .retrieve()
                    .bodyToFlux(BranchOut.class)
                    .collectList()
                    .block();
        } catch (Exception e) {
            log.error("Failed to list branches: {}", e.getMessage());
            throw new RuntimeException("Failed to fetch branches", e);
        }
    }

    public List<BranchOut> listByCourse(Integer courseId) {
        try {
            return webClient.get()
                    .uri("/api/v1/branches/course_id:{course_id}", courseId)
                    .retrieve()
                    .bodyToFlux(BranchOut.class)
                    .collectList()
                    .block();
        } catch (Exception e) {
            log.error("Failed to get branches for course {}: {}", courseId, e.getMessage());
            throw new RuntimeException("Failed to fetch branches for course", e);
        }
    }

    public BranchOut getBranchById(Integer branchId) {
        try {
            return webClient.get()
                    .uri("/api/v1/branches/branch_id:{branch_id}", branchId)
                    .retrieve()
                    .bodyToMono(BranchOut.class)
                    .block();
        } catch (Exception e) {
            log.error("Failed to get branch {}: {}", branchId, e.getMessage());
            throw new RuntimeException("Failed to fetch branch", e);
        }
    }

    public BranchOut createBranch(BranchCreate request) {
        try {
            return webClient.post()
                    .uri("/api/v1/branches/")
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(BranchOut.class)
                    .block();
        } catch (Exception e) {
            log.error("Failed to create branch: {}", e.getMessage());
            throw new RuntimeException("Failed to create branch", e);
        }
    }

    public BranchOut updateBranch(Integer branchId, BranchCreate request) {
        try {
            return webClient.put()
                    .uri("/api/v1/branches/{branch_id}", branchId)
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(BranchOut.class)
                    .block();
        } catch (Exception e) {
            log.error("Failed to update branch {}: {}", branchId, e.getMessage());
            throw new RuntimeException("Failed to update branch", e);
        }
    }

    public void deleteBranch(Integer branchId) {
        try {
            webClient.delete()
                    .uri("/api/v1/branches/{branch_id}", branchId)
                    .retrieve()
                    .toBodilessEntity()
                    .block();
        } catch (Exception e) {
            log.error("Failed to delete branch {}: {}", branchId, e.getMessage());
            throw new RuntimeException("Failed to delete branch", e);
        }
    }

}
