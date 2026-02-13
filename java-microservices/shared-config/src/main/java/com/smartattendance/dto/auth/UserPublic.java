package com.smartattendance.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserPublic {
    private Integer id;
    private String email;
    private String username;
    private String role;
    private Boolean is_active;
}
