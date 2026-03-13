import 'package:flutter/foundation.dart';
import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';

class DioClient {
  static Dio? _dio;

  static const String _androidEmulatorUrl = 'http://10.0.2.2:8000/api/v1';
  static const String _localhostUrl = 'http://localhost:8000/api/v1';

  /// Returns a Dio instance with a fresh auth token on every call.
  /// The base Dio is cached, but the token is read fresh from SharedPreferences.
  /// Use API_BASE_URL environment variable to override the default backend URL.
  static Future<Dio> getInstance() async {
    final baseUrl = _getBaseUrl();

    _dio ??= Dio(
      BaseOptions(
        baseUrl: baseUrl,
        connectTimeout: const Duration(seconds: 30),
        receiveTimeout: const Duration(seconds: 30),
      ),
    );

    // Keep base URL fresh so hot reload / platform differences don't retain stale values.
    _dio!.options.baseUrl = baseUrl;

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

  /// Get the base URL from environment or use sensible defaults
  static String _getBaseUrl() {
    // Try to use environment variable if available
    // Build with: flutter run --dart-define=API_BASE_URL=http://your-backend:8000/api/v1
    const String? envUrl = String.fromEnvironment('API_BASE_URL');
    if (envUrl.isNotEmpty) {
      return envUrl;
    }

    // Use platform-appropriate defaults.
    if (kIsWeb) {
      return _localhostUrl;
    }

    if (defaultTargetPlatform == TargetPlatform.android) {
      return _androidEmulatorUrl;
    }

    // iOS, macOS, Linux, Windows
    return _localhostUrl;
  }

  /// Clear cached instance (call on logout).
  static void reset() {
    _dio = null;
  }
}
