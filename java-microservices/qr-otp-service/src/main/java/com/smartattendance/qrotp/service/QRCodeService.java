package com.smartattendance.qrotp.service;

import com.smartattendance.dto.codes.QRCodeCreate;
import com.smartattendance.dto.codes.QRCodeOut;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class QRCodeService {

    private final WebClient webClient;

    @Value("${python.backend.url:http://localhost:8000}")
    private String pythonBackendUrl;

    public List<QRCodeOut> listAllQRCodes() {
        try {
            return webClient.get()
                    .uri("/api/v1/codes/")
                    .retrieve()
                    .bodyToFlux(QRCodeOut.class)
                    .collectList()
                    .block();
        } catch (Exception e) {
            log.error("Failed to list QR codes: {}", e.getMessage());
            throw new RuntimeException("Failed to fetch QR codes", e);
        }
    }

    public List<QRCodeOut> getQRCodesByTimetableId(Integer timetableId) {
        try {
            return webClient.get()
                    .uri("/api/v1/codes/timetable_id:{id}", timetableId)
                    .retrieve()
                    .bodyToFlux(QRCodeOut.class)
                    .collectList()
                    .block();
        } catch (Exception e) {
            log.error("Failed to get QR codes for timetable {}: {}", timetableId, e.getMessage());
            throw new RuntimeException("Failed to fetch QR codes for timetable", e);
        }
    }

    public QRCodeOut createQRCode(QRCodeCreate request) {
        try {
            return webClient.post()
                    .uri("/api/v1/codes/qr_code")
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(QRCodeOut.class)
                    .block();
        } catch (Exception e) {
            log.error("Failed to create QR code: {}", e.getMessage());
            throw new RuntimeException("Failed to create QR code", e);
        }
    }

    public QRCodeOut deleteQRCode(Integer codeId) {
        try {
            return webClient.delete()
                    .uri("/api/v1/codes/qr_code/{code_id}", codeId)
                    .retrieve()
                    .bodyToMono(QRCodeOut.class)
                    .block();
        } catch (Exception e) {
            log.error("Failed to delete QR code {}: {}", codeId, e.getMessage());
            throw new RuntimeException("Failed to delete QR code", e);
        }
    }

}
