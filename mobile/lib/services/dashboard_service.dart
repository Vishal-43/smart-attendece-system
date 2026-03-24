import 'package:dio/dio.dart';
import 'dio_client.dart';

class DashboardService {
  Future<Map<String, dynamic>> getStats() async {
    final dio = await DioClient.getInstance();
    final response = await dio.get('/dashboard/stats');

    // Handle the response - might be wrapped or unwrapped
    dynamic data = response.data;

    if (data is Map<String, dynamic>) {
      // If data is already unwrapped by interceptor
      if (!data.containsKey('success')) {
        return data;
      }
      // If wrapped, return the data portion
      return data['data'] as Map<String, dynamic>? ?? data;
    }

    return {};
  }
}
