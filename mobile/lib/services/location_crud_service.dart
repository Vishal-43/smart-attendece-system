import 'package:dio/dio.dart';
import 'dio_client.dart';

class LocationService {
  Future<Response> getLocations({int? limit}) async {
    final dio = await DioClient.getInstance();
    final params = limit != null ? {'limit': limit} : null;
    return await dio.get('/locations', queryParameters: params);
  }

  Future<Response> getLocation(int id) async {
    final dio = await DioClient.getInstance();
    return await dio.get('/locations/$id');
  }

  Future<Response> createLocation({
    required String name,
    required double latitude,
    required double longitude,
    required int radius,
    String? roomNo,
    String? floor,
    String? roomType,
    int? capacity,
    String? address,
  }) async {
    final dio = await DioClient.getInstance();
    return await dio.post(
      '/locations',
      data: {
        'name': name,
        'latitude': latitude,
        'longitude': longitude,
        'radius': radius,
        if (roomNo != null && roomNo.isNotEmpty) 'room_no': roomNo,
        if (floor != null && floor.isNotEmpty) 'floor': floor,
        if (roomType != null && roomType.isNotEmpty) 'room_type': roomType,
        if (capacity != null) 'capacity': capacity,
        if (address != null && address.isNotEmpty) 'address': address,
      },
    );
  }

  Future<Response> updateLocation(
    int id, {
    required String name,
    required double latitude,
    required double longitude,
    required int radius,
    String? roomNo,
    String? floor,
    String? roomType,
    int? capacity,
    String? address,
  }) async {
    final dio = await DioClient.getInstance();
    return await dio.put(
      '/locations/$id',
      data: {
        'name': name,
        'latitude': latitude,
        'longitude': longitude,
        'radius': radius,
        if (roomNo != null && roomNo.isNotEmpty) 'room_no': roomNo,
        if (floor != null && floor.isNotEmpty) 'floor': floor,
        if (roomType != null && roomType.isNotEmpty) 'room_type': roomType,
        if (capacity != null) 'capacity': capacity,
        if (address != null && address.isNotEmpty) 'address': address,
      },
    );
  }

  Future<Response> deleteLocation(int id) async {
    final dio = await DioClient.getInstance();
    return await dio.delete('/locations/$id');
  }

  Future<Response> validatePoint(double latitude, double longitude) async {
    final dio = await DioClient.getInstance();
    return await dio.get(
      '/locations/validate-point',
      queryParameters: {'lat': latitude, 'lon': longitude},
    );
  }
}
