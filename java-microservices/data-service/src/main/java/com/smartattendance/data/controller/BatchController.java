package com.smartattendance.data.controller;

import com.smartattendance.dto.batches.BatchCreate;
import com.smartattendance.dto.batches.BatchOut;
import com.smartattendance.dto.batches.BatchUpdate;
import com.smartattendance.data.service.BatchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/batches")
@RequiredArgsConstructor
public class BatchController {

    private final BatchService batchService;

    @GetMapping("/")
    public ResponseEntity<List<BatchOut>> listAllBatches() {
        return ResponseEntity.ok(batchService.listAllBatches());
    }

    @GetMapping("/division_id:{division_id}")
    public ResponseEntity<List<BatchOut>> listByDivision(@PathVariable Integer division_id) {
        return ResponseEntity.ok(batchService.listByDivision(division_id));
    }

    @PostMapping("/")
    public ResponseEntity<BatchOut> createBatch(@RequestBody BatchCreate request) {
        return ResponseEntity.ok(batchService.createBatch(request));
    }

    @PutMapping("/{batch_id}")
    public ResponseEntity<BatchOut> updateBatch(@PathVariable Integer batch_id, @RequestBody BatchUpdate request) {
        return ResponseEntity.ok(batchService.updateBatch(batch_id, request));
    }

    @DeleteMapping("/batch_id:{batch_id}")
    public ResponseEntity<Void> deleteBatch(@PathVariable Integer batch_id) {
        batchService.deleteBatch(batch_id);
        return ResponseEntity.noContent().build();
    }

}
