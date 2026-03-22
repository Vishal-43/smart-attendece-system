import '../dio_client.dart';

class AdminService {
  Future<List<Map<String, dynamic>>> fetchUsers() async {
    final dio = await DioClient.getInstance();
    final response = await dio.get('/users');
    if (response.statusCode == 200) {
      if (response.data is List) {
        return List<Map<String, dynamic>>.from(response.data);
      }
      if (response.data is Map && response.data['data'] is List) {
        return List<Map<String, dynamic>>.from(response.data['data']);
      }
    }
    throw Exception('Failed to fetch users: ${response.statusCode}');
  }

  Future<void> deleteUser(String userId) async {
    final dio = await DioClient.getInstance();
    final response = await dio.delete('/users/$userId');
    if (response.statusCode != 200 && response.statusCode != 204) {
      throw Exception('Failed to delete user: ${response.statusCode}');
    }
  }

  Future<void> createUser(Map<String, dynamic> userData) async {
    final dio = await DioClient.getInstance();
    final response = await dio.post('/users/', data: userData);
    if (response.statusCode != 200 && response.statusCode != 201) {
      throw Exception('Failed to create user: ${response.statusCode}');
    }
  }

  Future<void> updateUser(String userId, Map<String, dynamic> userData) async {
    final dio = await DioClient.getInstance();
    final response = await dio.put('/users/$userId', data: userData);
    if (response.statusCode != 200) {
      throw Exception('Failed to update user: ${response.statusCode}');
    }
  }
}
