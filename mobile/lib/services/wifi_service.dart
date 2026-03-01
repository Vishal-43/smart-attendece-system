// wifi_service.dart
// Service for getting WiFi SSID and BSSID using network_info_plus

import 'package:network_info_plus/network_info_plus.dart';
import 'package:permission_handler/permission_handler.dart';
import 'dart:io';

class WifiService {
  final NetworkInfo _networkInfo = NetworkInfo();

  /// Get current WiFi SSID (network name)
  Future<String?> getWifiSSID() async {
    try {
      // Request location permission (required for WiFi info on Android)
      if (Platform.isAndroid) {
        final status = await Permission.locationWhenInUse.request();
        if (!status.isGranted) {
          return null;
        }
      }

      final ssid = await _networkInfo.getWifiName();
      return ssid;
    } catch (e) {
      print('Error getting WiFi SSID: $e');
      return null;
    }
  }

  /// Get current WiFi BSSID (router MAC address)
  Future<String?> getWifiBSSID() async {
    try {
      if (Platform.isAndroid) {
        final status = await Permission.locationWhenInUse.request();
        if (!status.isGranted) {
          return null;
        }
      }

      final bssid = await _networkInfo.getWifiBSSID();
      return bssid;
    } catch (e) {
      print('Error getting WiFi BSSID: $e');
      return null;
    }
  }

  /// Get complete WiFi info as a formatted string
  Future<String> getWifiInfo() async {
    final ssid = await getWifiSSID();
    final bssid = await getWifiBSSID();
    
    if (ssid == null && bssid == null) {
      return 'Not connected to WiFi';
    }
    
    return 'SSID: ${ssid ?? "Unknown"}, BSSID: ${bssid ?? "Unknown"}';
  }
}
