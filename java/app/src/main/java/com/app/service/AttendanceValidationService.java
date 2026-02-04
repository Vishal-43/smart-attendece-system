package com.app.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AttendanceValidationService {
    
    @Autowired
    private RedisValidationService redisService;
    
    public ValidationResponse validateAttendance(ValidationRequest req) {
        
        // 1. Rate limiting check
        if (redisService.isRateLimited(req.getDeviceId())) {
            throw new RateLimitException("Too many requests");
        }
        
        // 2. Cache geo-fence lookup (vs DB)
        GeoFence fence = redisService.getGeoFence(req.getLocationId());
        if (fence == null) {
            // Cache miss → fetch from DB + cache
            fence = fetchGeoFenceFromDb(req.getLocationId());
            redisService.cacheGeoFence(req.getLocationId(), fence);
        }
        
        // 3. Heavy validation logic...
        boolean gpsValid = haversineDistance(req, fence) < fence.getRadius();
        
        // 4. Publish result to FastAPI WebSocket
        redisService.publishValidationResult(req.getStudentId(), gpsValid);
        
        return new ValidationResponse(gpsValid, 0.95);
    }
}
