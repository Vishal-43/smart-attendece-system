import 'package:flutter/foundation.dart';
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class DioClient {
  static Dio? _dio;
  static const _secureStorage = FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
  );
  static const _tokenKey = 'jwt_token';

  static const String _realDeviceUrl = 'http://192.168.0.101:8000/api/v1';
  static const String _localhostUrl = 'http://localhost:8000/api/v1';

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

    final token = await _secureStorage.read(key: _tokenKey);
    if (token != null && token.isNotEmpty) {
      _dio!.options.headers['Authorization'] = 'Bearer $token';
    } else {
      _dio!.options.headers.remove('Authorization');
    }

    return _dio!;
  }

  static String _getBaseUrl() {
    const String envUrl = String.fromEnvironment('API_BASE_URL');
    if (envUrl.isNotEmpty) {
      return envUrl;
    }

    if (kIsWeb) {
      return _localhostUrl;
    }

    if (defaultTargetPlatform == TargetPlatform.android) {
      return _realDeviceUrl;
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
