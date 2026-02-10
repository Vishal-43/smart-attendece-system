package com.qrservice.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record VerifyQRRequest(
    @NotNull(message = "timetableId is required") Long timetableId,
    @NotBlank(message = "qrString is required") String qrString
) {}