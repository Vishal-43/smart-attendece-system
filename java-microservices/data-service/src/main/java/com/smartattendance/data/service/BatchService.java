package com.smartattendance.data.service;

import com.smartattendance.dto.batches.BatchCreate;
import com.smartattendance.dto.batches.BatchOut;
import com.smartattendance.dto.batches.BatchUpdate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class BatchService {

    private final WebClient webClient;

    @Value("${python.backend.url:http://localhost:8000}")
    private String pythonBackendUrl;

    public List<BatchOut> listAllBatches() {
        try {
            return webClient.get()
                    .uri("/api/v1/batches/")
                    .retrieve()
                    .bodyToFlux(BatchOut.class)
                    .collectList()
                    .block();
        } catch (Exception e) {
            log.error("Failed to list batches: {}", e.getMessage());
            throw new RuntimeException("Failed to fetch batches", e);
        }
    }

    public List<BatchOut> listByDivision(Integer divisionId) {
        try {
            return webClient.get()
                    .uri("/api/v1/batches/division_id:{division_id}", divisionId)
                    .retrieve()
                    .bodyToFlux(BatchOut.class)
                    .collectList()
                    .block();
        } catch (Exception e) {
            log.error("Failed to get batches for division {}: {}", divisionId, e.getMessage());
            throw new RuntimeException("Failed to fetch batches for division", e);
        }
    }

    public BatchOut createBatch(BatchCreate request) {
        try {
            return webClient.post()
                    .uri("/api/v1/batches/")
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(BatchOut.class)
                    .block();
        } catch (Exception e) {
            log.error("Failed to create batch: {}", e.getMessage());
            throw new RuntimeException("Failed to create batch", e);
        }
    }

    public BatchOut updateBatch(Integer batchId, BatchUpdate request) {
        try {
            return webClient.put()
                    .uri("/api/v1/batches/{batch_id}", batchId)
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(BatchOut.class)
                    .block();
        } catch (Exception e) {
            log.error("Failed to update batch {}: {}", batchId, e.getMessage());
            throw new RuntimeException("Failed to update batch", e);
        }
    }

    public void deleteBatch(Integer batchId) {
        try {
            webClient.delete()
                    .uri("/api/v1/batches/batch_id:{batch_id}", batchId)
                    .retrieve()
                    .toBodilessEntity()
                    .block();
        } catch (Exception e) {
            log.error("Failed to delete batch {}: {}", batchId, e.getMessage());
            throw new RuntimeException("Failed to delete batch", e);
        }
    }

}
