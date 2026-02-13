package com.smartattendance.data.controller;

import com.smartattendance.dto.divisions.DivisionCreate;
import com.smartattendance.dto.divisions.DivisionOut;
import com.smartattendance.data.service.DivisionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/divisions")
@RequiredArgsConstructor
public class DivisionController {

    private final DivisionService divisionService;

    @GetMapping("/")
    public ResponseEntity<List<DivisionOut>> listAllDivisions() {
        return ResponseEntity.ok(divisionService.listAllDivisions());
    }

    @GetMapping("/course:{course_id}")
    public ResponseEntity<List<DivisionOut>> listByCourse(@PathVariable Integer course_id) {
        return ResponseEntity.ok(divisionService.listByCourse(course_id));
    }

    @GetMapping("/branch_id:{branch_id}")
    public ResponseEntity<List<DivisionOut>> listByBranch(@PathVariable Integer branch_id) {
        return ResponseEntity.ok(divisionService.listByBranch(branch_id));
    }

    @PostMapping("/")
    public ResponseEntity<DivisionOut> createDivision(@RequestBody DivisionCreate request) {
        return ResponseEntity.ok(divisionService.createDivision(request));
    }

    @PutMapping("/{division_id}")
    public ResponseEntity<DivisionOut> updateDivision(@PathVariable Integer division_id, @RequestBody DivisionCreate request) {
        return ResponseEntity.ok(divisionService.updateDivision(division_id, request));
    }

    @DeleteMapping("/{division_id}")
    public ResponseEntity<Void> deleteDivision(@PathVariable Integer division_id) {
        divisionService.deleteDivision(division_id);
        return ResponseEntity.noContent().build();
    }

}
