// qr_otp_screen.dart
// Student-facing screen for marking attendance via QR code or OTP.
// Accepts timetable_id as a navigation argument.
// Navigator.pushNamed(context, '/qr-otp', arguments: {'timetableId': 42})

import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:geolocator/geolocator.dart';
import '../../core/theme/app_theme.dart';
import '../../core/network/network_result.dart';
import '../../features/attendance/attendance_repository.dart';
import '../../services/location_service.dart';
import '../../services/wifi_service.dart';

class QrOtpScreen extends StatefulWidget {
  const QrOtpScreen({super.key});

  @override
  State<QrOtpScreen> createState() => _QrOtpScreenState();
}

class _QrOtpScreenState extends State<QrOtpScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tabController;
  final _repo = const AttendanceRepository();
  final _locationService = LocationService();
  final _wifiService = WifiService();

  final _qrController = TextEditingController();
  final _otpController = TextEditingController();
  final _qrFormKey = GlobalKey<FormState>();
  final _otpFormKey = GlobalKey<FormState>();

  MobileScannerController? _scannerController;
  bool _isScannerActive = false;

  int? _timetableId;
  bool _isSubmitting = false;
  String? _successMessage;
  String? _errorMessage;

  Position? _currentPosition;
  String? _currentBssid;
  String? _currentSsid;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _tabController.addListener(() {
      if (_tabController.indexIsChanging) {
        setState(() {
          _successMessage = null;
          _errorMessage = null;
        });
      }
    });
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final args = ModalRoute.of(context)?.settings.arguments;
    if (args is Map<String, dynamic>) {
      _timetableId = args['timetableId'] as int?;
    }
  }

  @override
  void dispose() {
    _tabController.dispose();
    _qrController.dispose();
    _otpController.dispose();
    _scannerController?.dispose();
    super.dispose();
  }

  Future<void> _collectLocationAndWifi() async {
    try {
      _currentPosition = await _locationService.getCurrentLocation();
      final wifiInfo = await _wifiService.getCompleteWifiInfo();
      _currentBssid = wifiInfo['bssid'];
      _currentSsid = wifiInfo['ssid'];
    } catch (e) {
      debugPrint('Error collecting location/wifi: $e');
    }
  }

  Future<void> _submit(String method, String code) async {
    if (_timetableId == null) {
      setState(
        () => _errorMessage = 'No session selected. Go back and try again.',
      );
      return;
    }

    setState(() {
      _isSubmitting = true;
      _successMessage = null;
      _errorMessage = null;
    });

    await _collectLocationAndWifi();

    final result = await _repo.markAttendance(
      timetableId: _timetableId!,
      method: method,
      code: code.trim(),
      latitude: _currentPosition?.latitude,
      longitude: _currentPosition?.longitude,
      bssid: _currentBssid,
      deviceInfo: 'Mobile App - ${_currentSsid ?? "Unknown WiFi"}',
    );

    if (!mounted) return;

    if (result is Success) {
      setState(() {
        _successMessage = 'Attendance marked successfully!';
        _isSubmitting = false;
      });
      if (method == 'qr') {
        _qrController.clear();
      } else {
        _otpController.clear();
      }
    } else if (result is Failure) {
      setState(() {
        _errorMessage = (result as Failure).error.message;
        _isSubmitting = false;
      });
    }
  }

  void _toggleScanner() {
    if (_isScannerActive) {
      _scannerController?.stop();
      setState(() {
        _isScannerActive = false;
      });
    } else {
      _scannerController = MobileScannerController(
        detectionSpeed: DetectionSpeed.normal,
        facing: CameraFacing.back,
      );
      setState(() {
        _isScannerActive = true;
      });
    }
  }

  void _onBarcodeDetected(BarcodeCapture capture) {
    if (capture.barcodes.isEmpty) return;

    final barcode = capture.barcodes.first;
    final rawValue = barcode.rawValue;

    if (rawValue == null) return;

    try {
      final Map<String, dynamic> qrData = jsonDecode(rawValue);
      final code = qrData['code'] as String?;
      final timetableIdFromQr = qrData['timetable_id'] as int?;

      if (code != null && code.isNotEmpty) {
        _scannerController?.stop();
        setState(() {
          _isScannerActive = false;
        });

        if (_timetableId != null &&
            timetableIdFromQr != null &&
            _timetableId != timetableIdFromQr) {
          setState(() => _errorMessage = 'QR code is for a different session');
          return;
        }

        _qrController.text = code;
        _submit('qr', code);
      }
    } catch (e) {
      debugPrint('Error parsing QR code: $e');
      setState(() => _errorMessage = 'Invalid QR code format');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Mark Attendance'),
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppColors.primary,
          unselectedLabelColor: AppColors.textMuted,
          indicatorColor: AppColors.primary,
          tabs: const [
            Tab(icon: Icon(Icons.qr_code_scanner_rounded), text: 'QR Code'),
            Tab(icon: Icon(Icons.pin_outlined), text: 'OTP'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _QrPanel(
            controller: _qrController,
            formKey: _qrFormKey,
            isSubmitting: _isSubmitting,
            isScannerActive: _isScannerActive,
            successMessage: _successMessage,
            errorMessage: _errorMessage,
            onSubmit: () {
              if (_qrFormKey.currentState?.validate() ?? false) {
                _submit('qr', _qrController.text);
              }
            },
            onToggleScanner: _toggleScanner,
            onBarcodeDetected: _onBarcodeDetected,
            scannerController: _scannerController,
          ),
          _CodePanel(
            method: 'otp',
            controller: _otpController,
            formKey: _otpFormKey,
            hintText: '6-digit OTP from your teacher',
            label: 'OTP Code',
            icon: Icons.pin_rounded,
            isSubmitting: _isSubmitting,
            successMessage: _successMessage,
            errorMessage: _errorMessage,
            isNumeric: true,
            maxLength: 6,
            onSubmit: () {
              if (_otpFormKey.currentState?.validate() ?? false) {
                _submit('otp', _otpController.text);
              }
            },
          ),
        ],
      ),
    );
  }
}

