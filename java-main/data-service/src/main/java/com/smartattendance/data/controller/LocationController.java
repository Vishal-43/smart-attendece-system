package com.smartattendance.data.controller;

import com.smartattendance.dto.locations.LocationCreate;
import com.smartattendance.dto.locations.LocationOut;
import com.smartattendance.data.service.LocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/locations")
@RequiredArgsConstructor
public class LocationController {

    private final LocationService locationService;

    @GetMapping("/")
    public ResponseEntity<List<LocationOut>> listLocations() {
        return ResponseEntity.ok(locationService.listLocations());
    }

    @GetMapping("/{location_id}")
    public ResponseEntity<LocationOut> getLocation(@PathVariable Integer location_id) {
        return ResponseEntity.ok(locationService.getLocation(location_id));
    }

    @PostMapping("/")
    public ResponseEntity<LocationOut> createLocation(@RequestBody LocationCreate request) {
        return ResponseEntity.ok(locationService.createLocation(request));
    }

    @PutMapping("/{location_id}")
    public ResponseEntity<LocationOut> updateLocation(@PathVariable Integer location_id, @RequestBody LocationCreate request) {
        return ResponseEntity.ok(locationService.updateLocation(location_id, request));
    }

    @DeleteMapping("/{location_id}")
    public ResponseEntity<Void> deleteLocation(@PathVariable Integer location_id) {
        locationService.deleteLocation(location_id);
        return ResponseEntity.noContent().build();
    }

}
