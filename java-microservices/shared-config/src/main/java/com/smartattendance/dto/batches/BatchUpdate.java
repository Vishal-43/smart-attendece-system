package com.smartattendance.dto.batches;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BatchUpdate {
    private String name;
    private Integer batch_number;
    private Integer semester;
    private Integer academic_year;
}
