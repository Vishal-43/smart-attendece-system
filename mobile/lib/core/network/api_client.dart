// api_client.dart
// Central HTTP client built on the existing DioClient.
// Wraps every call in a NetworkResult and maps Dio errors to typed exceptions.

import 'package:dio/dio.dart';
import '../network/api_exception.dart';
import '../network/network_result.dart';
import '../../services/dio_client.dart';

/// Thin wrapper around Dio that returns [NetworkResult<T>] on every call.
///
/// Usage:
///   final result = await ApiClient.get<Map>('/users/me');
///   result.when(success: (d) => …, failure: (e) => …);
class ApiClient {
  ApiClient._();

  // ── GET ─────────────────────────────────────────────────────────────────────
  static Future<NetworkResult<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      final dio = await DioClient.getInstance();
      final resp = await dio.get<T>(path, queryParameters: queryParameters, options: options);
      return Success(_extractData<T>(resp));
    } on DioException catch (e) {
      return Failure(_mapDioError(e));
    } catch (e) {
      return Failure(ApiException(message: e.toString()));
    }
  }

  // ── POST ────────────────────────────────────────────────────────────────────
  static Future<NetworkResult<T>> post<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      final dio = await DioClient.getInstance();
      final resp = await dio.post<T>(path, data: data, queryParameters: queryParameters, options: options);
      return Success(_extractData<T>(resp));
    } on DioException catch (e) {
      return Failure(_mapDioError(e));
    } catch (e) {
      return Failure(ApiException(message: e.toString()));
    }
  }

  // ── PUT ─────────────────────────────────────────────────────────────────────
  static Future<NetworkResult<T>> put<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      final dio = await DioClient.getInstance();
      final resp = await dio.put<T>(path, data: data, queryParameters: queryParameters, options: options);
      return Success(_extractData<T>(resp));
    } on DioException catch (e) {
      return Failure(_mapDioError(e));
    } catch (e) {
      return Failure(ApiException(message: e.toString()));
    }
  }

  // ── PATCH ────────────────────────────────────────────────────────────────────
  static Future<NetworkResult<T>> patch<T>(
    String path, {
    dynamic data,
    Options? options,
  }) async {
    try {
      final dio = await DioClient.getInstance();
      final resp = await dio.patch<T>(path, data: data, options: options);
      return Success(_extractData<T>(resp));
    } on DioException catch (e) {
      return Failure(_mapDioError(e));
    } catch (e) {
      return Failure(ApiException(message: e.toString()));
    }
  }

  // ── DELETE ───────────────────────────────────────────────────────────────────
  static Future<NetworkResult<T>> delete<T>(
    String path, {
    dynamic data,
    Options? options,
  }) async {
    try {
      final dio = await DioClient.getInstance();
      final resp = await dio.delete<T>(path, data: data, options: options);
      return Success(_extractData<T>(resp));
    } on DioException catch (e) {
      return Failure(_mapDioError(e));
    } catch (e) {
      return Failure(ApiException(message: e.toString()));
    }
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  static T _extractData<T>(Response<T> resp) {
    // The backend wraps responses in { success, data, message }.
    // Unwrap if possible, else return raw body.
    if (resp.data is Map<String, dynamic>) {
      final body = resp.data as Map<String, dynamic>;
      if (body.containsKey('data')) return body['data'] as T;
    }
    return resp.data as T;
  }

  static ApiException _mapDioError(DioException e) {
    if (e.type == DioExceptionType.connectionError ||
        e.type == DioExceptionType.connectionTimeout ||
        e.type == DioExceptionType.receiveTimeout) {
      return const NetworkException();
    }
    if (e.type == DioExceptionType.cancel) {
      return const CancelledException();
    }

    final status = e.response?.statusCode;
    final body   = e.response?.data;
    final msg    = _extractMessage(body) ?? e.message ?? 'An error occurred';

    return switch (status) {
      400 => BadRequestException(message: msg, data: body),
      401 => UnauthorizedException(message: msg),
      403 => ForbiddenException(message: msg),
      404 => NotFoundException(message: msg),
      409 => ConflictException(message: msg),
      422 => ValidationException(message: msg, fieldErrors: _extractFieldErrors(body)),
      _ when status != null && status >= 500 => ServerException(statusCode: status, message: msg),
      _ => ApiException(statusCode: status, message: msg),
    };
  }

  static String? _extractMessage(dynamic body) {
    if (body is Map<String, dynamic>) {
      return body['message'] as String? ??
          body['detail'] as String? ??
          body['error'] as String?;
    }
    return null;
  }

  static Map<String, List<String>>? _extractFieldErrors(dynamic body) {
    if (body is! Map<String, dynamic>) return null;
    final detail = body['detail'];
    if (detail is! List) return null;
    final result = <String, List<String>>{};
    for (final item in detail) {
      if (item is Map<String, dynamic>) {
        final loc  = (item['loc'] as List?)?.lastOrNull?.toString() ?? 'field';
        final msg  = item['msg'] as String? ?? 'Invalid';
        result.putIfAbsent(loc, () => []).add(msg);
      }
    }
    return result.isEmpty ? null : result;
  }
}
