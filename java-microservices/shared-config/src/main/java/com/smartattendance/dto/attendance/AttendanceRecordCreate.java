package com.smartattendance.dto.attendance;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceRecordCreate {
    private Integer student_id;
    private Integer teacher_id;
    private Integer timetable_id;
    private Integer enrollment_id;
    private Integer division_id;
    private Integer batch_id;
    private String status;
}
