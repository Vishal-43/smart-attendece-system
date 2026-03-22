import 'package:dio/dio.dart';
import 'dio_client.dart';

class AccessPointService {
  Future<Response> getAccessPoints({int? limit}) async {
    final dio = await DioClient.getInstance();
    final params = limit != null ? {'limit': limit} : null;
    return await dio.get('/access-points', queryParameters: params);
  }

  Future<Response> getAccessPoint(int id) async {
    final dio = await DioClient.getInstance();
    return await dio.get('/access-points/$id');
  }

  Future<Response> createAccessPoint({
    required String name,
    required String macAddress,
    String? ipAddress,
    required int locationId,
    bool isActive = true,
  }) async {
    final dio = await DioClient.getInstance();
    return await dio.post(
      '/access-points',
      data: {
        'name': name,
        'mac_address': macAddress,
        if (ipAddress != null && ipAddress.isNotEmpty) 'ip_address': ipAddress,
        'location_id': locationId,
        'is_active': isActive,
      },
    );
  }

  Future<Response> updateAccessPoint(
    int id, {
    required String name,
    required String macAddress,
    String? ipAddress,
    required int locationId,
    bool isActive = true,
  }) async {
    final dio = await DioClient.getInstance();
    return await dio.put(
      '/access-points/$id',
      data: {
        'name': name,
        'mac_address': macAddress,
        if (ipAddress != null && ipAddress.isNotEmpty) 'ip_address': ipAddress,
        'location_id': locationId,
        'is_active': isActive,
      },
    );
  }

  Future<Response> deleteAccessPoint(int id) async {
    final dio = await DioClient.getInstance();
    return await dio.delete('/access-points/$id');
  }

  Future<Response> getLocations({int? limit}) async {
    final dio = await DioClient.getInstance();
    final params = limit != null ? {'limit': limit} : null;
    return await dio.get('/locations', queryParameters: params);
  }
}