class _QrPanel extends StatelessWidget {
  final TextEditingController controller;
  final GlobalKey<FormState> formKey;
  final bool isSubmitting;
  final bool isScannerActive;
  final String? successMessage;
  final String? errorMessage;
  final VoidCallback onSubmit;
  final VoidCallback onToggleScanner;
  final Function(BarcodeCapture) onBarcodeDetected;
  final MobileScannerController? scannerController;

  const _QrPanel({
    required this.controller,
    required this.formKey,
    required this.isSubmitting,
    required this.isScannerActive,
    this.successMessage,
    this.errorMessage,
    required this.onSubmit,
    required this.onToggleScanner,
    required this.onBarcodeDetected,
    this.scannerController,
  });

  @override
  Widget build(BuildContext context) {
    if (isScannerActive && scannerController != null) {
      return Stack(
        children: [
          MobileScanner(
            controller: scannerController!,
            onDetect: onBarcodeDetected,
          ),
          Positioned(
            top: 16,
            left: 16,
            right: 16,
            child: Container(
              padding: const EdgeInsets.all(AppSpacing.md),
              decoration: BoxDecoration(
                color: Colors.black54,
                borderRadius: BorderRadius.circular(AppRadius.md),
              ),
              child: const Text(
                'Point your camera at the QR code',
                style: TextStyle(color: Colors.white, fontSize: 16),
                textAlign: TextAlign.center,
              ),
            ),
          ),
          Positioned(
            bottom: 32,
            left: 16,
            right: 16,
            child: ElevatedButton.icon(
              onPressed: onToggleScanner,
              icon: const Icon(Icons.close),
              label: const Text('Cancel Scanning'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.all(16),
              ),
            ),
          ),
        ],
      );
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSpacing.md),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const SizedBox(height: AppSpacing.md),

          Center(
            child: Container(
              width: 80,
              height: 80,
              decoration: AppDecorations.badge(AppColors.primary),
              child: const Icon(
                Icons.qr_code_2_rounded,
                color: AppColors.primary,
                size: AppIconSize.xxl,
              ),
            ),
          ),
          const SizedBox(height: AppSpacing.md),

          const Text(
            'Mark Attendance via QR',
            style: AppTextStyles.headline2,
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: AppSpacing.s3),
          const Text(
            'Scan the QR code displayed by your teacher',
            style: AppTextStyles.bodySmall,
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: AppSpacing.xl),

          SizedBox(
            height: 52,
            child: ElevatedButton.icon(
              onPressed: onToggleScanner,
              icon: const Icon(Icons.qr_code_scanner_rounded),
              label: const Text('Scan QR Code'),
            ),
          ),
          const SizedBox(height: AppSpacing.lg),

          Row(
            children: [
              const Expanded(child: Divider()),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
                child: Text('OR', style: AppTextStyles.bodySmall),
              ),
              const Expanded(child: Divider()),
            ],
          ),

