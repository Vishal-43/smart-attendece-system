package com.smartattendance.attendance.controller;

import com.smartattendance.dto.attendance.AttendanceRecordCreate;
import com.smartattendance.dto.attendance.AttendanceRecordOut;
import com.smartattendance.dto.attendance.AttendanceRecordUpdate;
import com.smartattendance.attendance.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @GetMapping("/")
    public ResponseEntity<List<AttendanceRecordOut>> listAttendanceRecords() {
        return ResponseEntity.ok(attendanceService.listAttendanceRecords());
    }

    @GetMapping("/{id}")
    public ResponseEntity<List<AttendanceRecordOut>> getAttendanceRecord(@PathVariable Integer id) {
        return ResponseEntity.ok(attendanceService.getAttendanceRecord(id));
    }

    @GetMapping("/student_id:{id}")
    public ResponseEntity<List<AttendanceRecordOut>> getAttendanceByStudent(@PathVariable Integer id) {
        return ResponseEntity.ok(attendanceService.getAttendanceByStudentId(id));
    }

    @PostMapping("/")
    public ResponseEntity<AttendanceRecordOut> createAttendanceRecord(
            @RequestBody AttendanceRecordCreate request) {
        return ResponseEntity.ok(attendanceService.createAttendanceRecord(request));
    }

    @PutMapping("/{record_id}")
    public ResponseEntity<AttendanceRecordOut> updateAttendanceRecord(
            @PathVariable Integer record_id,
            @RequestBody AttendanceRecordUpdate request) {
        return ResponseEntity.ok(attendanceService.updateAttendanceRecord(record_id, request));
    }

    @DeleteMapping("/{record_id}")
    public ResponseEntity<AttendanceRecordOut> deleteAttendanceRecord(@PathVariable Integer record_id) {
        return ResponseEntity.ok(attendanceService.deleteAttendanceRecord(record_id));
    }

}
