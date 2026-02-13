package com.smartattendance.data.service;

import com.smartattendance.dto.locations.LocationCreate;
import com.smartattendance.dto.locations.LocationOut;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class LocationService {

    private final WebClient webClient;

    @Value("${python.backend.url:http://localhost:8000}")
    private String pythonBackendUrl;

    public List<LocationOut> listLocations() {
        try {
            return webClient.get()
                    .uri("/api/v1/locations/")
                    .retrieve()
                    .bodyToFlux(LocationOut.class)
                    .collectList()
                    .block();
        } catch (Exception e) {
            log.error("Failed to list locations: {}", e.getMessage());
            throw new RuntimeException("Failed to fetch locations", e);
        }
    }

    public LocationOut getLocation(Integer locationId) {
        try {
            return webClient.get()
                    .uri("/api/v1/locations/{location_id}", locationId)
                    .retrieve()
                    .bodyToMono(LocationOut.class)
                    .block();
        } catch (Exception e) {
            log.error("Failed to get location {}: {}", locationId, e.getMessage());
            throw new RuntimeException("Failed to fetch location", e);
        }
    }

    public LocationOut createLocation(LocationCreate request) {
        try {
            return webClient.post()
                    .uri("/api/v1/locations/")
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(LocationOut.class)
                    .block();
        } catch (Exception e) {
            log.error("Failed to create location: {}", e.getMessage());
            throw new RuntimeException("Failed to create location", e);
        }
    }

    public LocationOut updateLocation(Integer locationId, LocationCreate request) {
        try {
            return webClient.put()
                    .uri("/api/v1/locations/{location_id}", locationId)
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(LocationOut.class)
                    .block();
        } catch (Exception e) {
            log.error("Failed to update location {}: {}", locationId, e.getMessage());
            throw new RuntimeException("Failed to update location", e);
        }
    }

    public void deleteLocation(Integer locationId) {
        try {
            webClient.delete()
                    .uri("/api/v1/locations/{location_id}", locationId)
                    .retrieve()
                    .toBodilessEntity()
                    .block();
        } catch (Exception e) {
            log.error("Failed to delete location {}: {}", locationId, e.getMessage());
            throw new RuntimeException("Failed to delete location", e);
        }
    }

}
