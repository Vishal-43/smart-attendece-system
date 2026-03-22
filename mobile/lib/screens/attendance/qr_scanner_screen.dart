import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import '../../services/attendance/attendance_service.dart';
import '../../services/auth_service.dart';
import '../../services/location_service.dart';
import '../../services/wifi_service.dart';

class QrScannerScreen extends StatefulWidget {
  const QrScannerScreen({super.key});

  @override
  State<QrScannerScreen> createState() => _QrScannerScreenState();
}

class _QrScannerScreenState extends State<QrScannerScreen> {
  final MobileScannerController _scannerController = MobileScannerController(
    detectionSpeed: DetectionSpeed.normal,
    facing: CameraFacing.back,
  );
  bool _isProcessing = false;
  bool _hasScanned = false;
  double? _latitude;
  double? _longitude;
  String? _bssid;
  bool _locationCollected = false;

  final LocationService _locationService = LocationService();
  final WifiService _wifiService = WifiService();

  @override
  void initState() {
    super.initState();
    _collectLocationAndWifi();
  }

  Future<void> _collectLocationAndWifi() async {
    final position = await _locationService.getCurrentLocation();
    if (position != null && mounted) {
      setState(() {
        _latitude = position.latitude;
        _longitude = position.longitude;
        _locationCollected = true;
      });
    }

    final bssid = await _wifiService.getWifiBSSID();
    if (bssid != null && mounted) {
      setState(() {
        _bssid = bssid;
      });
    }
  }

  @override
  void dispose() {
    _scannerController.dispose();
    super.dispose();
  }

  Future<void> _onDetect(BarcodeCapture capture) async {
    if (_isProcessing || _hasScanned) return;

    final barcodes = capture.barcodes;
    if (barcodes.isEmpty) return;

    final rawValue = barcodes.first.rawValue;
    if (rawValue == null || rawValue.isEmpty) return;

    setState(() {
      _isProcessing = true;
      _hasScanned = true;
    });

    int? timetableId;
    String code;

    try {
      final Map<String, dynamic> qrData = Map<String, dynamic>.from(
        Uri.splitQueryString(
          rawValue,
        ).map((key, value) => MapEntry(key, value)),
      );
      if (qrData.containsKey('code') && qrData.containsKey('timetable_id')) {
        code = qrData['code']!;
        timetableId = int.tryParse(qrData['timetable_id']!);
      } else {
        code = rawValue;
      }
    } catch (e) {
      code = rawValue;
    }

    if (timetableId == null) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('Invalid QR code format')));
        setState(() {
          _isProcessing = false;
          _hasScanned = false;
        });
      }
      return;
    }

    final authService = AuthService();
    final userId = await authService.getUserId();

    if (userId == null) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('User not logged in')));
        Navigator.pop(context);
      }
      return;
    }

    if (!mounted) return;

    try {
      final service = AttendanceService();
      final response = await service.markAttendance(
        userId: userId,
        method: 'qr',
        code: code,
        timetableId: timetableId,
        latitude: _latitude,
        longitude: _longitude,
        bssid: _bssid,
      );

      if (mounted) {
        final status =
            response.data['status']?.toString().toUpperCase() ?? 'PRESENT';
        _showResultDialog(true, 'Attendance marked: $status');
      }
    } catch (e) {
      if (mounted) {
        _showResultDialog(false, e.toString().replaceFirst('Exception: ', ''));
      }
    }
  }

  void _showResultDialog(bool success, String message) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        icon: Icon(
          success ? Icons.check_circle : Icons.error,
          color: success ? Colors.green : Colors.red,
          size: 64,
        ),
        title: Text(success ? 'Success!' : 'Error'),
        content: Text(message),
        actions: [
          if (!success)
            TextButton(
              onPressed: () {
                Navigator.pop(context);
                setState(() {
                  _isProcessing = false;
                  _hasScanned = false;
                });
              },
              child: const Text('Try Again'),
            ),
          FilledButton(
            onPressed: () {
              Navigator.pop(context);
              Navigator.pop(context);
            },
            child: const Text('Done'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Scan QR Code'),
        actions: [
          IconButton(
            icon: const Icon(Icons.flash_on),
            onPressed: () => _scannerController.toggleTorch(),
          ),
          IconButton(
            icon: const Icon(Icons.flip_camera_android),
            onPressed: () => _scannerController.switchCamera(),
          ),
        ],
      ),
      body: Stack(
        children: [
          MobileScanner(controller: _scannerController, onDetect: _onDetect),
          if (_isProcessing)
            Container(
              color: Colors.black54,
              child: const Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    CircularProgressIndicator(color: Colors.white),
                    SizedBox(height: 16),
                    Text(
                      'Verifying attendance...',
                      style: TextStyle(color: Colors.white, fontSize: 18),
                    ),
                  ],
                ),
              ),
            ),
          Positioned(
            top: 16,
            left: 16,
            right: 16,
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.black54,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    _locationCollected ? Icons.location_on : Icons.location_off,
                    color: _locationCollected ? Colors.green : Colors.orange,
                    size: 20,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    _locationCollected
                        ? 'Location collected'
                        : 'Getting location...',
                    style: const TextStyle(color: Colors.white, fontSize: 12),
                  ),
                ],
              ),
            ),
          ),
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Container(
              color: Colors.black54,
              padding: const EdgeInsets.all(24),
              child: Column(
                children: [
                  const Text(
                    'Point camera at QR code',
                    style: TextStyle(color: Colors.white, fontSize: 16),
                  ),
                  const SizedBox(height: 16),
                  TextButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text(
                      'Enter code manually',
                      style: TextStyle(color: Colors.white),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
