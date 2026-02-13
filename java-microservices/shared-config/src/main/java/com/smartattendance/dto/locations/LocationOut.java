package com.smartattendance.dto.locations;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LocationOut {
    private Integer id;
    private String name;
    private Double latitude;
    private Double longitude;
    private Double radius;
    private String room_no;
    private String floor;
    private String room_type;
    private Integer capacity;
}
