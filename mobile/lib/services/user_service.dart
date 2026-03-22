import 'dio_client.dart';

class UserService {
  Future<String?> fetchUserRole() async {
    final dio = await DioClient.getInstance();
    final response = await dio.get('/auth/me');
    if (response.statusCode == 200) {
      return response.data['role'];
    }
    return null;
  }
}
