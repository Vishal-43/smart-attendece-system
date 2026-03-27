class ApiConfig {
  static const String _buildUrl = String.fromEnvironment('API_BASE_URL');
  static const String _defaultUrl = 'https://smart-attendece-system-api.onrender.com/api/v1';

  static String get baseUrl {
    if (_buildUrl.isNotEmpty) {
      return _buildUrl;
    }
    return _defaultUrl;
  }

  static const Duration connectTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);
}
