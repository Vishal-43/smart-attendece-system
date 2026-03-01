// qr_otp_screen.dart
// Student-facing screen for entering a QR code or OTP to mark attendance.
// Accepts timetable_id as a navigation argument.
// Navigator.pushNamed(context, '/qr-otp', arguments: {'timetableId': 42})

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../core/theme/app_theme.dart';
import '../../core/network/network_result.dart';
import '../../features/attendance/attendance_repository.dart';

class QrOtpScreen extends StatefulWidget {
  const QrOtpScreen({super.key});

  @override
  State<QrOtpScreen> createState() => _QrOtpScreenState();
}

class _QrOtpScreenState extends State<QrOtpScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tabController;
  final _repo = const AttendanceRepository();

  // ── Form controllers ──────────────────────────────────────────────────────
  final _qrController  = TextEditingController();
  final _otpController = TextEditingController();
  final _qrFormKey  = GlobalKey<FormState>();
  final _otpFormKey = GlobalKey<FormState>();

  int? _timetableId;
  bool _isSubmitting = false;
  String? _successMessage;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _tabController.addListener(() {
      // Clear messages when switching tabs
      if (_tabController.indexIsChanging) {
        setState(() { _successMessage = null; _errorMessage = null; });
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
    super.dispose();
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  Future<void> _submit(String method, String code) async {
    if (_timetableId == null) {
      setState(() => _errorMessage = 'No session selected. Go back and try again.');
      return;
    }

    setState(() {
      _isSubmitting = true;
      _successMessage = null;
      _errorMessage   = null;
    });

    final result = await _repo.markAttendance(
      timetableId: _timetableId!,
      method: method,
      code: code.trim(),
    );

    if (!mounted) return;

    if (result is Success) {
      setState(() {
        _successMessage = 'Attendance marked successfully!';
        _isSubmitting   = false;
      });
      // Clear the input
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

  // ── Build ─────────────────────────────────────────────────────────────────

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
          _CodePanel(
            method: 'qr',
            controller: _qrController,
            formKey: _qrFormKey,
            hintText: 'Paste or scan the QR code value',
            label: 'QR Code',
            icon: Icons.qr_code_2_rounded,
            isSubmitting: _isSubmitting,
            successMessage: _successMessage,
            errorMessage: _errorMessage,
            onSubmit: () {
              if (_qrFormKey.currentState?.validate() ?? false) {
                _submit('qr', _qrController.text);
              }
            },
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

// ── Reusable panel ────────────────────────────────────────────────────────────

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
    required this.onSubmit,
    this.successMessage,
    this.errorMessage,
    this.isNumeric = false,
    this.maxLength,
  });

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSpacing.md),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const SizedBox(height: AppSpacing.md),

          // Icon hero
          Center(
            child: Container(
              width: 80,
              height: 80,
              decoration: AppDecorations.badge(AppColors.primary),
              child: Icon(icon, color: AppColors.primary, size: AppIconSize.xxl),
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

          // Input form
          Form(
            key: formKey,
            child: TextFormField(
              controller: controller,
              keyboardType: isNumeric ? TextInputType.number : TextInputType.text,
              inputFormatters: [
                if (isNumeric) FilteringTextInputFormatter.digitsOnly,
                if (maxLength != null) LengthLimitingTextInputFormatter(maxLength),
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

          // Feedback banners
          if (successMessage != null) _FeedbackBanner.success(successMessage!),
          if (errorMessage   != null) _FeedbackBanner.error(errorMessage!),
          if (successMessage != null || errorMessage != null)
            const SizedBox(height: AppSpacing.md),

          // Submit button
          SizedBox(
            height: 52,
            child: ElevatedButton.icon(
              onPressed: isSubmitting ? null : onSubmit,
              icon: isSubmitting
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(
                        color: Colors.white,
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
    final color    = isSuccess ? AppColors.success : AppColors.error;
    final bgColor  = isSuccess ? AppColors.successBg : AppColors.errorBg;
    final border   = isSuccess ? AppColors.successBorder : AppColors.errorBorder;
    final icon     = isSuccess ? Icons.check_circle_rounded : Icons.error_rounded;

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
