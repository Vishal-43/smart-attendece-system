// teacher_qr_otp_management_screen.dart
// Teacher/Admin screen for generating and managing QR codes and OTPs

import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../../services/qr_otp/qr_otp_service.dart';

class TeacherQrOtpManagementScreen extends StatefulWidget {
  const TeacherQrOtpManagementScreen({super.key});

  @override
  State<TeacherQrOtpManagementScreen> createState() =>
      _TeacherQrOtpManagementScreenState();
}

class _TeacherQrOtpManagementScreenState
    extends State<TeacherQrOtpManagementScreen>
    with SingleTickerProviderStateMixin {
  final _service = QrOtpService();
  late TabController _tabController;

  List<dynamic> _timetables = [];
  int? _selectedTimetableId;
  bool _loading = false;
  String? _errorMessage;

  // QR Code data
  String? _qrCode;
  String? _qrImageBase64;
  DateTime? _qrExpiresAt;

  // OTP data
  String? _otpCode;
  DateTime? _otpExpiresAt;

  Timer? _countdownTimer;
  int _timeRemaining = 0;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _tabController.addListener(_onTabChanged);
    _fetchTimetables();
  }

  @override
  void dispose() {
    _tabController.dispose();
    _countdownTimer?.cancel();
    super.dispose();
  }

  void _onTabChanged() {
    if (_tabController.indexIsChanging) {
      _countdownTimer?.cancel();
      setState(() {
        _timeRemaining = 0;
        _errorMessage = null;
      });
      _startCountdown();
    }
  }

  Future<void> _fetchTimetables() async {
    setState(() => _loading = true);
    try {
      final response = await _service.getTimetables();
      final data = response.data;
      setState(() {
        _timetables = data is Map ? (data['data'] ?? []) : (data ?? []);
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = 'Failed to load timetables: $e';
        _loading = false;
      });
    }
  }

  Future<void> _generateQR() async {
    if (_selectedTimetableId == null) return;

    setState(() {
      _loading = true;
      _errorMessage = null;
    });

    try {
      final response = await _service.generateQrCode(_selectedTimetableId!);
      final data = response.data['data'] ?? response.data;

      setState(() {
        _qrCode = data['code'];
        _qrImageBase64 = data['qr_image_base64'];
        _qrExpiresAt = DateTime.parse(data['expires_at']);
        _loading = false;
      });

      _startCountdown();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('QR Code generated successfully')),
        );
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Failed to generate QR: $e';
        _loading = false;
      });
    }
  }

  Future<void> _refreshQR() async {
    if (_selectedTimetableId == null) return;

    setState(() => _loading = true);

    try {
      final response = await _service.refreshQrCode(_selectedTimetableId!);
      final data = response.data['data'] ?? response.data;

      setState(() {
        _qrCode = data['code'];
        _qrImageBase64 = data['qr_image_base64'];
        _qrExpiresAt = DateTime.parse(data['expires_at']);
        _loading = false;
      });

      _startCountdown();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('QR Code refreshed')),
        );
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Failed to refresh QR: $e';
        _loading = false;
      });
    }
  }

  Future<void> _fetchCurrentQR() async {
    if (_selectedTimetableId == null) return;

    try {
      final response =
          await _service.getCurrentQr(_selectedTimetableId!, withImage: true);
      final data = response.data['data'] ?? response.data;

      setState(() {
        _qrCode = data['code'];
        _qrImageBase64 = data['qr_image_base64'];
        _qrExpiresAt = DateTime.parse(data['expires_at']);
      });

      _startCountdown();
    } catch (e) {
      // No active QR code - that's okay
      setState(() {
        _qrCode = null;
        _qrImageBase64 = null;
        _qrExpiresAt = null;
      });
    }
  }

  Future<void> _generateOTP() async {
    if (_selectedTimetableId == null) return;

    setState(() {
      _loading = true;
      _errorMessage = null;
    });

    try {
      final response = await _service.generateOtp(_selectedTimetableId!);
      final data = response.data['data'] ?? response.data;

      setState(() {
        _otpCode = data['code'];
        _otpExpiresAt = DateTime.parse(data['expires_at']);
        _loading = false;
      });

      _startCountdown();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('OTP generated successfully')),
        );
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Failed to generate OTP: $e';
        _loading = false;
      });
    }
  }

  Future<void> _refreshOTP() async {
    if (_selectedTimetableId == null) return;

    setState(() => _loading = true);

    try {
      final response = await _service.refreshOtp(_selectedTimetableId!);
      final data = response.data['data'] ?? response.data;

      setState(() {
        _otpCode = data['code'];
        _otpExpiresAt = DateTime.parse(data['expires_at']);
        _loading = false;
      });

      _startCountdown();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('OTP refreshed')),
        );
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Failed to refresh OTP: $e';
        _loading = false;
      });
    }
  }

  Future<void> _fetchCurrentOTP() async {
    if (_selectedTimetableId == null) return;

    try {
      final response = await _service.getCurrentOtp(_selectedTimetableId!);
      final data = response.data['data'] ?? response.data;

      setState(() {
        _otpCode = data['code'];
        _otpExpiresAt = DateTime.parse(data['expires_at']);
      });

      _startCountdown();
    } catch (e) {
      // No active OTP - that's okay
      setState(() {
        _otpCode = null;
        _otpExpiresAt = null;
      });
    }
  }

  void _startCountdown() {
    _countdownTimer?.cancel();

    final isQRTab = _tabController.index == 0;
    final expiresAt = isQRTab ? _qrExpiresAt : _otpExpiresAt;

    if (expiresAt == null) return;

    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      final remaining = expiresAt.difference(DateTime.now()).inSeconds;

      if (remaining <= 0) {
        timer.cancel();
        setState(() => _timeRemaining = 0);
      } else {
        setState(() => _timeRemaining = remaining);
      }
    });
  }

  void _onTimetableSelected(int? timetableId) {
    setState(() {
      _selectedTimetableId = timetableId;
      _qrCode = null;
      _qrImageBase64 = null;
      _qrExpiresAt = null;
      _otpCode = null;
      _otpExpiresAt = null;
      _timeRemaining = 0;
      _errorMessage = null;
    });

    if (timetableId != null) {
      if (_tabController.index == 0) {
        _fetchCurrentQR();
      } else {
        _fetchCurrentOTP();
      }
    }
  }

  String _formatTime(int seconds) {
    final mins = seconds ~/ 60;
    final secs = seconds % 60;
    return '${mins.toString().padLeft(2, '0')}:${secs.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('QR & OTP Management'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(icon: Icon(Icons.qr_code), text: 'QR Code'),
            Tab(icon: Icon(Icons.password), text: 'OTP'),
          ],
        ),
      ),
      body: _loading && _timetables.isEmpty
          ? const Center(child: CircularProgressIndicator())
          : Column(
              children: [
                // Timetable Selector
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: DropdownButtonFormField<int>(
                    decoration: const InputDecoration(
                      labelText: 'Select Timetable',
                      border: OutlineInputBorder(),
                    ),
                    value: _selectedTimetableId,
                    items: _timetables.map<DropdownMenuItem<int>>((tt) {
                      return DropdownMenuItem<int>(
                        value: tt['id'],
                        child: Text(
                          '${tt['subject']} - ${tt['day_of_week']} ${tt['start_time']}',
                        ),
                      );
                    }).toList(),
                    onChanged: _onTimetableSelected,
                  ),
                ),

                if (_errorMessage != null)
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16.0),
                    child: Text(
                      _errorMessage!,
                      style: const TextStyle(color: Colors.red),
                    ),
                  ),

                Expanded(
                  child: TabBarView(
                    controller: _tabController,
                    children: [
                      _buildQRTab(),
                      _buildOTPTab(),
                    ],
                  ),
                ),
              ],
            ),
    );
  }

  Widget _buildQRTab() {
    if (_selectedTimetableId == null) {
      return const Center(child: Text('Please select a timetable'));
    }

    if (_qrCode == null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text('No active QR code for this timetable'),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: _loading ? null : _generateQR,
              icon: const Icon(Icons.qr_code),
              label: const Text('Generate QR Code'),
            ),
          ],
        ),
      );
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        children: [
          if (_qrImageBase64 != null)
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.grey.shade300),
              ),
              child: Image.memory(
                base64Decode(_qrImageBase64!),
                width: 300,
                height: 300,
              ),
            )
          else if (_qrCode != null)
            QrImageView(
              data: _qrCode!,
              version: QrVersions.auto,
              size: 300.0,
              backgroundColor: Colors.white,
            ),
          const SizedBox(height: 24),
          Text(
            'Code: $_qrCode',
            style: const TextStyle(fontSize: 16),
          ),
          const SizedBox(height: 16),
          Text(
            'Expires in: ${_formatTime(_timeRemaining)}',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: _timeRemaining < 60 ? Colors.red : Colors.black,
            ),
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: _loading ? null : _refreshQR,
            icon: const Icon(Icons.refresh),
            label: const Text('Refresh QR Code'),
          ),
        ],
      ),
    );
  }

  Widget _buildOTPTab() {
    if (_selectedTimetableId == null) {
      return const Center(child: Text('Please select a timetable'));
    }

    if (_otpCode == null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text('No active OTP for this timetable'),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: _loading ? null : _generateOTP,
              icon: const Icon(Icons.password),
              label: const Text('Generate OTP'),
            ),
          ],
        ),
      );
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 48, vertical: 24),
            decoration: BoxDecoration(
              color: Colors.blue.shade50,
              border: Border.all(color: Colors.blue, width: 2),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(
              _otpCode!,
              style: const TextStyle(
                fontSize: 48,
                fontWeight: FontWeight.bold,
                letterSpacing: 8,
                fontFamily: 'Courier',
              ),
            ),
          ),
          const SizedBox(height: 24),
          Text(
            'Expires in: ${_formatTime(_timeRemaining)}',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: _timeRemaining < 60 ? Colors.red : Colors.black,
            ),
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: _loading ? null : _refreshOTP,
            icon: const Icon(Icons.refresh),
            label: const Text('Refresh OTP'),
          ),
        ],
      ),
    );
  }
}
