import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';

class DioClient {
  static Dio? _dio;

  static Future<Dio> getInstance() async {
    if (_dio != null) return _dio!;
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token');
    _dio = Dio(
      BaseOptions(
        baseUrl: 'http://localhost:8000/api/v1',
        headers: token != null ? {'Authorization': 'Bearer $token'} : {},
      ),
    );
    return _dio!;
  }
}
