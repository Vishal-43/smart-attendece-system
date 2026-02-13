package com.smartattendance.dto.users;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserOut {
    private Integer id;
    private String email;
    private String username;
    private String first_name;
    private String last_name;
    private String phone;
    private String role;
    private Boolean is_active;
}
