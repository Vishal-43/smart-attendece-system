import 'package:dio/dio.dart';
import '../dio_client.dart';

class AttendanceService {
  Future<Response> markAttendance({
    required String userId,
    required String method, // 'qr' or 'otp'
    required String code,
  }) async {
    final dio = await DioClient.getInstance();
    return await dio.post(
      '/attendance/mark',
      data: {'user_id': userId, 'method': method, 'code': code},
    );
  }

  Future<Response> getAttendanceRecords(String userId) async {
    final dio = await DioClient.getInstance();
    return await dio.get(
      '/attendance/records',
      queryParameters: {'user_id': userId},
    );
  }
}
