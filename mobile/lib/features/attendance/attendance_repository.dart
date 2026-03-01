// attendance_repository.dart
// Data-access layer for all attendance-related API calls.

import '../../core/network/api_client.dart';
import '../../core/network/network_result.dart';
import 'attendance_record.dart';

class AttendanceRepository {
  const AttendanceRepository();

  // ── History ─────────────────────────────────────────────────────────────────

  /// GET /api/v1/attendance/history/{userId}
  Future<NetworkResult<AttendanceHistoryPage>> getHistory({
    required int userId,
    int page = 1,
    int limit = 20,
    int? timetableId,
    DateTime? startDate,
    DateTime? endDate,
  }) async {
    final params = <String, dynamic>{
      'page': page,
      'limit': limit,
      'timetable_id': ?timetableId,
      if (startDate    != null) 'start_date': _fmtDate(startDate),
      if (endDate      != null) 'end_date':   _fmtDate(endDate),
    };

    final result = await ApiClient.get<Map<String, dynamic>>(
      '/attendance/history/$userId',
      queryParameters: params,
    );

    return result.map((data) => AttendanceHistoryPage.fromJson(data));
  }

  // ── Mark attendance ─────────────────────────────────────────────────────────

  /// POST /api/v1/attendance/mark
  Future<NetworkResult<AttendanceRecord>> markAttendance({
    required int timetableId,
    required String method, // "qr" | "otp"
    required String code,
    double? latitude,
    double? longitude,
    String? deviceInfo,
  }) async {
    final body = <String, dynamic>{
      'timetable_id': timetableId,
      'method': method,
      'code': code,
      'latitude':    ?latitude,
      'longitude':   ?longitude,
      'device_info': ?deviceInfo,
    };

    final result = await ApiClient.post<Map<String, dynamic>>(
      '/attendance/mark',
      data: body,
    );

    return result.map((data) => AttendanceRecord.fromJson(data));
  }

  // ── Session (teacher view) ───────────────────────────────────────────────────

  /// GET /api/v1/attendance/session/{timetableId}
  Future<NetworkResult<Map<String, dynamic>>> getSessionAttendance({
    required int timetableId,
    DateTime? sessionDate,
  }) async {
    final params = <String, dynamic>{
      if (sessionDate != null) 'session_date': _fmtDate(sessionDate),
    };

    return ApiClient.get<Map<String, dynamic>>(
      '/attendance/session/$timetableId',
      queryParameters: params,
    );
  }

  // ── Update (teacher / admin) ─────────────────────────────────────────────────

  /// PUT /api/v1/attendance/{id}
  Future<NetworkResult<AttendanceRecord>> updateStatus({
    required int attendanceId,
    required String status,
  }) async {
    final result = await ApiClient.put<Map<String, dynamic>>(
      '/attendance/$attendanceId',
      data: {'status': status},
    );
    return result.map((data) => AttendanceRecord.fromJson(data));
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────
  String _fmtDate(DateTime dt) =>
      '${dt.year.toString().padLeft(4, '0')}-'
      '${dt.month.toString().padLeft(2, '0')}-'
      '${dt.day.toString().padLeft(2, '0')}';
}
