package com.smartattendance.dto.users;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserCreate {
    private String email;
    private String username;
    private String password;
    private String first_name;
    private String last_name;
    private String phone;
    private String role;
}
