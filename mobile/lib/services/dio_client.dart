import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';

class DioClient {
  static Dio? _dio;

  // Android emulator uses 10.0.2.2 for localhost
  // Physical devices use actual backend IP
  // iOS emulator uses localhost:8000
  static const String _localBackendUrl = 'http://10.0.2.2:8000/api/v1';
  static const String _productionBackendUrl = 'http://localhost:8000/api/v1';

  /// Returns a Dio instance with a fresh auth token on every call.
  /// The base Dio is cached, but the token is read fresh from SharedPreferences.
  /// Use API_BASE_URL environment variable to override the default backend URL.
  static Future<Dio> getInstance() async {
    _dio ??= Dio(
      BaseOptions(
        baseUrl: _getBaseUrl(),
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

  /// Get the base URL from environment or use sensible defaults
  static String _getBaseUrl() {
    // Try to use environment variable if available
    // Build with: flutter run --dart-define=API_BASE_URL=http://your-backend:8000/api/v1
    const String? envUrl = String.fromEnvironment('API_BASE_URL');
    if (envUrl != null && envUrl.isNotEmpty) {
      return envUrl;
    }
    
    // Use platform-appropriate default
    // Android emulator: 10.0.2.2 (special alias for localhost from emulator)
    // Physical Android: Use actual backend IP (configure in your build script)
    // iOS: localhost
    return _localBackendUrl;
  }

  /// Clear cached instance (call on logout).
  static void reset() {
    _dio = null;
  }
}
