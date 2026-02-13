package com.smartattendance.dto.attendance;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceRecordUpdate {
    private String status;
    private String location_verified;
    private String access_point_matched;
}
