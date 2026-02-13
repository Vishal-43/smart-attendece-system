package com.smartattendance.data.service;

import com.smartattendance.dto.timetables.TimeTableCreate;
import com.smartattendance.dto.timetables.TimeTableOut;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class TimeTableService {

    private final WebClient webClient;

    @Value("${python.backend.url:http://localhost:8000}")
    private String pythonBackendUrl;

    public List<TimeTableOut> listAllTimetables() {
        try {
            return webClient.get()
                    .uri("/api/v1/timetables/")
                    .retrieve()
                    .bodyToFlux(TimeTableOut.class)
                    .collectList()
                    .block();
        } catch (Exception e) {
            log.error("Failed to list timetables: {}", e.getMessage());
            throw new RuntimeException("Failed to fetch timetables", e);
        }
    }

    public TimeTableOut getTimetableById(Integer timetableId) {
        try {
            return webClient.get()
                    .uri("/api/v1/timetables/{timetable_id}", timetableId)
                    .retrieve()
                    .bodyToMono(TimeTableOut.class)
                    .block();
        } catch (Exception e) {
            log.error("Failed to get timetable {}: {}", timetableId, e.getMessage());
            throw new RuntimeException("Failed to fetch timetable", e);
        }
    }

    public TimeTableOut getByDivision(Integer divisionId) {
        try {
            return webClient.get()
                    .uri("/api/v1/timetables/division_id:{division_id}", divisionId)
                    .retrieve()
                    .bodyToMono(TimeTableOut.class)
                    .block();
        } catch (Exception e) {
            log.error("Failed to get timetable for division {}: {}", divisionId, e.getMessage());
            throw new RuntimeException("Failed to fetch division timetable", e);
        }
    }

    public TimeTableOut getByTeacher(Integer teacherId) {
        try {
            return webClient.get()
                    .uri("/api/v1/timetables/teacher_id:{teacher_id}", teacherId)
                    .retrieve()
                    .bodyToMono(TimeTableOut.class)
                    .block();
        } catch (Exception e) {
            log.error("Failed to get timetable for teacher {}: {}", teacherId, e.getMessage());
            throw new RuntimeException("Failed to fetch teacher timetable", e);
        }
    }

    public TimeTableOut getByLocation(Integer locationId) {
        try {
            return webClient.get()
                    .uri("/api/v1/timetables/location_id:{location_id}", locationId)
                    .retrieve()
                    .bodyToMono(TimeTableOut.class)
                    .block();
        } catch (Exception e) {
            log.error("Failed to get timetable for location {}: {}", locationId, e.getMessage());
            throw new RuntimeException("Failed to fetch location timetable", e);
        }
    }

    public TimeTableOut createTimetable(TimeTableCreate request) {
        try {
            return webClient.post()
                    .uri("/api/v1/timetables/")
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(TimeTableOut.class)
                    .block();
        } catch (Exception e) {
            log.error("Failed to create timetable: {}", e.getMessage());
            throw new RuntimeException("Failed to create timetable", e);
        }
    }

    public TimeTableOut updateTimetable(Integer timetableId, TimeTableCreate request) {
        try {
            return webClient.put()
                    .uri("/api/v1/timetables/{timetable_id}", timetableId)
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(TimeTableOut.class)
                    .block();
        } catch (Exception e) {
            log.error("Failed to update timetable {}: {}", timetableId, e.getMessage());
            throw new RuntimeException("Failed to update timetable", e);
        }
    }

    public void deleteTimetable(Integer timetableId) {
        try {
            webClient.delete()
                    .uri("/api/v1/timetables/{timetable_id}", timetableId)
                    .retrieve()
                    .toBodilessEntity()
                    .block();
        } catch (Exception e) {
            log.error("Failed to delete timetable {}: {}", timetableId, e.getMessage());
            throw new RuntimeException("Failed to delete timetable", e);
        }
    }

}
