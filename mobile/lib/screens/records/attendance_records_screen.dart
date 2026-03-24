import 'package:flutter/material.dart';
import '../../services/attendance/attendance_service.dart';
import '../../services/auth_service.dart';

class AttendanceRecordsScreen extends StatefulWidget {
  const AttendanceRecordsScreen({super.key});

  @override
  State<AttendanceRecordsScreen> createState() =>
      _AttendanceRecordsScreenState();
}

class _AttendanceRecordsScreenState extends State<AttendanceRecordsScreen> {
  bool _loading = true;
  List<dynamic> _records = [];
  String? _error;

  @override
  void initState() {
    super.initState();
    _fetchRecords();
  }

  Future<void> _fetchRecords() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    final authService = AuthService();
    final userId = await authService.getUserId();
    if (userId == null) {
      setState(() {
        _error = 'User not logged in.';
        _loading = false;
      });
      return;
    }
    try {
      final service = AttendanceService();
      final data = await service.getAttendanceRecords(userId);
      setState(() {
        _records = data['items'] as List<dynamic>? ?? [];
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _error = 'Failed to fetch records: $e';
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Scaffold(
      appBar: AppBar(title: const Text('Attendance Records')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
          ? Center(
              child: Text(_error!, style: TextStyle(color: colors.error)),
            )
          : _records.isEmpty
          ? const Center(child: Text('No attendance records found.'))
          : ListView.builder(
              itemCount: _records.length,
              itemBuilder: (context, i) {
                final rec = _records[i];
                return ListTile(
                  leading: Icon(
                    Icons.check_circle,
                    color: rec['status'] == 'present'
                        ? colors.primary
                        : colors.error,
                  ),
                  title: Text('Date: ${rec['marked_at']}'),
                  subtitle: Text('Status: ${rec['status']}'),
                );
              },
            ),
    );
  }
}
