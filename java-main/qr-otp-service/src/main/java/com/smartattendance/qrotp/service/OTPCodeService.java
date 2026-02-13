package com.smartattendance.qrotp.service;

import com.smartattendance.dto.codes.OTPCodeCreate;
import com.smartattendance.dto.codes.OTPCodeOut;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class OTPCodeService {

    private final WebClient webClient;

    @Value("${python.backend.url:http://localhost:8000}")
    private String pythonBackendUrl;

    public List<OTPCodeOut> listAllOTPCodes() {
        try {
            return webClient.get()
                    .uri("/api/v1/codes/")
                    .retrieve()
                    .bodyToFlux(OTPCodeOut.class)
                    .collectList()
                    .block();
        } catch (Exception e) {
            log.error("Failed to list OTP codes: {}", e.getMessage());
            throw new RuntimeException("Failed to fetch OTP codes", e);
        }
    }

    public List<OTPCodeOut> getOTPCodesByTimetableId(Integer timetableId) {
        try {
            return webClient.get()
                    .uri("/api/v1/codes/timetable_id:{id}", timetableId)
                    .retrieve()
                    .bodyToFlux(OTPCodeOut.class)
                    .collectList()
                    .block();
        } catch (Exception e) {
            log.error("Failed to get OTP codes for timetable {}: {}", timetableId, e.getMessage());
            throw new RuntimeException("Failed to fetch OTP codes for timetable", e);
        }
    }

    public OTPCodeOut createOTPCode(OTPCodeCreate request) {
        try {
            return webClient.post()
                    .uri("/api/v1/codes/otp_code")
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(OTPCodeOut.class)
                    .block();
        } catch (Exception e) {
            log.error("Failed to create OTP code: {}", e.getMessage());
            throw new RuntimeException("Failed to create OTP code", e);
        }
    }

    public OTPCodeOut deleteOTPCode(Integer codeId) {
        try {
            return webClient.delete()
                    .uri("/api/v1/codes/otp_code/{code_id}", codeId)
                    .retrieve()
                    .bodyToMono(OTPCodeOut.class)
                    .block();
        } catch (Exception e) {
            log.error("Failed to delete OTP code {}: {}", codeId, e.getMessage());
            throw new RuntimeException("Failed to delete OTP code", e);
        }
    }

}
