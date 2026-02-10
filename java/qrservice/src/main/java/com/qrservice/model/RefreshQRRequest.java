package com.qrservice.model;

public record RefreshQRRequest(
    String oldQRString  // Current QR string from DB
) {}