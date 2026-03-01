
import 'package:flutter/material.dart';
import '../../services/attendance/attendance_verification_service.dart';

class AttendanceVerificationScreen extends StatefulWidget {
  const AttendanceVerificationScreen({super.key});

  @override
  State<AttendanceVerificationScreen> createState() => _AttendanceVerificationScreenState();
}

class _AttendanceVerificationScreenState extends State<AttendanceVerificationScreen> {
  bool _loading = false;
  String? _result;

  Future<void> _verifyGeofencing() async {
    setState(() {
      _loading = true;
      _result = null;
    });
    try {
      // TODO: Replace with real location fetching
      double latitude = 12.9716; // Example: get from location plugin
      double longitude = 77.5946;
      final service = AttendanceVerificationService();
      final message = await service.verifyGeofencing(latitude: latitude, longitude: longitude);
      setState(() {
        _result = message;
      });
    } catch (e) {
      setState(() {
        _result = 'Failed: $e';
      });
    } finally {
      setState(() {
        _loading = false;
      });
    }
  }

  Future<void> _verifyAccessPoint() async {
    setState(() {
      _loading = true;
      _result = null;
    });
    try {
      // TODO: Replace with real WiFi info fetching
      String ssid = 'ExampleSSID'; // Example: get from wifi plugin
      String bssid = '00:11:22:33:44:55';
      final service = AttendanceVerificationService();
      final message = await service.verifyAccessPoint(ssid: ssid, bssid: bssid);
      setState(() {
        _result = message;
      });
    } catch (e) {
      setState(() {
        _result = 'Failed: $e';
      });
    } finally {
      setState(() {
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Attendance Verification')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            ElevatedButton.icon(
              icon: const Icon(Icons.location_on),
              label: const Text('Verify via Geofencing'),
              onPressed: _loading ? null : _verifyGeofencing,
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              icon: const Icon(Icons.wifi),
              label: const Text('Verify via Access Point'),
              onPressed: _loading ? null : _verifyAccessPoint,
            ),
            if (_loading) const Padding(
              padding: EdgeInsets.all(16.0),
              child: CircularProgressIndicator(),
            ),
            if (_result != null) Padding(
              padding: const EdgeInsets.all(16.0),
              child: Text(_result!, style: const TextStyle(color: Colors.green)),
            ),
          ],
        ),
      ),
    );
  }
}
