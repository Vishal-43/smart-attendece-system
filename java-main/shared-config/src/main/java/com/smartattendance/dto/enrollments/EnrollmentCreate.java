package com.smartattendance.dto.enrollments;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EnrollmentCreate {
    private Integer student_id;
    private Integer course_id;
    private Integer branch_id;
    private Integer division_id;
    private String enrollment_number;
    private Integer academic_year;
}
