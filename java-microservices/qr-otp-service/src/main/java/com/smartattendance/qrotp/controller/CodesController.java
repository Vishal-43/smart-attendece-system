package com.smartattendance.qrotp.controller;

import com.smartattendance.dto.codes.QRCodeCreate;
import com.smartattendance.dto.codes.QRCodeOut;
import com.smartattendance.dto.codes.OTPCodeCreate;
import com.smartattendance.dto.codes.OTPCodeOut;
import com.smartattendance.qrotp.service.QRCodeService;
import com.smartattendance.qrotp.service.OTPCodeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/codes")
@RequiredArgsConstructor
public class CodesController {

    private final QRCodeService qrCodeService;
    private final OTPCodeService otpCodeService;

    @GetMapping("/")
    public ResponseEntity<Object> listAllCodes() {
        return ResponseEntity.ok(new Object[]{
                qrCodeService.listAllQRCodes(),
                otpCodeService.listAllOTPCodes()
        });
    }

    @GetMapping("/timetable_id:{id}")
    public ResponseEntity<Object> getCodesByTimetableId(@PathVariable Integer id) {
        return ResponseEntity.ok(new Object[]{
                qrCodeService.getQRCodesByTimetableId(id),
                otpCodeService.getOTPCodesByTimetableId(id)
        });
    }

    @PostMapping("/qr_code")
    public ResponseEntity<QRCodeOut> createQRCode(@RequestBody QRCodeCreate request) {
        return ResponseEntity.ok(qrCodeService.createQRCode(request));
    }

    @PostMapping("/otp_code")
    public ResponseEntity<OTPCodeOut> createOTPCode(@RequestBody OTPCodeCreate request) {
        return ResponseEntity.ok(otpCodeService.createOTPCode(request));
    }

    @DeleteMapping("/qr_code/{code_id}")
    public ResponseEntity<QRCodeOut> deleteQRCode(@PathVariable Integer code_id) {
        return ResponseEntity.ok(qrCodeService.deleteQRCode(code_id));
    }

    @DeleteMapping("/otp_code/{code_id}")
    public ResponseEntity<OTPCodeOut> deleteOTPCode(@PathVariable Integer code_id) {
        return ResponseEntity.ok(otpCodeService.deleteOTPCode(code_id));
    }

}
