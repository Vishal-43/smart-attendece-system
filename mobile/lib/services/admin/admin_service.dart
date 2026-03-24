import '../dio_client.dart';

class AdminService {
  Future<List<Map<String, dynamic>>> fetchUsers() async {
    final dio = await DioClient.getInstance();
    final response = await dio.get('/users');

    // Handle the response - might be wrapped or unwrapped
    dynamic data = response.data;

    if (data is List) {
      return List<Map<String, dynamic>>.from(data);
    }
    if (data is Map && data['data'] is List) {
      return List<Map<String, dynamic>>.from(data['data']);
    }
    if (data is Map && data['success'] == true && data['data'] is List) {
      return List<Map<String, dynamic>>.from(data['data']);
    }

    throw Exception('Failed to fetch users: Invalid response format');
  }

  Future<void> deleteUser(String userId) async {
    final dio = await DioClient.getInstance();
    await dio.delete('/users/$userId');
  }

  Future<void> createUser(Map<String, dynamic> userData) async {
    final dio = await DioClient.getInstance();
    await dio.post('/users/', data: userData);
  }

  Future<void> updateUser(String userId, Map<String, dynamic> userData) async {
    final dio = await DioClient.getInstance();
    await dio.put('/users/$userId', data: userData);
  }
}
