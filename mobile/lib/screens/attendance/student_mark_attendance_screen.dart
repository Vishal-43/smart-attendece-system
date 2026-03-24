import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import '../../services/location_service.dart';
import '../../services/wifi_service.dart';
import '../../services/qr_otp/qr_otp_service.dart';
import '../../core/network/network_result.dart';
import '../../features/attendance/attendance_repository.dart';
import 'package:geolocator/geolocator.dart';

class StudentMarkAttendanceScreen extends StatefulWidget {
  final int timetableId;

  const StudentMarkAttendanceScreen({super.key, required this.timetableId});

  @override
  State<StudentMarkAttendanceScreen> createState() =>
      _StudentMarkAttendanceScreenState();
}

class _StudentMarkAttendanceScreenState
    extends State<StudentMarkAttendanceScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _otpController = TextEditingController();
  final _otpFormKey = GlobalKey<FormState>();
  final _repo = const AttendanceRepository();
  final _locationService = LocationService();
  final _wifiService = WifiService();
  final _qrOtpService = QrOtpService();

  MobileScannerController? _scannerController;
  bool _isSubmitting = false;
  String? _successMessage;
  String? _errorMessage;
  bool _hasScanned = false;

  bool _loadingSession = true;
  Map<String, dynamic>? _activeQr;
  Map<String, dynamic>? _activeOtp;
  int _qrExpiresIn = 0;
  int _otpExpiresIn = 0;
  Timer? _refreshTimer;
  Timer? _countdownTimer;

  Position? _position;
  String? _wifiInfo;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _tabController.addListener(_onTabChanged);
    _initializeServices();
    _fetchSessionStatus();
    _startAutoRefresh();
  }

  @override
  void dispose() {
    _refreshTimer?.cancel();
    _countdownTimer?.cancel();
    _tabController.dispose();
    _otpController.dispose();
    _scannerController?.dispose();
    super.dispose();
  }

  void _startAutoRefresh() {
    _refreshTimer?.cancel();
    _countdownTimer?.cancel();

    _refreshTimer = Timer.periodic(const Duration(seconds: 5), (_) {
      if (mounted) _fetchSessionStatus(showLoading: false);
    });

    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (mounted) {
        setState(() {
          if (_qrExpiresIn > 0) _qrExpiresIn--;
          if (_otpExpiresIn > 0) _otpExpiresIn--;
        });
      }
    });
  }

  Future<void> _fetchSessionStatus({bool showLoading = true}) async {
    if (showLoading) {
      setState(() => _loadingSession = true);
    }

    try {
      final qrResponse = await _qrOtpService.getQrStatus(widget.timetableId);
      final otpResponse = await _qrOtpService.getOtpStatus(widget.timetableId);

      if (mounted) {
        setState(() {
          final qrData = qrResponse.data as Map<String, dynamic>?;
          final otpData = otpResponse.data as Map<String, dynamic>?;

          _activeQr = qrData?['has_active'] == true
              ? {'has_active': true, 'expires_in': qrData?['expires_in'] ?? 0}
              : null;
          _activeOtp = otpData?['has_active'] == true
              ? {'has_active': true, 'expires_in': otpData?['expires_in'] ?? 0}
              : null;

          if (_activeQr != null) {
            _qrExpiresIn = _activeQr!['expires_in'] ?? 0;
          }
          if (_activeOtp != null) {
            _otpExpiresIn = _activeOtp!['expires_in'] ?? 0;
          }

          _loadingSession = false;
        });
      }
    } catch (e) {
      debugPrint('Session status error: $e');
      if (mounted) {
        setState(() {
          _loadingSession = false;
        });
      }
    }
  }

  void _onTabChanged() {
    if (_tabController.index == 0) {
      _hasScanned = false;
      _scannerController?.start();
    } else {
      _scannerController?.stop();
    }

    setState(() {
      _successMessage = null;
      _errorMessage = null;
    });
  }

  void _showSuccessDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.green.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.check_circle,
                color: Colors.green,
                size: 64,
              ),
            ),
            const SizedBox(height: 20),
            const Text(
              'Attendance Marked!',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              'Your attendance has been successfully recorded.',
              style: TextStyle(color: Colors.grey[600]),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: FilledButton(
                onPressed: () {
                  Navigator.pop(context);
                  Navigator.pop(context);
                },
                style: FilledButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: const Text('Done'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _initializeServices() async {
    try {
      _position = await _locationService.getCurrentLocation();
    } catch (e) {
      debugPrint('Location error: $e');
    }

    try {
      final wifiInfo = await _wifiService.getCompleteWifiInfo();
      _wifiInfo =
          'SSID: ${wifiInfo['ssid'] ?? 'Unknown'}, BSSID: ${wifiInfo['bssid'] ?? 'Unknown'}';
    } catch (e) {
      debugPrint('WiFi error: $e');
    }
  }

  Future<String?> _getBssid() async {
    try {
      return await _wifiService.getWifiBSSID();
    } catch (e) {
      debugPrint('Error getting BSSID: $e');
      return null;
    }
  }

  String _formatTime(int seconds) {
    final mins = seconds ~/ 60;
    final secs = seconds % 60;
    return '${mins.toString().padLeft(2, '0')}:${secs.toString().padLeft(2, '0')}';
  }

  Future<void> _markAttendance(String method, String code) async {
    if (_isSubmitting) return;

    setState(() {
      _isSubmitting = true;
      _successMessage = null;
      _errorMessage = null;
    });

    try {
      _position ??= await _locationService.getCurrentLocation();
      final bssid = await _getBssid();

      final result = await _repo.markAttendance(
        timetableId: widget.timetableId,
        method: method,
        code: code.trim(),
        latitude: _position?.latitude,
        longitude: _position?.longitude,
        bssid: bssid,
        deviceInfo: _wifiInfo,
      );

      if (!mounted) return;

      if (result is Success) {
        setState(() {
          _successMessage = 'Attendance marked successfully!';
          _isSubmitting = false;
        });

        if (method == 'otp') {
          _otpController.clear();
        }

        _showSuccessDialog();
      } else if (result is Failure) {
        final error = result.errorOrNull;
        String message = error?.message ?? 'Unknown error';

        if (error != null && error.data != null && error.data is Map) {
          final data = error.data as Map;
          if (data['message'] != null) {
            message = data['message'].toString();
          }
        }

        if (message.toLowerCase().contains('invalid code')) {
          message =
              'Invalid or expired code. Ask your teacher to generate a new one.';
        } else if (message.toLowerCase().contains('expired')) {
          message =
              'The code has expired. Ask your teacher to generate a new one.';
        } else if (message.toLowerCase().contains('already marked')) {
          message =
              'You have already marked attendance for this session today.';
        } else if (message.toLowerCase().contains('not enrolled')) {
          message = 'You are not enrolled in this class.';
        } else if (message.toLowerCase().contains('location')) {
          message =
              'You are not at the correct location. Please check with your teacher.';
        } else if (message.toLowerCase().contains('wifi') ||
            message.toLowerCase().contains('authorized')) {
          message = 'You are not connected to the authorized WiFi network.';
        }

        setState(() {
          _errorMessage = message;
          _isSubmitting = false;
          _hasScanned = false;
        });
      }
    } catch (e, stackTrace) {
      debugPrint('Mark attendance error: $e\n$stackTrace');
      setState(() {
        _errorMessage = 'An unexpected error occurred. Please try again.';
        _isSubmitting = false;
        _hasScanned = false;
      });
    }
  }

  void _onQRDetected(BarcodeCapture capture) {
    if (_hasScanned || _isSubmitting) return;

    final scannedCode = capture.barcodes.firstOrNull?.rawValue;
    if (scannedCode != null && scannedCode.isNotEmpty) {
      _hasScanned = true;
      _scannerController?.stop();

      String codeToSubmit = scannedCode;

      if (scannedCode.startsWith('{')) {
        try {
          final qrData = jsonDecode(scannedCode) as Map<String, dynamic>;
          codeToSubmit = qrData['code']?.toString() ?? scannedCode;
        } catch (e) {
          debugPrint('Failed to parse QR JSON: $e');
        }
      }

      _markAttendance('qr', codeToSubmit);
    }
  }

  void _submitOTP() {
    if (_otpFormKey.currentState?.validate() ?? false) {
      _markAttendance('otp', _otpController.text);
    }
  }

  Widget _buildSessionStatus() {
    final colors = Theme.of(context).colorScheme;
    final hasQrSession = _activeQr != null && _qrExpiresIn > 0;
    final hasOtpSession = _activeOtp != null && _otpExpiresIn > 0;

    if (_loadingSession) {
      return Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: colors.surfaceContainerHighest,
          borderRadius: BorderRadius.circular(12),
        ),
        child: const Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            SizedBox(
              width: 16,
              height: 16,
              child: CircularProgressIndicator(strokeWidth: 2),
            ),
            SizedBox(width: 8),
            Text('Checking for active sessions...'),
          ],
        ),
      );
    }

    if (!hasQrSession && !hasOtpSession) {
      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: colors.errorContainer.withValues(alpha: 0.3),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: colors.error.withValues(alpha: 0.3)),
        ),
        child: Row(
          children: [
            Icon(Icons.warning_amber_rounded, color: colors.error),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'No active session',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      color: colors.error,
                    ),
                  ),
                  Text(
                    'Ask your teacher to start QR/OTP attendance',
                    style: TextStyle(fontSize: 12, color: colors.error),
                  ),
                ],
              ),
            ),
            IconButton(
              icon: const Icon(Icons.refresh),
              onPressed: _fetchSessionStatus,
            ),
          ],
        ),
      );
    }

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: colors.primaryContainer.withValues(alpha: 0.3),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: colors.primary.withValues(alpha: 0.3)),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Icon(Icons.check_circle, color: colors.primary),
              const SizedBox(width: 8),
              Text(
                'Session Active',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  color: colors.primary,
                ),
              ),
              const Spacer(),
              IconButton(
                icon: const Icon(Icons.refresh, size: 20),
                onPressed: _fetchSessionStatus,
                visualDensity: VisualDensity.compact,
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              if (hasQrSession) ...[
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 8,
                    ),
                    decoration: BoxDecoration(
                      color: colors.primaryContainer,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.qr_code, size: 16, color: colors.primary),
                        const SizedBox(width: 6),
                        Text(
                          'QR: ${_formatTime(_qrExpiresIn)}',
                          style: TextStyle(
                            fontWeight: FontWeight.w600,
                            color: colors.primary,
                            fontSize: 13,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
              if (hasQrSession && hasOtpSession) const SizedBox(width: 8),
              if (hasOtpSession) ...[
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 8,
                    ),
                    decoration: BoxDecoration(
                      color: colors.secondaryContainer,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.password, size: 16, color: colors.secondary),
                        const SizedBox(width: 6),
                        Text(
                          'OTP: ${_formatTime(_otpExpiresIn)}',
                          style: TextStyle(
                            fontWeight: FontWeight.w600,
                            color: colors.secondary,
                            fontSize: 13,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ],
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Mark Attendance'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _fetchSessionStatus,
            tooltip: 'Refresh session',
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
            child: _buildSessionStatus(),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Container(
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.surfaceContainerHighest,
                borderRadius: BorderRadius.circular(12),
              ),
              child: TabBar(
                controller: _tabController,
                indicator: BoxDecoration(
                  color: Theme.of(context).colorScheme.primary,
                  borderRadius: BorderRadius.circular(10),
                ),
                indicatorSize: TabBarIndicatorSize.tab,
                dividerColor: Colors.transparent,
                labelColor: Colors.white,
                unselectedLabelColor: Theme.of(
                  context,
                ).colorScheme.onSurfaceVariant,
                labelStyle: const TextStyle(
                  fontWeight: FontWeight.w600,
                  fontSize: 14,
                ),
                tabs: const [
                  Tab(
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.qr_code_scanner, size: 20),
                        SizedBox(width: 8),
                        Text('QR Code'),
                      ],
                    ),
                  ),
                  Tab(
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.password, size: 20),
                        SizedBox(width: 8),
                        Text('OTP Code'),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [_buildQRScannerTab(), _buildOTPTab()],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQRScannerTab() {
    final colors = Theme.of(context).colorScheme;
    final hasQrSession = _activeQr != null && _qrExpiresIn > 0;

    if (!hasQrSession && !_loadingSession) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: colors.errorContainer,
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  Icons.qr_code_scanner,
                  size: 64,
                  color: colors.error,
                ),
              ),
              const SizedBox(height: 24),
              Text(
                'No QR Session Active',
                style: Theme.of(
                  context,
                ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Text(
                'Your teacher needs to start a QR attendance session first',
                textAlign: TextAlign.center,
                style: TextStyle(color: colors.onSurfaceVariant),
              ),
            ],
          ),
        ),
      );
    }

    return Stack(
      children: [
        MobileScanner(
          controller: _scannerController ??= MobileScannerController(
            detectionSpeed: DetectionSpeed.normal,
            facing: CameraFacing.back,
          ),
          onDetect: _onQRDetected,
        ),
        if (_isSubmitting || _successMessage != null || _errorMessage != null)
          Container(
            color: colors.scrim.withValues(alpha: 0.54),
            child: Center(
              child: Card(
                margin: const EdgeInsets.all(24),
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      if (_isSubmitting)
                        const CircularProgressIndicator()
                      else if (_successMessage != null)
                        Column(
                          children: [
                            Icon(
                              Icons.check_circle,
                              color: colors.primary,
                              size: 64,
                            ),
                            const SizedBox(height: 16),
                            Text(
                              _successMessage!,
                              style: const TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ],
                        )
                      else if (_errorMessage != null)
                        Column(
                          children: [
                            Icon(Icons.error, color: colors.error, size: 64),
                            const SizedBox(height: 16),
                            Text(
                              _errorMessage!,
                              style: TextStyle(
                                fontSize: 16,
                                color: colors.error,
                              ),
                              textAlign: TextAlign.center,
                            ),
                            const SizedBox(height: 16),
                            ElevatedButton(
                              onPressed: () {
                                setState(() {
                                  _errorMessage = null;
                                  _hasScanned = false;
                                });
                                _scannerController?.start();
                              },
                              child: const Text('Try Again'),
                            ),
                          ],
                        ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        Positioned(
          bottom: 0,
          left: 0,
          right: 0,
          child: Container(
            padding: const EdgeInsets.all(16),
            color: colors.scrim.withValues(alpha: 0.54),
            child: Column(
              children: [
                Text(
                  'Point camera at QR code',
                  style: TextStyle(
                    color: colors.onSurface,
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                if (_qrExpiresIn > 0) ...[
                  const SizedBox(height: 4),
                  Text(
                    'QR expires in ${_formatTime(_qrExpiresIn)}',
                    style: TextStyle(
                      color: _qrExpiresIn < 60
                          ? colors.error
                          : colors.onSurface,
                      fontSize: 12,
                    ),
                  ),
                ],
                if (_position != null) ...[
                  const SizedBox(height: 4),
                  Text(
                    'Location: ${_position!.latitude.toStringAsFixed(6)}, ${_position!.longitude.toStringAsFixed(6)}',
                    style: TextStyle(
                      color: colors.onSurface.withValues(alpha: 0.8),
                      fontSize: 11,
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildOTPTab() {
    final colors = Theme.of(context).colorScheme;
    final hasOtpSession = _activeOtp != null && _otpExpiresIn > 0;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Form(
        key: _otpFormKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Session Status Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: hasOtpSession
                    ? colors.secondaryContainer
                    : colors.surfaceContainerHighest,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: hasOtpSession
                      ? colors.secondary
                      : colors.outline.withValues(alpha: 0.3),
                ),
              ),
              child: Column(
                children: [
                  Icon(
                    hasOtpSession ? Icons.timer : Icons.timer_off,
                    color: hasOtpSession ? colors.secondary : colors.outline,
                    size: 40,
                  ),
                  const SizedBox(height: 12),
                  Text(
                    hasOtpSession ? 'OTP Session Active' : 'No OTP Session',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: hasOtpSession
                          ? colors.onSecondaryContainer
                          : colors.onSurfaceVariant,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    hasOtpSession
                        ? 'Expires in ${_formatTime(_otpExpiresIn)}'
                        : 'Ask your teacher to start OTP attendance',
                    style: TextStyle(
                      fontSize: 14,
                      color: hasOtpSession
                          ? colors.onSecondaryContainer.withValues(alpha: 0.8)
                          : colors.outline,
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // OTP Input
            Text(
              'Enter 6-digit OTP',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: colors.onSurface,
              ),
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _otpController,
              enabled: hasOtpSession && !_isSubmitting,
              decoration: InputDecoration(
                labelText: 'OTP Code',
                hintText: hasOtpSession
                    ? 'Enter code shown by teacher'
                    : 'No active session',
                prefixIcon: const Icon(Icons.password),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                filled: !hasOtpSession,
                fillColor: colors.surfaceContainerHighest,
              ),
              keyboardType: TextInputType.number,
              maxLength: 6,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                letterSpacing: 8,
              ),
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Please enter OTP';
                }
                if (value.length != 6) {
                  return 'OTP must be 6 digits';
                }
                return null;
              },
            ),

            const SizedBox(height: 16),

            // Location Info
            if (_position != null)
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: colors.primaryContainer.withValues(alpha: 0.5),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    Icon(Icons.location_on, size: 20, color: colors.primary),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Location: ${_position!.latitude.toStringAsFixed(4)}, ${_position!.longitude.toStringAsFixed(4)}',
                        style: TextStyle(
                          fontSize: 12,
                          color: colors.onSurfaceVariant,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),

            if (_wifiInfo != null) ...[
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: colors.secondaryContainer.withValues(alpha: 0.5),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    Icon(Icons.wifi, size: 20, color: colors.secondary),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        _wifiInfo!,
                        style: TextStyle(
                          fontSize: 12,
                          color: colors.onSurfaceVariant,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),
            ],

            // Error Message
            if (_errorMessage != null) ...[
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: colors.errorContainer,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    Icon(Icons.error_outline, color: colors.error, size: 24),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        _errorMessage!,
                        style: TextStyle(
                          color: colors.onErrorContainer,
                          fontSize: 14,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],

            // Success Message
            if (_successMessage != null) ...[
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: colors.primaryContainer,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    Icon(Icons.check_circle, color: colors.primary, size: 24),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        _successMessage!,
                        style: TextStyle(
                          color: colors.onPrimaryContainer,
                          fontSize: 14,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],

            const SizedBox(height: 24),

            // Submit Button
            FilledButton.icon(
              onPressed: (hasOtpSession && !_isSubmitting) ? _submitOTP : null,
              icon: _isSubmitting
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Icon(Icons.check),
              label: Text(_isSubmitting ? 'Submitting...' : 'Mark Attendance'),
              style: FilledButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
