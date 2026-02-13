package com.smartattendance.data.controller;

import com.smartattendance.dto.users.UserCreate;
import com.smartattendance.dto.users.UserOut;
import com.smartattendance.dto.users.UserUpdate;
import com.smartattendance.data.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/")
    public ResponseEntity<List<UserOut>> listUsers() {
        return ResponseEntity.ok(userService.listUsers());
    }

    @GetMapping("/{user_id}")
    public ResponseEntity<UserOut> getUser(@PathVariable Integer user_id) {
        return ResponseEntity.ok(userService.getUser(user_id));
    }

    @PostMapping("/")
    public ResponseEntity<UserOut> createUser(@RequestBody UserCreate request) {
        return ResponseEntity.ok(userService.createUser(request));
    }

    @PutMapping("/{user_id}")
    public ResponseEntity<UserOut> updateUser(@PathVariable Integer user_id, @RequestBody UserUpdate request) {
        return ResponseEntity.ok(userService.updateUser(user_id, request));
    }

    @DeleteMapping("/{user_id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Integer user_id) {
        userService.deleteUser(user_id);
        return ResponseEntity.noContent().build();
    }

}
