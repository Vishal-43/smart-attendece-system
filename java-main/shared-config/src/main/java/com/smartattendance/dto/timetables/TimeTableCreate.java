package com.smartattendance.dto.timetables;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TimeTableCreate {
    private Integer division_id;
    private Integer teacher_id;
    private Integer location_id;
    private String course_name;
    private LocalDateTime start_time;
    private LocalDateTime end_time;
    private String day_of_week;
}
