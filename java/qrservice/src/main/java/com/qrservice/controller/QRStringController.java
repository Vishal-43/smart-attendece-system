package com.qrservice.controller;

@RestController
@RequestMapping("/api/v1/qr")
public class QRStringController {
    
    @Autowired
    private QRStringService qrService;

    // 1. Admin generates initial QR string
    @PostMapping("/generate")
    public ResponseEntity<QRStringResponse> generateQR(
            @Valid @RequestBody GenerateQRRequest request) {
        QRStringResponse response = qrService.generateQRString(request);
        return ResponseEntity.ok(response);
    }

    // 2. Get current active QR string (for frontend)
    @GetMapping("/current/{timetableId}")
    public ResponseEntity<QRStringResponse> getCurrentQR(
            @PathVariable Long timetableId) {
        QRStringResponse response = qrService.getCurrentQR(timetableId);
        return ResponseEntity.ok(response);
    }

    // 3. Verify scanned QR string
    @PostMapping("/verify")
    public ResponseEntity<Boolean> verifyQR(
            @Valid @RequestBody VerifyQRRequest request) {
        boolean valid = qrService.verifyQR(request);
        return ResponseEntity.ok(valid);
    }

    // 4. NEW: Refresh QR token (called every 30s by Python)
    @PostMapping("/refresh/{timetableId}")
    public ResponseEntity<QRStringResponse> refreshQR(
            @PathVariable Long timetableId,
            @RequestBody RefreshQRRequest request) {
        // Validate old token matches current DB record
        if (!qrService.isValidRefreshToken(timetableId, request.oldQRString())) {
            return ResponseEntity.badRequest().build();
        }
        
        // Generate NEW string, REPLACE old one in DB
        QRStringResponse newQR = qrService.refreshQRString(timetableId);
        return ResponseEntity.ok(newQR);
    }
}
