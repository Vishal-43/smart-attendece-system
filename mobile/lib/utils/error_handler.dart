/// Error handling utility for user-friendly error messages
class ErrorHandler {
  /// Format exception into user-friendly message
  static String formatError(dynamic error) {
    final errorStr = error.toString();

    if (errorStr.contains('timeout') || errorStr.contains('TimedOut')) {
      return 'Request timed out. Server is responding slowly.\nPlease check your network connection.';
    }
    
    if (errorStr.contains('Connection refused') || 
        errorStr.contains('connection refused')) {
      return 'Cannot connect to server.\nMake sure the backend is running on port 8000.';
    }
    
    if (errorStr.contains('SocketException')) {
      return 'Network connection failed.\nPlease check your internet connection.';
    }
    
    if (errorStr.contains('404')) {
      return 'Resource not found.\nIt may have been deleted.';
    }
    
    if (errorStr.contains('401') || errorStr.contains('Unauthorized')) {
      return 'Authentication failed.\nPlease log in again.';
    }
    
    if (errorStr.contains('403') || errorStr.contains('Forbidden')) {
      return 'You do not have permission to perform this action.';
    }
    
    if (errorStr.contains('500') || errorStr.contains('500')) {
      return 'Server error. Please try again later.';
    }
    
    if (errorStr.contains('Empty response')) {
      return 'No data available.\nPlease try again.';
    }
    
    return 'Something went wrong. Please try again.';
  }

  /// Check if error is a network/connection error
  static bool isNetworkError(dynamic error) {
    final errorStr = error.toString();
    return errorStr.contains('Connection') ||
        errorStr.contains('SocketException') ||
        errorStr.contains('timeout');
  }

  /// Check if error is an authentication error
  static bool isAuthError(dynamic error) {
    final errorStr = error.toString();
    return errorStr.contains('401') || errorStr.contains('Unauthorized');
  }
}
