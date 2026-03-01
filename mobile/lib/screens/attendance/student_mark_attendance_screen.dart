// student_mark_attendance_screen.dart
// Student screen for marking attendance using QR scanner or manual OTP entry

import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import '../../services/location_service.dart';
import '../../services/wifi_service.dart';
import '../../core/network/network_result.dart';
import '../../features/attendance/attendance_repository.dart';
import 'package:geolocator/geolocator.dart';

class StudentMarkAttendanceScreen extends StatefulWidget {
  final int timetableId;

  const StudentMarkAttendanceScreen({
    super.key,
    required this.timetableId,
  });

  @override
  State<StudentMarkAttendanceScreen> createState() =>
      _StudentMarkAttendanceScreenState();
}

class _StudentMarkAttendanceScreenState
    extends State<StudentMarkAttendanceScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _otpController = TextEditingController();
  final _otpFormKey = GlobalKey<FormState>();
  final _repo = const AttendanceRepository();
  final _locationService = LocationService();
  final _wifiService = WifiService();

  MobileScannerController? _scannerController;
  bool _isSubmitting = false;
  String? _successMessage;
  String? _errorMessage;
  bool _hasScanned = false;

  // Location and WiFi info
  Position? _position;
  String? _wifiInfo;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _tabController.addListener(_onTabChanged);
    _initializeServices();
  }

  @override
  void dispose() {
    _tabController.dispose();
    _otpController.dispose();
    _scannerController?.dispose();
    super.dispose();
  }

  void _onTabChanged() {
    if (_tabController.index == 0) {
      // QR Scanner tab - restart scanner
      _hasScanned = false;
      _scannerController?.start();
    } else {
      // OTP tab - stop scanner to save battery
      _scannerController?.stop();
    }

    setState(() {
      _successMessage = null;
      _errorMessage = null;
    });
  }

  Future<void> _initializeServices() async {
    // Get location
    try {
      _position = await _locationService.getCurrentLocation();
    } catch (e) {
      debugPrint('Location error: $e');
    }

    // Get WiFi info
    try {
      _wifiInfo = await _wifiService.getWifiInfo();
    } catch (e) {
      debugPrint('WiFi error: $e');
    }
  }

  Future<void> _markAttendance(String method, String code) async {
    if (_isSubmitting) return;

    setState(() {
      _isSubmitting = true;
      _successMessage = null;
      _errorMessage = null;
    });

    try {
      // Ensure we have fresh location
      _position ??= await _locationService.getCurrentLocation();

      final result = await _repo.markAttendance(
        timetableId: widget.timetableId,
        method: method,
        code: code.trim(),
        latitude: _position?.latitude,
        longitude: _position?.longitude,
        deviceInfo: _wifiInfo,
      );

      if (!mounted) return;

      if (result is Success) {
        setState(() {
          _successMessage = 'Attendance marked successfully!';
          _isSubmitting = false;
        });

        // Clear OTP input if on OTP tab
        if (method == 'otp') {
          _otpController.clear();
        }

        // Show success and go back after delay
        Future.delayed(const Duration(seconds: 2), () {
          if (mounted) {
            Navigator.of(context).pop();
          }
        });
      } else if (result is Failure) {
        setState(() {
          _errorMessage = (result as Failure).error.message;
          _isSubmitting = false;
          _hasScanned = false; // Allow retry on scanner tab
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Failed to mark attendance: $e';
        _isSubmitting = false;
        _hasScanned = false;
      });
    }
  }

  void _onQRDetected(BarcodeCapture capture) {
    if (_hasScanned || _isSubmitting) return;

    final scannedCode = capture.barcodes.firstOrNull?.rawValue;
    if (scannedCode != null && scannedCode.isNotEmpty) {
      _hasScanned = true;
      _scannerController?.stop();
      _markAttendance('qr', scannedCode);
    }
  }

  void _submitOTP() {
    if (_otpFormKey.currentState?.validate() ?? false) {
      _markAttendance('otp', _otpController.text);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Mark Attendance'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(icon: Icon(Icons.qr_code_scanner), text: 'Scan QR'),
            Tab(icon: Icon(Icons.password), text: 'Enter OTP'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildQRScannerTab(),
          _buildOTPTab(),
        ],
      ),
    );
  }

  Widget _buildQRScannerTab() {
    return Stack(
      children: [
        MobileScanner(
          controller: _scannerController ??= MobileScannerController(
            detectionSpeed: DetectionSpeed.normal,
            facing: CameraFacing.back,
          ),
          onDetect: _onQRDetected,
        ),
        if (_isSubmitting || _successMessage != null || _errorMessage != null)
          Container(
            color: Colors.black54,
            child: Center(
              child: Card(
                margin: const EdgeInsets.all(24),
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      if (_isSubmitting)
                        const CircularProgressIndicator()
                      else if (_successMessage != null)
                        Column(
                          children: [
                            const Icon(
                              Icons.check_circle,
                              color: Colors.green,
                              size: 64,
                            ),
                            const SizedBox(height: 16),
                            Text(
                              _successMessage!,
                              style: const TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ],
                        )
                      else if (_errorMessage != null)
                        Column(
                          children: [
                            const Icon(
                              Icons.error,
                              color: Colors.red,
                              size: 64,
                            ),
                            const SizedBox(height: 16),
                            Text(
                              _errorMessage!,
                              style: const TextStyle(
                                fontSize: 16,
                                color: Colors.red,
                              ),
                              textAlign: TextAlign.center,
                            ),
                            const SizedBox(height: 16),
                            ElevatedButton(
                              onPressed: () {
                                setState(() {
                                  _errorMessage = null;
                                  _hasScanned = false;
                                });
                                _scannerController?.start();
                              },
                              child: const Text('Try Again'),
                            ),
                          ],
                        ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        Positioned(
          bottom: 0,
          left: 0,
          right: 0,
          child: Container(
            padding: const EdgeInsets.all(16),
            color: Colors.black54,
            child: Column(
              children: [
                const Text(
                  'Point camera at QR code',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                if (_position != null)
                  Text(
                    'Location: ${_position!.latitude.toStringAsFixed(6)}, ${_position!.longitude.toStringAsFixed(6)}',
                    style: const TextStyle(color: Colors.white70, fontSize: 12),
                  ),
                if (_wifiInfo != null)
                  Text(
                    _wifiInfo!,
                    style: const TextStyle(color: Colors.white70, fontSize: 12),
                  ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildOTPTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Form(
        key: _otpFormKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text(
              'Enter 6-digit OTP',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 24),
            TextFormField(
              controller: _otpController,
              decoration: const InputDecoration(
                labelText: 'OTP Code',
                hintText: '123456',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.password),
              ),
              keyboardType: TextInputType.number,
              maxLength: 6,
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Please enter OTP';
                }
                if (value.length != 6) {
                  return 'OTP must be 6 digits';
                }
                return null;
              },
            ),
            const SizedBox(height: 24),
            if (_position != null) ...[
              Row(
                children: [
                  const Icon(Icons.location_on, size: 16, color: Colors.green),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Location: ${_position!.latitude.toStringAsFixed(6)}, ${_position!.longitude.toStringAsFixed(6)}',
                      style: const TextStyle(fontSize: 12, color: Colors.grey),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
            ],
            if (_wifiInfo != null) ...[
              Row(
                children: [
                  const Icon(Icons.wifi, size: 16, color: Colors.blue),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      _wifiInfo!,
                      style: const TextStyle(fontSize: 12, color: Colors.grey),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),
            ],
            ElevatedButton(
              onPressed: _isSubmitting ? null : _submitOTP,
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
              child: _isSubmitting
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Text(
                      'Mark Attendance',
                      style: TextStyle(fontSize: 16),
                    ),
            ),
            if (_successMessage != null) ...[
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.green.shade50,
                  border: Border.all(color: Colors.green),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.check_circle, color: Colors.green),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        _successMessage!,
                        style: const TextStyle(color: Colors.green),
                      ),
                    ),
                  ],
                ),
              ),
            ],
            if (_errorMessage != null) ...[
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.red.shade50,
                  border: Border.all(color: Colors.red),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.error, color: Colors.red),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        _errorMessage!,
                        style: const TextStyle(color: Colors.red),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
