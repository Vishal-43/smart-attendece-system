package com.smartattendance.qrotp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = {"com.smartattendance"})
public class QROTPServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(QROTPServiceApplication.class, args);
    }

}
