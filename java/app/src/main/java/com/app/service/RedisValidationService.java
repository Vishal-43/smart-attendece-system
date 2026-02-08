package com.app.service;

import java.time.Duration;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

@Service
public class RedisValidationService {
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    // Cache geo-fence data (TTL 1 hour)
    public void cacheGeoFence(String locationId, GeoFence fence) {
        redisTemplate.opsForValue().set(
            "geofence:" + locationId, 
            fence, 
            Duration.ofHours(1)
        );
    }
    
    public GeoFence getGeoFence(String locationId) {
        return (GeoFence) redisTemplate.opsForValue().get("geofence:" + locationId);
    }
    
    // Rate limiting: 100 validations/min per device
    public boolean isRateLimited(String deviceId) {
        String key = "rate:device:" + deviceId;
        Long count = redisTemplate.opsForValue().increment(key);
        
        if (count == 1) {
            redisTemplate.expire(key, Duration.ofMinutes(1));
        }
        
        return count > 100;
    }
    
    // Pub/Sub: Notify FastAPI of validation results
    public void publishValidationResult(String studentId, boolean isValid) {
        redisTemplate.convertAndSend("attendance-validated", 
            Map.of("studentId", studentId, "isValid", isValid));
    }
}

