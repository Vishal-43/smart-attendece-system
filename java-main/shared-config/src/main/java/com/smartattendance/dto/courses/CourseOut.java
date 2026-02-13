package com.smartattendance.dto.courses;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseOut {
    private Integer id;
    private String name;
    private String code;
    private Integer duration_years;
    private Integer total_semesters;
    private String college_code;
}
