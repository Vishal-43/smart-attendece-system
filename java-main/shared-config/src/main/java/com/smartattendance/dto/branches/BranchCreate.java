package com.smartattendance.dto.branches;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BranchCreate {
    private Integer course_id;
    private String name;
    private String code;
    private String branch_code;
}
