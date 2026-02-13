package com.smartattendance.data.controller;

import com.smartattendance.dto.courses.CourseCreate;
import com.smartattendance.dto.courses.CourseOut;
import com.smartattendance.data.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    @GetMapping("/")
    public ResponseEntity<List<CourseOut>> listCourses() {
        return ResponseEntity.ok(courseService.listCourses());
    }

    @GetMapping("/{course_id}")
    public ResponseEntity<CourseOut> getCourse(@PathVariable Integer course_id) {
        return ResponseEntity.ok(courseService.getCourse(course_id));
    }

    @PostMapping("/")
    public ResponseEntity<CourseOut> createCourse(@RequestBody CourseCreate request) {
        return ResponseEntity.ok(courseService.createCourse(request));
    }

    @PutMapping("/{course_id}")
    public ResponseEntity<CourseOut> updateCourse(@PathVariable Integer course_id, @RequestBody CourseCreate request) {
        return ResponseEntity.ok(courseService.updateCourse(course_id, request));
    }

    @DeleteMapping("/{course_id}")
    public ResponseEntity<Void> deleteCourse(@PathVariable Integer course_id) {
        courseService.deleteCourse(course_id);
        return ResponseEntity.noContent().build();
    }

}
