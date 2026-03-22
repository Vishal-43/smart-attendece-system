import '../dio_client.dart';

class AttendanceVerificationService {
  Future<String> verifyGeofencing({
    required double latitude,
    required double longitude,
  }) async {
    final dio = await DioClient.getInstance();
    final response = await dio.post(
      '/attendance/verify/geofencing',
      data: {'latitude': latitude, 'longitude': longitude},
    );
    if (response.statusCode == 200) {
      return response.data['message'] ?? 'Geofencing verified!';
    }
    throw Exception('Failed to verify geofencing');
  }

  Future<String> verifyAccessPoint({
    required String ssid,
    required String bssid,
  }) async {
    final dio = await DioClient.getInstance();
    final response = await dio.post(
      '/attendance/verify/accesspoint',
      data: {'ssid': ssid, 'bssid': bssid},
    );
    if (response.statusCode == 200) {
      return response.data['message'] ?? 'Access point verified!';
    }
    throw Exception('Failed to verify access point');
  }
}
