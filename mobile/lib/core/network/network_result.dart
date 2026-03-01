// network_result.dart
// Discriminated union / Either-like type for API responses.
//
// Usage:
//   final result = await repo.fetchSomething();
//   result.when(
//     success: (data) => ...,
//     failure: (error) => ...,
//   );

import 'api_exception.dart';

sealed class NetworkResult<T> {
  const NetworkResult();
}

final class Success<T> extends NetworkResult<T> {
  final T data;
  const Success(this.data);
}

final class Failure<T> extends NetworkResult<T> {
  final ApiException error;
  const Failure(this.error);
}

extension NetworkResultX<T> on NetworkResult<T> {
  bool get isSuccess => this is Success<T>;
  bool get isFailure => this is Failure<T>;

  T? get dataOrNull => switch (this) {
    Success(:final data) => data,
    Failure() => null,
  };

  ApiException? get errorOrNull => switch (this) {
    Success() => null,
    Failure(:final error) => error,
  };

  R when<R>({
    required R Function(T data) success,
    required R Function(ApiException error) failure,
  }) {
    return switch (this) {
      Success(:final data)  => success(data),
      Failure(:final error) => failure(error),
    };
  }

  NetworkResult<R> map<R>(R Function(T data) transform) {
    return switch (this) {
      Success(:final data)  => Success(transform(data)),
      Failure(:final error) => Failure(error),
    };
  }
}
