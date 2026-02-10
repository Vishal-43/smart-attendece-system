package com.qrservice.model;

public record QRStringResponse(
    String qrString,
    String expiresAt,
    boolean active
) {}