          Form(
            key: formKey,
            child: TextFormField(
              controller: controller,
              keyboardType: TextInputType.text,
              textAlign: TextAlign.center,
              style: AppTextStyles.bodyLarge.copyWith(fontFamily: 'monospace'),
              decoration: AppInputDecoration.standard(
                label: 'QR Code',
                hint: 'Paste scanned code here…',
              ),
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'Please enter the QR code value';
                }
                return null;
              },
            ),
          ),
          const SizedBox(height: AppSpacing.lg),

          if (successMessage != null) _FeedbackBanner.success(successMessage!),
          if (errorMessage != null) _FeedbackBanner.error(errorMessage!),
          if (successMessage != null || errorMessage != null)
            const SizedBox(height: AppSpacing.md),

          SizedBox(
            height: 52,
            child: ElevatedButton.icon(
              onPressed: isSubmitting
                  ? null
                  : () {
                      if (formKey.currentState?.validate() ?? false) {
                        onSubmit();
                      }
                    },
              icon: isSubmitting
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(strokeWidth: 2.5),
                    )
                  : const Icon(Icons.check_circle_outline_rounded),
              label: Text(
                isSubmitting ? 'Marking attendance…' : 'Mark Attendance',
                style: AppTextStyles.button,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _CodePanel extends StatelessWidget {
  final String method;
  final TextEditingController controller;
  final GlobalKey<FormState> formKey;
  final String hintText;
  final String label;
  final IconData icon;
  final bool isSubmitting;
  final String? successMessage;
  final String? errorMessage;
  final bool isNumeric;
  final int? maxLength;
  final VoidCallback onSubmit;

  const _CodePanel({
    required this.method,
    required this.controller,
    required this.formKey,
    required this.hintText,
    required this.label,
    required this.icon,
    required this.isSubmitting,
    this.successMessage,
    this.errorMessage,
    this.isNumeric = false,
    this.maxLength,
    required this.onSubmit,
  });

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSpacing.md),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const SizedBox(height: AppSpacing.md),

          Center(
            child: Container(
              width: 80,
              height: 80,
              decoration: AppDecorations.badge(AppColors.primary),
              child: Icon(
                icon,
                color: AppColors.primary,
                size: AppIconSize.xxl,
              ),
            ),
          ),
          const SizedBox(height: AppSpacing.md),

          Text(
            'Enter $label',
            style: AppTextStyles.headline2,
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: AppSpacing.s3),
          Text(
            hintText,
            style: AppTextStyles.bodySmall,
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: AppSpacing.xl),

          Form(
            key: formKey,
            child: TextFormField(
              controller: controller,
              keyboardType: isNumeric
                  ? TextInputType.number
                  : TextInputType.text,
              inputFormatters: [
                if (isNumeric) FilteringTextInputFormatter.digitsOnly,
                if (maxLength != null)
                  LengthLimitingTextInputFormatter(maxLength),
              ],
              textAlign: TextAlign.center,
              style: isNumeric
                  ? AppTextStyles.mono
                  : AppTextStyles.bodyLarge.copyWith(fontFamily: 'monospace'),
              decoration: AppInputDecoration.standard(
                label: label,
                hint: isNumeric ? '000000' : 'Enter code…',
              ),
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'Please enter the $label';
                }
                if (isNumeric && value.length != (maxLength ?? 6)) {
                  return 'OTP must be exactly ${maxLength ?? 6} digits';
                }
                return null;
              },
              onFieldSubmitted: (_) => onSubmit(),
            ),
          ),
          const SizedBox(height: AppSpacing.lg),

          if (successMessage != null) _FeedbackBanner.success(successMessage!),
          if (errorMessage != null) _FeedbackBanner.error(errorMessage!),
          if (successMessage != null || errorMessage != null)
            const SizedBox(height: AppSpacing.md),

          SizedBox(
            height: 52,
            child: ElevatedButton.icon(
              onPressed: isSubmitting ? null : onSubmit,
              icon: isSubmitting
                  ? SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(
                        color: Theme.of(context).colorScheme.onPrimary,
                        strokeWidth: 2.5,
                      ),
                    )
                  : const Icon(Icons.check_circle_outline_rounded),
              label: Text(
                isSubmitting ? 'Marking attendance…' : 'Mark Attendance',
                style: AppTextStyles.button,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _FeedbackBanner extends StatelessWidget {
  final String message;
  final bool isSuccess;

  const _FeedbackBanner({required this.message, required this.isSuccess});

  factory _FeedbackBanner.success(String message) =>
      _FeedbackBanner(message: message, isSuccess: true);
  factory _FeedbackBanner.error(String message) =>
      _FeedbackBanner(message: message, isSuccess: false);

  @override
  Widget build(BuildContext context) {
    final color = isSuccess ? AppColors.success : AppColors.error;
    final bgColor = isSuccess ? AppColors.successBg : AppColors.errorBg;
    final border = isSuccess ? AppColors.successBorder : AppColors.errorBorder;
    final icon = isSuccess ? Icons.check_circle_rounded : Icons.error_rounded;

    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(color: border),
      ),
      child: Row(
        children: [
          Icon(icon, color: color, size: AppIconSize.lg),
          const SizedBox(width: AppSpacing.s3),
          Expanded(
            child: Text(
              message,
              style: AppTextStyles.body.copyWith(color: color),
            ),
          ),
        ],
      ),
    );
  }
}
