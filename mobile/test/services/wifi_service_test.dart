// Test for WiFi service
import 'package:flutter_test/flutter_test.dart';
import 'package:smart_attendance/services/wifi_service.dart';

void main() {
  group('WifiService Tests', () {
    late WifiService wifiService;

    setUp(() {
      wifiService = WifiService();
    });

    test('WifiService can be instantiated', () {
      expect(wifiService, isNotNull);
      expect(wifiService, isA<WifiService>());
    });

    test('getCompleteWifiInfo returns map', () async {
      final info = await wifiService.getCompleteWifiInfo();
      expect(info, isA<Map<String, String?>>());
    });

    test('getWifiSSID returns string or null', () async {
      final ssid = await wifiService.getWifiSSID();
      expect(ssid, isA<dynamic>());
    });

    test('getWifiBSSID returns string or null', () async {
      final bssid = await wifiService.getWifiBSSID();
      expect(bssid, isA<dynamic>());
    });

    test('formatMacAddress formats correctly', () {
      expect(
        wifiService.formatMacAddress('AA:BB:CC:DD:EE:FF'),
        'AA:BB:CC:DD:EE:FF',
      );
      expect(wifiService.formatMacAddress('AABBCCDDEEFF'), 'AA:BB:CC:DD:EE:FF');
      expect(
        wifiService.formatMacAddress('aa:bb:cc:dd:ee:ff'),
        'AA:BB:CC:DD:EE:FF',
      );
    });
  });
}
