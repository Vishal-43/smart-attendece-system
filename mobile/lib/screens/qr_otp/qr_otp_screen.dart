
import 'package:flutter/material.dart';
import '../../services/qr_otp/qr_otp_service.dart';
import 'package:shared_preferences/shared_preferences.dart';

class QrOtpScreen extends StatefulWidget {
  const QrOtpScreen({super.key});

  @override
  State<QrOtpScreen> createState() => _QrOtpScreenState();
}

class _QrOtpScreenState extends State<QrOtpScreen> {
  bool _loading = false;
  String? _result;
  String? _qrCode;
  String? _otp;

  Future<String?> _getUserId() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('user_id');
  }

  Future<void> _generateQrCode() async {
    final userId = await _getUserId();
    if (userId == null) {
      setState(() => _result = 'User not logged in.');
      return;
    }
    setState(() {
      _loading = true;
      _result = null;
      _qrCode = null;
    });
    try {
      final service = QrOtpService();
      final response = await service.generateQrCode(userId);
      setState(() => _qrCode = response.data['qr_code']?.toString() ?? 'No QR code received.');
    } catch (e) {
      setState(() => _result = 'Failed: $e');
    } finally {
      setState(() => _loading = false);
    }
  }

  Future<void> _generateOtp() async {
    final userId = await _getUserId();
    if (userId == null) {
      setState(() => _result = 'User not logged in.');
      return;
    }
    setState(() {
      _loading = true;
      _result = null;
      _otp = null;
    });
    try {
      final service = QrOtpService();
      final response = await service.generateOtp(userId);
      setState(() => _otp = response.data['otp']?.toString() ?? 'No OTP received.');
    } catch (e) {
      setState(() => _result = 'Failed: $e');
    } finally {
      setState(() => _loading = false);
    }
  }

  Future<void> _verifyQrCode() async {
    final controller = TextEditingController();
    final code = await showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Enter QR Code'),
        content: TextField(
          controller: controller,
          decoration: const InputDecoration(hintText: 'Enter QR code'),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, controller.text.trim()),
            child: const Text('Verify'),
          ),
        ],
      ),
    );
    if (code == null || code.isEmpty) return;
    setState(() {
      _loading = true;
      _result = null;
    });
    try {
      final service = QrOtpService();
      final response = await service.verifyQrCode(code);
      setState(() => _result = response.data['message'] ?? 'QR code verified!');
    } catch (e) {
      setState(() => _result = 'Failed: $e');
    } finally {
      setState(() => _loading = false);
    }
  }

  Future<void> _verifyOtp() async {
    final controller = TextEditingController();
    final code = await showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Enter OTP'),
        content: TextField(
          controller: controller,
          decoration: const InputDecoration(hintText: 'Enter OTP'),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, controller.text.trim()),
            child: const Text('Verify'),
          ),
        ],
      ),
    );
    if (code == null || code.isEmpty) return;
    setState(() {
      _loading = true;
      _result = null;
    });
    try {
      final service = QrOtpService();
      final response = await service.verifyOtp(code);
      setState(() => _result = response.data['message'] ?? 'OTP verified!');
    } catch (e) {
      setState(() => _result = 'Failed: $e');
    } finally {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('QR/OTP'),
      ),
      body: Center(
        child: SingleChildScrollView(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              ElevatedButton(
                onPressed: _loading ? null : _generateQrCode,
                child: const Text('Generate QR Code'),
              ),
              if (_qrCode != null) ...[
                Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: Text('QR Code: $_qrCode'),
                ),
                ElevatedButton(
                  onPressed: _loading ? null : _verifyQrCode,
                  child: const Text('Verify QR Code'),
                ),
              ],
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: _loading ? null : _generateOtp,
                child: const Text('Generate OTP'),
              ),
              if (_otp != null) ...[
                Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: Text('OTP: $_otp'),
                ),
                ElevatedButton(
                  onPressed: _loading ? null : _verifyOtp,
                  child: const Text('Verify OTP'),
                ),
              ],
              if (_loading) const Padding(
                padding: EdgeInsets.all(16.0),
                child: CircularProgressIndicator(),
              ),
              if (_result != null) Padding(
                padding: const EdgeInsets.all(16.0),
                child: Text(_result!, style: const TextStyle(color: Colors.red)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
