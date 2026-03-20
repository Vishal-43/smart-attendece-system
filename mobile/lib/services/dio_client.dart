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

    _dio!.options.baseUrl = baseUrl;

    if (!_dio!.interceptors.any((i) => i is _UnwrapInterceptor)) {
      _dio!.interceptors.add(_UnwrapInterceptor());
    }

    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token');
    if (token != null) {
      _dio!.options.headers['Authorization'] = 'Bearer $token';
    } else {
      _dio!.options.headers.remove('Authorization');
    }

    return _dio!;
  }

  static String _getBaseUrl() {
    const String? envUrl = String.fromEnvironment('API_BASE_URL');
    if (envUrl.isNotEmpty) {
      return envUrl;
    }

    if (kIsWeb) {
      return _localhostUrl;
    }

    if (defaultTargetPlatform == TargetPlatform.android) {
      return _androidEmulatorUrl;
    }

    return _localhostUrl;
  }

  static void reset() {
    _dio = null;
  }
}

class _UnwrapInterceptor extends Interceptor {
  @override
  void onResponse(
    Response<dynamic> response,
    ResponseInterceptorHandler handler,
  ) {
    final data = response.data;
    if (data is Map &&
        data.containsKey('data') &&
        data.containsKey('success')) {
      response.data = data['data'];
    }
    handler.next(response);
  }
}
