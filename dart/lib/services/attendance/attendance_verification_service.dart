import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class AttendanceVerificationService {
  static const String _baseUrl = 'http://localhost:8000/api/v1/attendance/verify'; // Update to your backend endpoint

  Future<String> verifyGeofencing({required double latitude, required double longitude}) async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token');
    final response = await http.post(
      Uri.parse('$_baseUrl/geofencing'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
      body: jsonEncode({
        'latitude': latitude,
        'longitude': longitude,
      }),
    );
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['message'] ?? 'Geofencing verified!';
    }
    throw Exception('Failed to verify geofencing: ${response.body}');
  }

  Future<String> verifyAccessPoint({required String ssid, required String bssid}) async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token');
    final response = await http.post(
      Uri.parse('$_baseUrl/accesspoint'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
      body: jsonEncode({
        'ssid': ssid,
        'bssid': bssid,
      }),
    );
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['message'] ?? 'Access point verified!';
    }
    throw Exception('Failed to verify access point: ${response.body}');
  }
}
