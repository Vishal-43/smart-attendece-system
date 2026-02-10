package com.qrservice.service;

@Service
public class QRStringService {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    private static final int QR_EXPIRY_SECONDS = 30;

    // ... existing methods (generate, getCurrent, verify) ...

    public QRStringResponse refreshQRString(Long timetableId) {
        // 1. Generate NEW random string
        String newQRString = generateRandomQRString();
        LocalDateTime expiresAt = LocalDateTime.now().plusSeconds(QR_EXPIRY_SECONDS);
        
        // 2. REPLACE old record for this timetableId
        String sql = """
            UPDATE qrcodes 
            SET code = ?, expires_at = NOW() + INTERVAL '%d seconds', 
                created_at = NOW(), is_used = false
            WHERE timetable_id = ?
            """.formatted(QR_EXPIRY_SECONDS);
            
        int updated = jdbcTemplate.update(sql, newQRString, expiresAt, timetableId);
        
        if (updated == 0) {
            // No existing record - create new
            saveQRString(timetableId, newQRString, expiresAt);
        }
        
        return new QRStringResponse(newQRString, expiresAt.toString(), true);
    }

    public boolean isValidRefreshToken(Long timetableId, String oldQRString) {
        String sql = """
            SELECT COUNT(*) > 0 FROM qrcodes 
            WHERE timetable_id = ? AND code = ? AND expires_at > NOW()
            """;
        return Boolean.TRUE.equals(
            jdbcTemplate.queryForObject(sql, Boolean.class, timetableId, oldQRString)
        );
    }

    private String generateRandomQRString() {
        return "QR_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
    }
}
