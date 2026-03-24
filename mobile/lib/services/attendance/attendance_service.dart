import 'package:dio/dio.dart';
import '../dio_client.dart';

class AttendanceService {
  Future<Response> markAttendance({
    required int userId,
    required String method,
    required String code,
    int? timetableId,
    double? latitude,
    double? longitude,
    String? bssid,
    String? deviceInfo,
  }) async {
    final dio = await DioClient.getInstance();
    final data = <String, dynamic>{'method': method, 'code': code};
    if (timetableId != null) data['timetable_id'] = timetableId;
    if (latitude != null) data['latitude'] = latitude;
    if (longitude != null) data['longitude'] = longitude;
    if (bssid != null) data['bssid'] = bssid;
    if (deviceInfo != null) data['device_info'] = deviceInfo;

    return await dio.post('/attendance/mark', data: data);
  }

  Future<Map<String, dynamic>> getAttendanceRecords(
    int userId, {
    int page = 1,
    int limit = 20,
  }) async {
    final dio = await DioClient.getInstance();
    final response = await dio.get(
      '/attendance/history/$userId',
      queryParameters: {'page': page, 'limit': limit},
    );

    // Handle the response - might be wrapped or unwrapped
    dynamic data = response.data;

    if (data is Map<String, dynamic>) {
      // If data is already unwrapped by interceptor
      if (!data.containsKey('success')) {
        return data;
      }
      // If wrapped, return the data portion
      return data['data'] as Map<String, dynamic>? ?? data;
    }

    return {};
  }

  Future<Map<String, dynamic>> getTodayAttendance() async {
    final dio = await DioClient.getInstance();
    final response = await dio.get('/attendance/today');

    dynamic data = response.data;
    if (data is Map<String, dynamic>) {
      if (!data.containsKey('success')) {
        return data;
      }
      return data['data'] as Map<String, dynamic>? ?? data;
    }
    return {};
  }
}
