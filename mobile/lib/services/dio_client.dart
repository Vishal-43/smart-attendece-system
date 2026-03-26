import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../config/api_config.dart';

class DioClient {
  static Dio? _dio;
  static const _secureStorage = FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
  );
  static const _tokenKey = 'jwt_token';

  static Future<Dio> getInstance() async {
    final baseUrl = ApiConfig.baseUrl;

    _dio ??= Dio(
      BaseOptions(
        baseUrl: baseUrl,
        connectTimeout: ApiConfig.connectTimeout,
        receiveTimeout: ApiConfig.receiveTimeout,
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
        data.containsKey('success') &&
        data['success'] == true &&
        response.statusCode != null &&
        response.statusCode! >= 200 &&
        response.statusCode! < 300) {
      response.data = data['data'];
    }
    handler.next(response);
  }
}
