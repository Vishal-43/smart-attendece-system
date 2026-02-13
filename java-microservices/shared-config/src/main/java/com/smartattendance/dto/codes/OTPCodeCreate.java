package com.smartattendance.dto.codes;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OTPCodeCreate {
    private Integer timetable_id;
    private String code;
}
