
import 'package:flutter/material.dart';
import '../../services/attendance/attendance_service.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AttendanceScreen extends StatefulWidget {
  const AttendanceScreen({super.key});

  @override
  State<AttendanceScreen> createState() => _AttendanceScreenState();
}

class _AttendanceScreenState extends State<AttendanceScreen> {
  bool _loading = false;
  String? _result;

  Future<String?> _getUserId() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('user_id');
  }

  Future<void> _markAttendance(String method) async {
    final userId = await _getUserId();
    if (userId == null) {
      setState(() => _result = 'User not logged in.');
      return;
    }
    if (!mounted) return;
    final controller = TextEditingController();
    final code = await showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Enter ${method.toUpperCase()} Code'),
        content: TextField(
          controller: controller,
          decoration: InputDecoration(hintText: 'Enter code'),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, controller.text.trim()),
            child: const Text('Submit'),
          ),
        ],
      ),
    );
    if (code == null || code.isEmpty) return;
    if (!mounted) return;
    setState(() {
      _loading = true;
      _result = null;
    });
    try {
      final service = AttendanceService();
      final response = await service.markAttendance(
        userId: userId,
        method: method,
        code: code,
      );
      setState(() => _result = response.data['message'] ?? 'Attendance marked!');
    } catch (e) {
      setState(() => _result = 'Failed: $e');
    } finally {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Mark Attendance'),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            ElevatedButton(
              onPressed: _loading ? null : () => _markAttendance('qr'),
              child: const Text('Mark via QR Code'),
            ),
            ElevatedButton(
              onPressed: _loading ? null : () => _markAttendance('otp'),
              child: const Text('Mark via OTP'),
            ),
            if (_loading) const Padding(
              padding: EdgeInsets.all(16.0),
              child: CircularProgressIndicator(),
            ),
            if (_result != null) Padding(
              padding: const EdgeInsets.all(16.0),
              child: Text(_result!, style: const TextStyle(color: Colors.red)),
            ),
          ],
        ),
      ),
    );
  }
}
