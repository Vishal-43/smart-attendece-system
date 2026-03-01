// api_exception.dart
// Typed error hierarchy for all network / API failures.

/// Base class for all API errors.
class ApiException implements Exception {
  final int? statusCode;
  final String message;
  final dynamic data;

  const ApiException({
    this.statusCode,
    required this.message,
    this.data,
  });

  @override
  String toString() => 'ApiException($statusCode): $message';
}

/// 400 – invalid request body / params
class BadRequestException extends ApiException {
  const BadRequestException({super.message = 'Bad request', super.data})
      : super(statusCode: 400);
}

/// 401 – missing / expired token
class UnauthorizedException extends ApiException {
  const UnauthorizedException({super.message = 'Unauthorised — please log in again'})
      : super(statusCode: 401);
}

/// 403 – authenticated but not allowed
class ForbiddenException extends ApiException {
  const ForbiddenException({super.message = 'You do not have permission to do this'})
      : super(statusCode: 403);
}

/// 404 – resource not found
class NotFoundException extends ApiException {
  const NotFoundException({super.message = 'Resource not found'})
      : super(statusCode: 404);
}

/// 409 – conflict (duplicate, already exists, etc.)
class ConflictException extends ApiException {
  const ConflictException({super.message = 'Conflict — resource already exists'})
      : super(statusCode: 409);
}

/// 422 – validation error from the server
class ValidationException extends ApiException {
  final Map<String, List<String>>? fieldErrors;

  const ValidationException({
    super.message = 'Validation failed',
    this.fieldErrors,
  }) : super(statusCode: 422);
}

/// 5xx – server-side failure
class ServerException extends ApiException {
  const ServerException({
    super.statusCode = 500,
    super.message = 'Server error — please try again later',
  });
}

/// Network / connectivity failure (no response received)
class NetworkException extends ApiException {
  const NetworkException({super.message = 'No internet connection'})
      : super(statusCode: null);
}

/// Request cancelled
class CancelledException extends ApiException {
  const CancelledException() : super(statusCode: null, message: 'Request cancelled');
}
