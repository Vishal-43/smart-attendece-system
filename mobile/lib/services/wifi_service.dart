// wifi_service.dart
// Service for getting WiFi SSID, BSSID, and IP using network_info_plus

import 'package:flutter/foundation.dart';
import 'package:network_info_plus/network_info_plus.dart';
import 'package:permission_handler/permission_handler.dart';
import 'dart:io';

class WifiService {
  final NetworkInfo _networkInfo = NetworkInfo();

  /// Get current WiFi SSID (network name)
  Future<String?> getWifiSSID() async {
    try {
      if (Platform.isAndroid) {
        final status = await Permission.locationWhenInUse.request();
        if (!status.isGranted) {
          return null;
        }
      }

      final ssid = await _networkInfo.getWifiName();
      return ssid?.replaceAll('"', '');
    } catch (e) {
      debugPrint('Error getting WiFi SSID: $e');
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
      debugPrint('Error getting WiFi BSSID: $e');
      return null;
    }
  }

  /// Get the device's local IP address on the WiFi network
  Future<String?> getWifiIP() async {
    try {
      if (Platform.isAndroid) {
        final status = await Permission.locationWhenInUse.request();
        if (!status.isGranted) {
          return null;
        }
      }

      final ip = await _networkInfo.getWifiIP();
      return ip;
    } catch (e) {
      debugPrint('Error getting WiFi IP: $e');
      return null;
    }
  }

  /// Get gateway IP (router IP)
  Future<String?> getWifiGatewayIP() async {
    try {
      if (Platform.isAndroid) {
        final status = await Permission.locationWhenInUse.request();
        if (!status.isGranted) {
          return null;
        }
      }

      final gateway = await _networkInfo.getWifiGatewayIP();
      return gateway;
    } catch (e) {
      debugPrint('Error getting WiFi Gateway IP: $e');
      return null;
    }
  }

  /// Get complete WiFi info
  Future<Map<String, String?>> getCompleteWifiInfo() async {
    final ssid = await getWifiSSID();
    final bssid = await getWifiBSSID();
    final ip = await getWifiIP();
    final gateway = await getWifiGatewayIP();

    return {'ssid': ssid, 'bssid': bssid, 'ip': ip, 'gateway': gateway};
  }

  /// Format MAC address to standard format (AA:BB:CC:DD:EE:FF)
  String formatMacAddress(String? mac) {
    if (mac == null || mac.isEmpty) return '';

    final cleaned = mac.replaceAll(':', '').replaceAll('-', '').toUpperCase();
    if (cleaned.length != 12) return mac;

    final parts = <String>[];
    for (var i = 0; i < 12; i += 2) {
      parts.add(cleaned.substring(i, i + 2));
    }
    return parts.join(':');
  }
}
