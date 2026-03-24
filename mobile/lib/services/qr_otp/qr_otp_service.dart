import 'package:dio/dio.dart';
import '../dio_client.dart';

class QrOtpService {
  // ── QR Code APIs ──────────────────────────────────────────────────────────

  /// Generate QR code for a timetable
  /// POST /api/v1/qr/generate/{timetableId}
  Future<Response> generateQrCode(
    int timetableId, {
    int ttlMinutes = 10,
  }) async {
    final dio = await DioClient.getInstance();
    return await dio.post(
      '/qr/generate/$timetableId',
      queryParameters: {'ttl_minutes': ttlMinutes},
    );
  }

  /// Get current active QR code for a timetable (teachers/admins only)
  /// GET /api/v1/qr/current/{timetableId}
  Future<Response> getCurrentQr(
    int timetableId, {
    bool withImage = true,
  }) async {
    final dio = await DioClient.getInstance();
    return await dio.get(
      '/qr/current/$timetableId',
      queryParameters: {'with_image': withImage},
    );
  }

  /// Get QR session status for students (no code exposed)
  /// GET /api/v1/qr/status/{timetableId}
  Future<Response> getQrStatus(int timetableId) async {
    final dio = await DioClient.getInstance();
    return await dio.get('/qr/status/$timetableId');
  }

  /// Refresh (regenerate) QR code for a timetable
  /// POST /api/v1/qr/refresh/{timetableId}
  Future<Response> refreshQrCode(int timetableId) async {
    final dio = await DioClient.getInstance();
    return await dio.post('/qr/refresh/$timetableId');
  }

  // ── OTP APIs ──────────────────────────────────────────────────────────────

  /// Generate OTP for a timetable
  /// POST /api/v1/otp/generate/{timetableId}
  Future<Response> generateOtp(int timetableId, {int ttlMinutes = 5}) async {
    final dio = await DioClient.getInstance();
    return await dio.post(
      '/otp/generate/$timetableId',
      queryParameters: {'ttl_minutes': ttlMinutes},
    );
  }

  /// Get current active OTP for a timetable (teachers/admins only)
  /// GET /api/v1/otp/current/{timetableId}
  Future<Response> getCurrentOtp(int timetableId) async {
    final dio = await DioClient.getInstance();
    return await dio.get('/otp/current/$timetableId');
  }

  /// Get OTP session status for students (no code exposed)
  /// GET /api/v1/otp/status/{timetableId}
  Future<Response> getOtpStatus(int timetableId) async {
    final dio = await DioClient.getInstance();
    return await dio.get('/otp/status/$timetableId');
  }

  /// Refresh (regenerate) OTP for a timetable
  /// POST /api/v1/otp/refresh/{timetableId}
  Future<Response> refreshOtp(int timetableId) async {
    final dio = await DioClient.getInstance();
    return await dio.post('/otp/refresh/$timetableId');
  }

  /// End/Cancel QR session
  /// DELETE /api/v1/qr/cancel/{timetableId}
  Future<Response> endQrSession(int timetableId) async {
    final dio = await DioClient.getInstance();
    return await dio.delete('/qr/cancel/$timetableId');
  }

  /// End/Cancel OTP session
  /// DELETE /api/v1/otp/cancel/{timetableId}
  Future<Response> endOtpSession(int timetableId) async {
    final dio = await DioClient.getInstance();
    return await dio.delete('/otp/cancel/$timetableId');
  }

  /// Mark all absent students for a session
  /// POST /api/v1/attendance/mark-absent/{timetableId}
  Future<Response> markAbsentStudents(
    int timetableId, {
    String? sessionDate,
  }) async {
    final dio = await DioClient.getInstance();
    final params = <String, dynamic>{};
    if (sessionDate != null) params['session_date'] = sessionDate;
    return await dio.post(
      '/attendance/mark-absent/$timetableId',
      queryParameters: params.isNotEmpty ? params : null,
    );
  }

  // ── Timetables (for dropdown) ─────────────────────────────────────────────

  /// Get list of timetables for the current teacher/admin
  /// GET /api/v1/timetables/my-schedule
  Future<Response> getTimetables() async {
    final dio = await DioClient.getInstance();
    return await dio.get('/timetables/my-schedule');
  }
}
