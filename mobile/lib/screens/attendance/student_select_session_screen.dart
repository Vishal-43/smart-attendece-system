// student_select_session_screen.dart
// Screen for students to select which class session they want to mark attendance for

import 'package:flutter/material.dart';
import '../../services/qr_otp/qr_otp_service.dart';
import '../../utils/error_handler.dart';
import 'student_mark_attendance_screen.dart';

class StudentSelectSessionScreen extends StatefulWidget {
  const StudentSelectSessionScreen({super.key});

  @override
  State<StudentSelectSessionScreen> createState() =>
      _StudentSelectSessionScreenState();
}

class _StudentSelectSessionScreenState
    extends State<StudentSelectSessionScreen> {
  final _service = QrOtpService();
  List<dynamic> _timetables = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _fetchTimetables();
  }

  Future<void> _fetchTimetables() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final response = await _service.getTimetables();
      final data = response.data;
      setState(() {
        _timetables = data is Map ? (data['data'] ?? []) : (data ?? []);
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _error = _formatErrorMessage(e);
        _loading = false;
      });
    }
  }

  String _formatErrorMessage(dynamic error) {
    return ErrorHandler.formatError(error);
  }

  void _selectSession(int timetableId) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => StudentMarkAttendanceScreen(
          timetableId: timetableId,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Select Class Session'),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        _error!,
                        style: const TextStyle(color: Colors.red),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: _fetchTimetables,
                        child: const Text('Retry'),
                      ),
                    ],
                  ),
                )
              : _timetables.isEmpty
                  ? const Center(
                      child: Text('No class sessions available'),
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: _timetables.length,
                      itemBuilder: (context, index) {
                        final tt = _timetables[index];
                        return Card(
                          margin: const EdgeInsets.only(bottom: 12),
                          child: ListTile(
                            leading: CircleAvatar(
                              child: Text(
                                (tt['subject'] ?? 'C')[0].toUpperCase(),
                              ),
                            ),
                            title: Text(
                              tt['subject'] ?? 'Unknown Subject',
                              style:
                                  const TextStyle(fontWeight: FontWeight.bold),
                            ),
                            subtitle: Text(
                              '${tt['day_of_week']} ${tt['start_time']} - ${tt['end_time']}',
                            ),
                            trailing: const Icon(Icons.arrow_forward_ios),
                            onTap: () => _selectSession(tt['id']),
                          ),
                        );
                      },
                    ),
    );
  }
}
