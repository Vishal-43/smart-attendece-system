package com.qrservice.model;

import jakarta.validation.constraints.NotNull;

public record TimetableIdRequest(
    @NotNull Long timetableId
) {}