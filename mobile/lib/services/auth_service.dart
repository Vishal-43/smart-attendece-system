import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dio_client.dart';

class AuthService {
  Future<bool> login(String email, String password, String username) async {
    try {
      final dio = await DioClient.getInstance();
      final response = await dio.post(
        '/auth/login',
        data: {
          'email': email,
          'password': password,
          'username': username,
        },
      );

      if (response.statusCode == 200) {
        final data = response.data;
        final token = data['access_token'];
        if (token != null) {
          final prefs = await SharedPreferences.getInstance();
          await prefs.setString('jwt_token', token);
          return true;
        }
      }
      return false;
    } catch (e) {
      // Handle timeout and connection errors gracefully
      if (e.toString().contains('timeout') || 
          e.toString().contains('Connection refused')) {
        throw Exception('Server is not responding. Make sure backend is running on port 8000.');
      }
      rethrow;
    }
  }

  Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('jwt_token');
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('jwt_token');
  }
}
