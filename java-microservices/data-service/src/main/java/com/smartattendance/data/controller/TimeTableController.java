package com.smartattendance.data.controller;

import com.smartattendance.dto.timetables.TimeTableCreate;
import com.smartattendance.dto.timetables.TimeTableOut;
import com.smartattendance.data.service.TimeTableService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/timetables")
@RequiredArgsConstructor
public class TimeTableController {

    private final TimeTableService timeTableService;

    @GetMapping("/")
    public ResponseEntity<List<TimeTableOut>> listAllTimetables() {
        return ResponseEntity.ok(timeTableService.listAllTimetables());
    }

    @GetMapping("/{timetable_id}")
    public ResponseEntity<TimeTableOut> getTimetableById(@PathVariable Integer timetable_id) {
        return ResponseEntity.ok(timeTableService.getTimetableById(timetable_id));
    }

    @GetMapping("/division_id:{division_id}")
    public ResponseEntity<TimeTableOut> getByDivision(@PathVariable Integer division_id) {
        return ResponseEntity.ok(timeTableService.getByDivision(division_id));
    }

    @GetMapping("/teacher_id:{teacher_id}")
    public ResponseEntity<TimeTableOut> getByTeacher(@PathVariable Integer teacher_id) {
        return ResponseEntity.ok(timeTableService.getByTeacher(teacher_id));
    }

    @GetMapping("/location_id:{location_id}")
    public ResponseEntity<TimeTableOut> getByLocation(@PathVariable Integer location_id) {
        return ResponseEntity.ok(timeTableService.getByLocation(location_id));
    }

    @PostMapping("/")
    public ResponseEntity<TimeTableOut> createTimetable(@RequestBody TimeTableCreate request) {
        return ResponseEntity.ok(timeTableService.createTimetable(request));
    }

    @PutMapping("/{timetable_id}")
    public ResponseEntity<TimeTableOut> updateTimetable(@PathVariable Integer timetable_id, @RequestBody TimeTableCreate request) {
        return ResponseEntity.ok(timeTableService.updateTimetable(timetable_id, request));
    }

    @DeleteMapping("/{timetable_id}")
    public ResponseEntity<Void> deleteTimetable(@PathVariable Integer timetable_id) {
        timeTableService.deleteTimetable(timetable_id);
        return ResponseEntity.noContent().build();
    }

}
