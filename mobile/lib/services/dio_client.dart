import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';

class DioClient {
  static Dio? _dio;

  /// Returns a Dio instance with a fresh auth token on every call.
  /// The base Dio is cached, but the token is read fresh from SharedPreferences.
  static Future<Dio> getInstance() async {
    _dio ??= Dio(
      BaseOptions(
        baseUrl: 'http://localhost:8000/api/v1',
        connectTimeout: const Duration(seconds: 10),
        receiveTimeout: const Duration(seconds: 10),
      ),
    );

    // Always read the latest token
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token');
    if (token != null) {
      _dio!.options.headers['Authorization'] = 'Bearer $token';
    } else {
      _dio!.options.headers.remove('Authorization');
    }

    return _dio!;
  }

  /// Clear cached instance (call on logout).
  static void reset() {
    _dio = null;
  }
}
