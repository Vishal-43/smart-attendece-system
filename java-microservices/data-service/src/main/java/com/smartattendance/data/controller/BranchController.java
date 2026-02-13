package com.smartattendance.data.controller;

import com.smartattendance.dto.branches.BranchCreate;
import com.smartattendance.dto.branches.BranchOut;
import com.smartattendance.data.service.BranchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/branches")
@RequiredArgsConstructor
public class BranchController {

    private final BranchService branchService;

    @GetMapping("/")
    public ResponseEntity<List<BranchOut>> listAllBranches() {
        return ResponseEntity.ok(branchService.listAllBranches());
    }

    @GetMapping("/course_id:{course_id}")
    public ResponseEntity<List<BranchOut>> listByCourse(@PathVariable Integer course_id) {
        return ResponseEntity.ok(branchService.listByCourse(course_id));
    }

    @GetMapping("/branch_id:{branch_id}")
    public ResponseEntity<BranchOut> getBranchById(@PathVariable Integer branch_id) {
        return ResponseEntity.ok(branchService.getBranchById(branch_id));
    }

    @PostMapping("/")
    public ResponseEntity<BranchOut> createBranch(@RequestBody BranchCreate request) {
        return ResponseEntity.ok(branchService.createBranch(request));
    }

    @PutMapping("/{branch_id}")
    public ResponseEntity<BranchOut> updateBranch(@PathVariable Integer branch_id, @RequestBody BranchCreate request) {
        return ResponseEntity.ok(branchService.updateBranch(branch_id, request));
    }

    @DeleteMapping("/{branch_id}")
    public ResponseEntity<Void> deleteBranch(@PathVariable Integer branch_id) {
        branchService.deleteBranch(branch_id);
        return ResponseEntity.noContent().build();
    }

}
