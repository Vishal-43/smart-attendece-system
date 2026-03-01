import 'package:dio/dio.dart';
import '../dio_client.dart';

class QrOtpService {
  // ── QR Code APIs ──────────────────────────────────────────────────────────

  /// Generate QR code for a timetable
  /// POST /api/v1/qr/generate/{timetableId}
  Future<Response> generateQrCode(int timetableId, {int ttlMinutes = 10}) async {
    final dio = await DioClient.getInstance();
    return await dio.post(
      '/qr/generate/$timetableId',
      queryParameters: {'ttl_minutes': ttlMinutes},
    );
  }

  /// Get current active QR code for a timetable
  /// GET /api/v1/qr/current/{timetableId}
  Future<Response> getCurrentQr(int timetableId, {bool withImage = true}) async {
    final dio = await DioClient.getInstance();
    return await dio.get(
      '/qr/current/$timetableId',
      queryParameters: {'with_image': withImage},
    );
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

  /// Get current active OTP for a timetable
  /// GET /api/v1/otp/current/{timetableId}
  Future<Response> getCurrentOtp(int timetableId) async {
    final dio = await DioClient.getInstance();
    return await dio.get('/otp/current/$timetableId');
  }

  /// Refresh (regenerate) OTP for a timetable
  /// POST /api/v1/otp/refresh/{timetableId}
  Future<Response> refreshOtp(int timetableId) async {
    final dio = await DioClient.getInstance();
    return await dio.post('/otp/refresh/$timetableId');
  }

  // ── Timetables (for dropdown) ─────────────────────────────────────────────

  /// Get list of timetables (for teacher/admin)
  /// GET /api/v1/timetables/
  Future<Response> getTimetables() async {
    final dio = await DioClient.getInstance();
    return await dio.get('/timetables/');
  }
}
