package com.smartattendance.data.service;

import com.smartattendance.dto.courses.CourseCreate;
import com.smartattendance.dto.courses.CourseOut;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CourseService {

    private final WebClient webClient;

    @Value("${python.backend.url:http://localhost:8000}")
    private String pythonBackendUrl;

    public List<CourseOut> listCourses() {
        try {
            return webClient.get()
                    .uri("/api/v1/courses/")
                    .retrieve()
                    .bodyToFlux(CourseOut.class)
                    .collectList()
                    .block();
        } catch (Exception e) {
            log.error("Failed to list courses: {}", e.getMessage());
            throw new RuntimeException("Failed to fetch courses", e);
        }
    }

    public CourseOut getCourse(Integer courseId) {
        try {
            return webClient.get()
                    .uri("/api/v1/courses/{course_id}", courseId)
                    .retrieve()
                    .bodyToMono(CourseOut.class)
                    .block();
        } catch (Exception e) {
            log.error("Failed to get course {}: {}", courseId, e.getMessage());
            throw new RuntimeException("Failed to fetch course", e);
        }
    }

    public CourseOut createCourse(CourseCreate request) {
        try {
            return webClient.post()
                    .uri("/api/v1/courses/")
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(CourseOut.class)
                    .block();
        } catch (Exception e) {
            log.error("Failed to create course: {}", e.getMessage());
            throw new RuntimeException("Failed to create course", e);
        }
    }

    public CourseOut updateCourse(Integer courseId, CourseCreate request) {
        try {
            return webClient.put()
                    .uri("/api/v1/courses/{course_id}", courseId)
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(CourseOut.class)
                    .block();
        } catch (Exception e) {
            log.error("Failed to update course {}: {}", courseId, e.getMessage());
            throw new RuntimeException("Failed to update course", e);
        }
    }

    public void deleteCourse(Integer courseId) {
        try {
            webClient.delete()
                    .uri("/api/v1/courses/{course_id}", courseId)
                    .retrieve()
                    .toBodilessEntity()
                    .block();
        } catch (Exception e) {
            log.error("Failed to delete course {}: {}", courseId, e.getMessage());
            throw new RuntimeException("Failed to delete course", e);
        }
    }

}
