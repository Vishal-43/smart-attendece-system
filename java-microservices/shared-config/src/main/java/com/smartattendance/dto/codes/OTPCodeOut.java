package com.smartattendance.dto.codes;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OTPCodeOut {
    private Integer id;
    private Integer timetable_id;
    private String code;
    private LocalDateTime generated_at;
    private LocalDateTime expires_at;
    private Boolean is_used;
    private LocalDateTime used_at;
}
