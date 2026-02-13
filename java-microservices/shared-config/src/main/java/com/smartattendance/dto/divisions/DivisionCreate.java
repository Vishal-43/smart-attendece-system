package com.smartattendance.dto.divisions;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DivisionCreate {
    private Integer branch_id;
    private String name;
    private Integer year;
    private Integer semester;
    private Integer academic_year;
    private Integer capacity;
}
