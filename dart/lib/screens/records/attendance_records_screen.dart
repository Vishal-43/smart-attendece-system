import 'package:flutter/material.dart';
import '../../services/attendance/attendance_service.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AttendanceRecordsScreen extends StatefulWidget {
  const AttendanceRecordsScreen({super.key});

  @override
  State<AttendanceRecordsScreen> createState() => _AttendanceRecordsScreenState();
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
    final prefs = await SharedPreferences.getInstance();
    final userId = prefs.getString('user_id');
    if (userId == null) {
      setState(() {
        _error = 'User not logged in.';
        _loading = false;
      });
      return;
    }
    try {
      final service = AttendanceService();
      final response = await service.getAttendanceRecords(userId);
      setState(() {
        _records = response.data['records'] ?? [];
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
    return Scaffold(
      appBar: AppBar(title: const Text('Attendance Records')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Text(_error!, style: const TextStyle(color: Colors.red)))
              : _records.isEmpty
                  ? const Center(child: Text('No attendance records found.'))
                  : ListView.builder(
                      itemCount: _records.length,
                      itemBuilder: (context, i) {
                        final rec = _records[i];
                        return ListTile(
                          leading: Icon(Icons.check_circle, color: rec['status'] == 'present' ? Colors.green : Colors.red),
                          title: Text('Date: ${rec['date']}'),
                          subtitle: Text('Status: ${rec['status']}'),
                        );
                      },
                    ),
    );
  }
}
