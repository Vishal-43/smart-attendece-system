package com.smartattendance.data.controller;

import com.smartattendance.dto.enrollments.EnrollmentCreate;
import com.smartattendance.dto.enrollments.EnrollmentOut;
import com.smartattendance.data.service.EnrollmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/enrollments")
@RequiredArgsConstructor
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    @GetMapping("/")
    public ResponseEntity<List<EnrollmentOut>> listEnrollments() {
        return ResponseEntity.ok(enrollmentService.listEnrollments());
    }

    @GetMapping("/id:{id}")
    public ResponseEntity<List<EnrollmentOut>> getEnrollmentById(@PathVariable Integer id) {
        return ResponseEntity.ok(enrollmentService.getEnrollmentById(id));
    }

    @GetMapping("/student_id:{id}")
    public ResponseEntity<List<EnrollmentOut>> getByStudent(@PathVariable Integer id) {
        return ResponseEntity.ok(enrollmentService.getByStudent(id));
    }

    @GetMapping("/course_id:{id}")
    public ResponseEntity<List<EnrollmentOut>> getByCourse(@PathVariable Integer id) {
        return ResponseEntity.ok(enrollmentService.getByCourse(id));
    }

    @GetMapping("/branch_id:{id}")
    public ResponseEntity<List<EnrollmentOut>> getByBranch(@PathVariable Integer id) {
        return ResponseEntity.ok(enrollmentService.getByBranch(id));
    }

    @GetMapping("/division_id:{id}")
    public ResponseEntity<List<EnrollmentOut>> getByDivision(@PathVariable Integer id) {
        return ResponseEntity.ok(enrollmentService.getByDivision(id));
    }

    @PostMapping("/")
    public ResponseEntity<EnrollmentOut> createEnrollment(@RequestBody EnrollmentCreate request) {
        return ResponseEntity.ok(enrollmentService.createEnrollment(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EnrollmentOut> updateEnrollment(@PathVariable Integer id, @RequestBody EnrollmentCreate request) {
        return ResponseEntity.ok(enrollmentService.updateEnrollment(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEnrollment(@PathVariable Integer id) {
        enrollmentService.deleteEnrollment(id);
        return ResponseEntity.noContent().build();
    }

}
