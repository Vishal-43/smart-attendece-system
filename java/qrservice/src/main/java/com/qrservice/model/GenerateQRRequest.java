package com.qrservice.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record GenerateQRRequest(
    @NotNull(message = "timetableId is required") Long timetableId,
    @NotBlank(message = "userToken is required for admin") String userToken
) {}