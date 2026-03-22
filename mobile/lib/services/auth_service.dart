import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dio_client.dart';

class AuthService {
  static const _secureStorage = FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
  );

  static const _tokenKey = 'jwt_token';
  static const _refreshTokenKey = 'refresh_token';

  Future<Map<String, dynamic>?> login(
    String email,
    String password,
    String username,
  ) async {
    try {
      DioClient.reset();
      final dio = await DioClient.getInstance();
      final response = await dio.post(
        '/auth/login',
        data: {
          'email': email.isNotEmpty ? email : null,
          'password': password,
          'username': username.isNotEmpty ? username : null,
        },
      );

      if (response.statusCode == 200) {
        final data = response.data;
        final token = data['access_token'];
        final refreshToken = data['refresh_token'];
        final user = data['user'];
        if (token != null && user != null) {
          await _saveTokens(token, refreshToken);
          final prefs = await SharedPreferences.getInstance();
          await prefs.setInt('user_id', user['id'] ?? 0);
          await prefs.setString('user_role', user['role'] ?? '');
          await prefs.setString('user_data', jsonEncode(user));
          DioClient.reset();
          return {'token': token, 'user': user};
        }
      }
      return null;
    } on DioException catch (e) {
      if (e.type == DioExceptionType.connectionTimeout ||
          e.type == DioExceptionType.receiveTimeout ||
          e.type == DioExceptionType.connectionError) {
        throw Exception(
          'Server is not responding. Make sure backend is running.',
        );
      }
      if (e.response?.statusCode == 401) {
        final detail = e.response?.data?['detail'];
        if (detail != null) {
          throw Exception(detail);
        }
        throw Exception('Invalid username or password. Please try again.');
      }
      if (e.response?.statusCode == 403) {
        final detail = e.response?.data?['detail'];
        throw Exception(
          detail ?? 'Account is inactive. Contact administrator.',
        );
      }
      throw Exception('Login failed. Please try again.');
    } catch (e) {
      if (e.toString().contains('timeout') ||
          e.toString().contains('Connection refused')) {
        throw Exception(
          'Server is not responding. Make sure backend is running.',
        );
      }
      rethrow;
    }
  }

  Future<void> _saveTokens(String accessToken, String? refreshToken) async {
    await _secureStorage.write(key: _tokenKey, value: accessToken);
    if (refreshToken != null) {
      await _secureStorage.write(key: _refreshTokenKey, value: refreshToken);
    }
  }

  Future<String?> getToken() async {
    return await _secureStorage.read(key: _tokenKey);
  }

  Future<String?> getRefreshToken() async {
    return await _secureStorage.read(key: _refreshTokenKey);
  }

  Future<bool> isLoggedIn() async {
    final token = await getToken();
    return token != null && token.isNotEmpty;
  }

  Future<bool> refreshAccessToken() async {
    try {
      final refreshToken = await getRefreshToken();
      if (refreshToken == null) return false;

      final dio = await DioClient.getInstance();
      final response = await dio.post(
        '/auth/refresh',
        data: {'refresh_token': refreshToken},
      );

      if (response.statusCode == 200) {
        final data = response.data;
        final newToken = data['access_token'];
        final newRefreshToken = data['refresh_token'];
        await _saveTokens(newToken, newRefreshToken);
        DioClient.reset();
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  Future<void> logout() async {
    await _secureStorage.delete(key: _tokenKey);
    await _secureStorage.delete(key: _refreshTokenKey);
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('user_id');
    await prefs.remove('user_role');
    await prefs.remove('user_data');
    DioClient.reset();
  }

  Future<Map<String, dynamic>?> getUserData() async {
    final prefs = await SharedPreferences.getInstance();
    final userData = prefs.getString('user_data');
    if (userData != null) {
      return jsonDecode(userData) as Map<String, dynamic>;
    }
    return null;
  }

  Future<String?> getUserRole() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('user_role');
  }

  Future<int?> getUserId() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getInt('user_id');
  }
}
