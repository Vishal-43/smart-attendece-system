import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../../services/qr_otp/qr_otp_service.dart';
import '../../utils/error_handler.dart';
import '../../widgets/modern/modern_card.dart';

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

  String? _qrCode;
  String? _qrImageBase64;
  DateTime? _qrExpiresAt;

  String? _otpCode;
  DateTime? _otpExpiresAt;

  Timer? _countdownTimer;
  Timer? _autoRefreshTimer;
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
    _autoRefreshTimer?.cancel();
    super.dispose();
  }

  void _onTabChanged() {
    if (!_tabController.indexIsChanging) return;

    _countdownTimer?.cancel();
    _autoRefreshTimer?.cancel();

    setState(() {
      _timeRemaining = 0;
      _errorMessage = null;
    });

    if (_selectedTimetableId != null) {
      if (_tabController.index == 0) {
        _fetchCurrentQR();
      } else {
        _fetchCurrentOTP();
      }
    }
  }

  Future<void> _fetchTimetables() async {
    setState(() => _loading = true);
    try {
      final response = await _service.getTimetables();
      final data = response.data;
      setState(() {
        _timetables = (data is List) ? List.from(data) : [];
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = ErrorHandler.formatError(e);
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
      final data = response.data;

      final newExpiresAt = DateTime.parse(data['expires_at']);
      setState(() {
        _qrCode = data['code'];
        _qrImageBase64 = data['qr_image_base64'];
        _qrExpiresAt = newExpiresAt;
        _loading = false;
      });

      _startCountdown(newExpiresAt);
      if (mounted) {
        _showSnackBar('QR Code generated successfully!', isSuccess: true);
      }
    } catch (e) {
      setState(() {
        _errorMessage = ErrorHandler.formatError(e);
        _loading = false;
      });
    }
  }

  Future<void> _refreshQR() async {
    if (_selectedTimetableId == null) return;

    setState(() => _loading = true);

    try {
      final response = await _service.refreshQrCode(_selectedTimetableId!);
      final data = response.data;

      final newExpiresAt = DateTime.parse(data['expires_at']);
      setState(() {
        _qrCode = data['code'];
        _qrImageBase64 = data['qr_image_base64'];
        _qrExpiresAt = newExpiresAt;
        _loading = false;
      });

      _startCountdown(newExpiresAt);
      if (mounted) {
        _showSnackBar('QR Code refreshed!', isSuccess: true);
      }
    } catch (e) {
      setState(() {
        _errorMessage = ErrorHandler.formatError(e);
        _loading = false;
      });
    }
  }

  Future<void> _fetchCurrentQR() async {
    if (_selectedTimetableId == null) return;

    try {
      final response = await _service.getCurrentQr(
        _selectedTimetableId!,
        withImage: true,
      );
      final data = response.data;

      final newExpiresAt = DateTime.parse(data['expires_at']);
      setState(() {
        _qrCode = data['code'];
        _qrImageBase64 = data['qr_image_base64'];
        _qrExpiresAt = newExpiresAt;
      });

      _startCountdown(newExpiresAt);
    } catch (e) {
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
      final data = response.data;

      final newExpiresAt = DateTime.parse(data['expires_at']);
      setState(() {
        _otpCode = data['code'];
        _otpExpiresAt = newExpiresAt;
        _loading = false;
      });

      _startCountdown(newExpiresAt);
      if (mounted) {
        _showSnackBar('OTP generated successfully!', isSuccess: true);
      }
    } catch (e) {
      setState(() {
        _errorMessage = ErrorHandler.formatError(e);
        _loading = false;
      });
    }
  }

  Future<void> _refreshOTP() async {
    if (_selectedTimetableId == null) return;

    setState(() => _loading = true);

    try {
      final response = await _service.refreshOtp(_selectedTimetableId!);
      final data = response.data;

      final newExpiresAt = DateTime.parse(data['expires_at']);
      setState(() {
        _otpCode = data['code'];
        _otpExpiresAt = newExpiresAt;
        _loading = false;
      });

      _startCountdown(newExpiresAt);
      if (mounted) {
        _showSnackBar('OTP refreshed!', isSuccess: true);
      }
    } catch (e) {
      setState(() {
        _errorMessage = ErrorHandler.formatError(e);
        _loading = false;
      });
    }
  }

  Future<void> _endQrSession() async {
    if (_selectedTimetableId == null) return;

    final confirmed = await _showConfirmDialog(
      'End QR Session',
      'Are you sure you want to end this QR session? Students will no longer be able to mark attendance.',
    );

    if (confirmed != true) return;

    setState(() => _loading = true);

    try {
      await _service.endQrSession(_selectedTimetableId!);
      setState(() {
        _qrCode = null;
        _qrImageBase64 = null;
        _qrExpiresAt = null;
        _timeRemaining = 0;
        _loading = false;
      });
      if (mounted) {
        _showSnackBar('QR session ended');
      }
    } catch (e) {
      setState(() {
        _errorMessage = ErrorHandler.formatError(e);
        _loading = false;
      });
    }
  }

  Future<void> _endOtpSession() async {
    if (_selectedTimetableId == null) return;

    final confirmed = await _showConfirmDialog(
      'End OTP Session',
      'Are you sure you want to end this OTP session? Students will no longer be able to mark attendance.',
    );

    if (confirmed != true) return;

    setState(() => _loading = true);

    try {
      await _service.endOtpSession(_selectedTimetableId!);
      setState(() {
        _otpCode = null;
        _otpExpiresAt = null;
        _timeRemaining = 0;
        _loading = false;
      });
      if (mounted) {
        _showSnackBar('OTP session ended');
      }
    } catch (e) {
      setState(() {
        _errorMessage = ErrorHandler.formatError(e);
        _loading = false;
      });
    }
  }

  Future<void> _fetchCurrentOTP() async {
    if (_selectedTimetableId == null) return;

    try {
      final response = await _service.getCurrentOtp(_selectedTimetableId!);
      final data = response.data;

      final newExpiresAt = DateTime.parse(data['expires_at']);
      setState(() {
        _otpCode = data['code'];
        _otpExpiresAt = newExpiresAt;
      });

      _startCountdown(newExpiresAt);
    } catch (e) {
      setState(() {
        _otpCode = null;
        _otpExpiresAt = null;
      });
    }
  }

  void _startCountdown([DateTime? expiresAt]) {
    _countdownTimer?.cancel();
    _autoRefreshTimer?.cancel();

    if (expiresAt == null) {
      final isQRTab = _tabController.index == 0;
      expiresAt = isQRTab ? _qrExpiresAt : _otpExpiresAt;
    }

    if (expiresAt == null) return;

    final isQRTab = _tabController.index == 0;

    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      final remaining = expiresAt!.difference(DateTime.now()).inSeconds;

      if (remaining <= 0) {
        timer.cancel();
        _autoRefreshTimer?.cancel();
        setState(() => _timeRemaining = 0);
        _onSessionExpired();
      } else {
        setState(() => _timeRemaining = remaining);
      }
    });

    _autoRefreshTimer = Timer.periodic(const Duration(seconds: 25), (timer) {
      if (isQRTab && _qrCode != null) {
        _refreshQR();
      } else if (!isQRTab && _otpCode != null) {
        _refreshOTP();
      }
    });
  }

  void _onSessionExpired() {
    setState(() {
      _qrCode = null;
      _qrImageBase64 = null;
      _qrExpiresAt = null;
      _otpCode = null;
      _otpExpiresAt = null;
    });
    _autoRefreshTimer?.cancel();
  }

  void _onTimetableSelected(int? timetableId) {
    _countdownTimer?.cancel();
    _autoRefreshTimer?.cancel();

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

  Future<bool?> _showConfirmDialog(String title, String content) async {
    return showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text(title),
        content: Text(content),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            style: FilledButton.styleFrom(
              backgroundColor: Theme.of(context).colorScheme.error,
            ),
            child: const Text('End Session'),
          ),
        ],
      ),
    );
  }

  void _showSnackBar(String message, {bool isSuccess = false}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Icon(
              isSuccess ? Icons.check_circle : Icons.info,
              color: Colors.white,
            ),
            const SizedBox(width: 12),
            Text(message),
          ],
        ),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 120,
            floating: true,
            pinned: true,
            flexibleSpace: FlexibleSpaceBar(
              title: Text(
                'QR & OTP Management',
                style: TextStyle(
                  color: colors.onSurface,
                  fontWeight: FontWeight.bold,
                ),
              ),
              background: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      colors.primary,
                      colors.primary.withValues(alpha: 0.7),
                    ],
                  ),
                ),
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  ModernCard(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Select Timetable',
                          style: Theme.of(context).textTheme.titleSmall
                              ?.copyWith(fontWeight: FontWeight.w600),
                        ),
                        const SizedBox(height: 12),
                        if (_loading && _timetables.isEmpty)
                          const Center(child: CircularProgressIndicator())
                        else
                          DropdownButtonFormField<int>(
                            value: _selectedTimetableId,
                            decoration: InputDecoration(
                              hintText: 'Choose a class',
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                              contentPadding: const EdgeInsets.symmetric(
                                horizontal: 16,
                                vertical: 12,
                              ),
                            ),
                            items: _timetables.map<DropdownMenuItem<int>>((tt) {
                              final subject =
                                  tt['subject_name'] ??
                                  tt['subject'] ??
                                  'Unknown';
                              final day = tt['day_of_week'] ?? '';
                              final time =
                                  tt['start_time']?.toString().substring(
                                    0,
                                    5,
                                  ) ??
                                  '';
                              return DropdownMenuItem<int>(
                                value: tt['id'] as int?,
                                child: Text('$subject - $day $time'),
                              );
                            }).toList(),
                            onChanged: _onTimetableSelected,
                          ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          if (_errorMessage != null)
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: ModernCard(
                  child: Row(
                    children: [
                      Icon(Icons.error_outline, color: colors.error),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          _errorMessage!,
                          style: TextStyle(color: colors.error),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          SliverFillRemaining(
            child: _loading && _selectedTimetableId == null
                ? const Center(child: CircularProgressIndicator())
                : _selectedTimetableId == null
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.schedule, size: 64, color: colors.outline),
                        const SizedBox(height: 16),
                        Text(
                          'Select a timetable to continue',
                          style: TextStyle(color: colors.outline),
                        ),
                      ],
                    ),
                  )
                : _buildTabContent(),
          ),
        ],
      ),
    );
  }

  Widget _buildTabContent() {
    final colors = Theme.of(context).colorScheme;

    return Column(
      children: [
        Container(
          margin: const EdgeInsets.symmetric(horizontal: 20),
          decoration: BoxDecoration(
            color: colors.surfaceContainerHighest,
            borderRadius: BorderRadius.circular(16),
          ),
          child: Row(
            children: [
              Expanded(child: _buildTabButton(0, Icons.qr_code, 'QR Code')),
              Expanded(child: _buildTabButton(1, Icons.password, 'OTP')),
            ],
          ),
        ),
        Expanded(
          child: TabBarView(
            controller: _tabController,
            physics: const NeverScrollableScrollPhysics(),
            children: [_buildQRTab(), _buildOTPTab()],
          ),
        ),
      ],
    );
  }

  Widget _buildTabButton(int index, IconData icon, String label) {
    final colors = Theme.of(context).colorScheme;
    final isSelected = _tabController.index == index;

    return GestureDetector(
      onTap: () => _tabController.animateTo(index),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: isSelected ? colors.primary : Colors.transparent,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              size: 20,
              color: isSelected ? Colors.white : colors.outline,
            ),
            const SizedBox(width: 8),
            Text(
              label,
              style: TextStyle(
                color: isSelected ? Colors.white : colors.outline,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQRTab() {
    final colors = Theme.of(context).colorScheme;

    if (_qrCode == null) {
      return _buildEmptyState(
        icon: Icons.qr_code_2,
        title: 'No active QR code',
        subtitle: 'Generate a QR code to start attendance',
        button: ElevatedButton.icon(
          onPressed: _loading ? null : _generateQR,
          icon: const Icon(Icons.add),
          label: const Text('Generate QR Code'),
          style: ElevatedButton.styleFrom(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
            ),
          ),
        ),
      );
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          ModernCard(
            padding: const EdgeInsets.all(24),
            child: Column(
              children: [
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: colors.shadow.withValues(alpha: 0.1),
                        blurRadius: 20,
                      ),
                    ],
                  ),
                  child: _qrImageBase64 != null
                      ? Image.memory(
                          base64Decode(_qrImageBase64!),
                          width: 220,
                          height: 220,
                        )
                      : QrImageView(
                          data: _qrCode!,
                          version: QrVersions.auto,
                          size: 220,
                        ),
                ),
                const SizedBox(height: 24),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 24,
                    vertical: 12,
                  ),
                  decoration: BoxDecoration(
                    color: colors.primaryContainer,
                    borderRadius: BorderRadius.circular(30),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.timer, size: 20, color: colors.primary),
                      const SizedBox(width: 8),
                      Text(
                        'Expires in: ${_formatTime(_timeRemaining)}',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: colors.primary,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  'Code: $_qrCode',
                  style: TextStyle(
                    fontSize: 14,
                    color: colors.outline,
                    fontFamily: 'monospace',
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: _loading ? null : _refreshQR,
                  icon: const Icon(Icons.refresh),
                  label: const Text('Refresh'),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: _loading ? null : _endQrSession,
                  icon: const Icon(Icons.stop_circle_outlined),
                  label: const Text('End'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: colors.error,
                    side: BorderSide(color: colors.error),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildOTPTab() {
    final colors = Theme.of(context).colorScheme;

    if (_otpCode == null) {
      return _buildEmptyState(
        icon: Icons.password,
        title: 'No active OTP',
        subtitle: 'Generate an OTP to start attendance',
        button: ElevatedButton.icon(
          onPressed: _loading ? null : _generateOTP,
          icon: const Icon(Icons.add),
          label: const Text('Generate OTP'),
          style: ElevatedButton.styleFrom(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
            ),
          ),
        ),
      );
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          ModernCard(
            padding: const EdgeInsets.all(32),
            child: Column(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 32,
                    vertical: 20,
                  ),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [colors.primary, colors.secondary],
                    ),
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: colors.primary.withValues(alpha: 0.3),
                        blurRadius: 15,
                        offset: const Offset(0, 5),
                      ),
                    ],
                  ),
                  child: Text(
                    _otpCode!,
                    style: const TextStyle(
                      fontSize: 42,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 12,
                      color: Colors.white,
                      fontFamily: 'monospace',
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 24,
                    vertical: 12,
                  ),
                  decoration: BoxDecoration(
                    color: colors.secondaryContainer,
                    borderRadius: BorderRadius.circular(30),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.timer, size: 20, color: colors.secondary),
                      const SizedBox(width: 8),
                      Text(
                        'Expires in: ${_formatTime(_timeRemaining)}',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: colors.secondary,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: _loading ? null : _refreshOTP,
                  icon: const Icon(Icons.refresh),
                  label: const Text('Refresh'),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: _loading ? null : _endOtpSession,
                  icon: const Icon(Icons.stop_circle_outlined),
                  label: const Text('End'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: colors.error,
                    side: BorderSide(color: colors.error),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState({
    required IconData icon,
    required String title,
    required String subtitle,
    required Widget button,
  }) {
    final colors = Theme.of(context).colorScheme;

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(40),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: colors.primaryContainer.withValues(alpha: 0.5),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, size: 64, color: colors.primary),
            ),
            const SizedBox(height: 24),
            Text(
              title,
              style: Theme.of(
                context,
              ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(
              subtitle,
              style: TextStyle(color: colors.outline),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            button,
          ],
        ),
      ),
    );
  }
}
