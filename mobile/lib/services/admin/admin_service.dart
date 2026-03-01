import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class AdminService {
  static const String _baseUrl = 'http://localhost:8000/api/v1/users';

  Future<Map<String, String>> _authHeaders() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token');
    return {
      'Authorization': 'Bearer $token',
      'Content-Type': 'application/json',
    };
  }

  Future<List<Map<String, dynamic>>> fetchUsers() async {
    final headers = await _authHeaders();
    final response = await http.get(Uri.parse(_baseUrl), headers: headers);
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      if (data is List) {
        return List<Map<String, dynamic>>.from(data);
      }
      if (data is Map && data['users'] is List) {
        return List<Map<String, dynamic>>.from(data['users']);
      }
      throw Exception('Unexpected response format');
    }
    throw Exception('Failed to fetch users: ${response.statusCode}');
  }

  Future<void> deleteUser(String userId) async {
    final headers = await _authHeaders();
    final response = await http.delete(
      Uri.parse('$_baseUrl/$userId'),
      headers: headers,
    );
    if (response.statusCode != 200 && response.statusCode != 204) {
      throw Exception('Failed to delete user: ${response.statusCode}');
    }
  }

  Future<void> createUser(Map<String, dynamic> userData) async {
    final headers = await _authHeaders();
    final response = await http.post(
      Uri.parse('$_baseUrl/'),
      headers: headers,
      body: jsonEncode(userData),
    );
    if (response.statusCode != 200 && response.statusCode != 201) {
      throw Exception('Failed to create user: ${response.statusCode}');
    }
  }

  Future<void> updateUser(String userId, Map<String, dynamic> userData) async {
    final headers = await _authHeaders();
    final response = await http.put(
      Uri.parse('$_baseUrl/$userId'),
      headers: headers,
      body: jsonEncode(userData),
    );
    if (response.statusCode != 200) {
      throw Exception('Failed to update user: ${response.statusCode}');
    }
  }
}
