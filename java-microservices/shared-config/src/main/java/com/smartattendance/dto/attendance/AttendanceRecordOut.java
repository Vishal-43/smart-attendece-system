package com.smartattendance.dto.attendance;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceRecordOut {
    private Integer id;
    private Integer student_id;
    private Integer teacher_id;
    private Integer timetable_id;
    private Integer enrollment_id;
    private Integer division_id;
    private Integer batch_id;
    private String status;
    private LocalDateTime marked_at;
    private String location_verified;
    private String access_point_matched;
}
