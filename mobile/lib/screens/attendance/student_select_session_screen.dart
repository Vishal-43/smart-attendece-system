import 'dart:async';
import 'package:flutter/material.dart';
import '../../services/timetable_service.dart';
import '../../widgets/modern/modern_card.dart';
import 'student_mark_attendance_screen.dart';

class StudentSelectSessionScreen extends StatefulWidget {
  const StudentSelectSessionScreen({super.key});

  @override
  State<StudentSelectSessionScreen> createState() =>
      _StudentSelectSessionScreenState();
}

class _StudentSelectSessionScreenState
    extends State<StudentSelectSessionScreen> {
  final _service = TimetableService();
  List<dynamic> _timetables = [];
  bool _loading = true;
  String? _error;
  Timer? _refreshTimer;

  @override
  void initState() {
    super.initState();
    _fetchTimetables();
    _startAutoRefresh();
  }

  void _startAutoRefresh() {
    _refreshTimer?.cancel();
    _refreshTimer = Timer.periodic(const Duration(seconds: 30), (_) {
      if (mounted) {
        _fetchTimetables(showLoading: false);
      }
    });
  }

  @override
  void dispose() {
    _refreshTimer?.cancel();
    super.dispose();
  }

  Future<void> _fetchTimetables({bool showLoading = true}) async {
    if (showLoading) {
      setState(() {
        _loading = true;
        _error = null;
      });
    }

    try {
      final response = await _service.getTodayTimetable();
      final data = response.data;
      final listData = data is List ? List.from(data) : [];
      if (mounted) {
        setState(() {
          _timetables = listData;
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = 'Failed to load sessions. Please try again.';
          _loading = false;
        });
      }
    }
  }

  String _formatTime(String? isoString) {
    if (isoString == null) return '--:--';
    try {
      final time = isoString.split('T').last.split('.').first;
      return time.substring(0, 5);
    } catch (_) {
      return isoString;
    }
  }

  String _getDayName(int? dayValue) {
    const days = [
      '',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ];
    if (dayValue == null || dayValue < 1 || dayValue > 7) return '';
    return days[dayValue];
  }

  void _selectSession(int timetableId) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => StudentMarkAttendanceScreen(timetableId: timetableId),
      ),
    );
  }

  Widget _buildSessionCard(Map<String, dynamic> tt) {
    final theme = Theme.of(context);
    final colors = theme.colorScheme;
    final subject = tt['subject_name'] ?? tt['subject'] ?? 'Unknown';
    final startTime = _formatTime(tt['start_time']);
    final endTime = _formatTime(tt['end_time']);
    final lectureType = tt['lecture_type'] ?? '';
    final hasActiveQr = tt['has_active_qr'] == true;
    final hasActiveOtp = tt['has_active_otp'] == true;
    final hasActiveSession = hasActiveQr || hasActiveOtp;

    return TweenAnimationBuilder<double>(
      duration: const Duration(milliseconds: 400),
      tween: Tween(begin: 0.0, end: 1.0),
      builder: (context, value, child) {
        return Transform.translate(
          offset: Offset(0, 20 * (1 - value)),
          child: Opacity(opacity: value, child: child),
        );
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        child: ModernCard(
          padding: EdgeInsets.zero,
          onTap: () => _selectSession(tt['id']),
          child: IntrinsicHeight(
            child: Row(
              children: [
                Container(
                  width: 5,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: hasActiveSession
                          ? [colors.primary, colors.secondary]
                          : [
                              colors.outline,
                              colors.outline.withValues(alpha: 0.5),
                            ],
                    ),
                    borderRadius: const BorderRadius.only(
                      topLeft: Radius.circular(16),
                      bottomLeft: Radius.circular(16),
                    ),
                  ),
                ),
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: hasActiveSession
                                ? colors.primaryContainer
                                : colors.surfaceContainerHighest,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Icon(
                            hasActiveSession ? Icons.flash_on : Icons.school,
                            color: hasActiveSession
                                ? colors.primary
                                : colors.outline,
                            size: 24,
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                subject,
                                style: theme.textTheme.titleMedium?.copyWith(
                                  fontWeight: FontWeight.w600,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                              const SizedBox(height: 4),
                              Row(
                                children: [
                                  Icon(
                                    Icons.access_time_rounded,
                                    size: 14,
                                    color: colors.outline,
                                  ),
                                  const SizedBox(width: 4),
                                  Text(
                                    '$startTime - $endTime',
                                    style: TextStyle(
                                      color: colors.outline,
                                      fontSize: 13,
                                    ),
                                  ),
                                  if (lectureType.isNotEmpty) ...[
                                    const SizedBox(width: 12),
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 8,
                                        vertical: 2,
                                      ),
                                      decoration: BoxDecoration(
                                        color: colors.secondaryContainer,
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      child: Text(
                                        lectureType.toUpperCase(),
                                        style: TextStyle(
                                          color: colors.secondary,
                                          fontSize: 10,
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                    ),
                                  ],
                                ],
                              ),
                              if (hasActiveSession) ...[
                                const SizedBox(height: 8),
                                Row(
                                  children: [
                                    if (hasActiveQr) ...[
                                      Container(
                                        padding: const EdgeInsets.symmetric(
                                          horizontal: 8,
                                          vertical: 4,
                                        ),
                                        decoration: BoxDecoration(
                                          color: colors.primaryContainer,
                                          borderRadius: BorderRadius.circular(
                                            8,
                                          ),
                                        ),
                                        child: Row(
                                          mainAxisSize: MainAxisSize.min,
                                          children: [
                                            Icon(
                                              Icons.qr_code,
                                              size: 14,
                                              color: colors.primary,
                                            ),
                                            const SizedBox(width: 4),
                                            Text(
                                              'QR Active',
                                              style: TextStyle(
                                                color: colors.primary,
                                                fontSize: 11,
                                                fontWeight: FontWeight.w600,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ],
                                    if (hasActiveQr && hasActiveOtp)
                                      const SizedBox(width: 8),
                                    if (hasActiveOtp) ...[
                                      Container(
                                        padding: const EdgeInsets.symmetric(
                                          horizontal: 8,
                                          vertical: 4,
                                        ),
                                        decoration: BoxDecoration(
                                          color: colors.secondaryContainer,
                                          borderRadius: BorderRadius.circular(
                                            8,
                                          ),
                                        ),
                                        child: Row(
                                          mainAxisSize: MainAxisSize.min,
                                          children: [
                                            Icon(
                                              Icons.password,
                                              size: 14,
                                              color: colors.secondary,
                                            ),
                                            const SizedBox(width: 4),
                                            Text(
                                              'OTP Active',
                                              style: TextStyle(
                                                color: colors.secondary,
                                                fontSize: 11,
                                                fontWeight: FontWeight.w600,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ],
                                  ],
                                ),
                              ],
                            ],
                          ),
                        ),
                        const SizedBox(width: 8),
                        Icon(
                          Icons.arrow_forward_ios_rounded,
                          size: 18,
                          color: colors.outline,
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Select Class'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _fetchTimetables,
            tooltip: 'Refresh sessions',
          ),
        ],
      ),
      body: Column(
        children: [
          Container(
            margin: const EdgeInsets.all(16),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: colors.primaryContainer.withValues(alpha: 0.3),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              children: [
                Icon(Icons.info_outline, color: colors.primary, size: 20),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    'Sessions with QR/OTP icons are active and ready for attendance',
                    style: TextStyle(
                      color: colors.onSurfaceVariant,
                      fontSize: 12,
                    ),
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: _loading && _timetables.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        CircularProgressIndicator(color: colors.primary),
                        const SizedBox(height: 16),
                        Text(
                          'Loading sessions...',
                          style: TextStyle(color: colors.outline),
                        ),
                      ],
                    ),
                  )
                : _error != null && _timetables.isEmpty
                ? Center(
                    child: Padding(
                      padding: const EdgeInsets.all(24),
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
                              Icons.error_outline,
                              size: 48,
                              color: colors.error,
                            ),
                          ),
                          const SizedBox(height: 20),
                          Text(
                            'Failed to load sessions',
                            style: Theme.of(context).textTheme.titleMedium
                                ?.copyWith(fontWeight: FontWeight.w600),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            _error!,
                            textAlign: TextAlign.center,
                            style: TextStyle(color: colors.outline),
                          ),
                          const SizedBox(height: 24),
                          FilledButton.icon(
                            onPressed: _fetchTimetables,
                            icon: const Icon(Icons.refresh),
                            label: const Text('Retry'),
                          ),
                        ],
                      ),
                    ),
                  )
                : _timetables.isEmpty
                ? Center(
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(24),
                            decoration: BoxDecoration(
                              color: colors.primaryContainer,
                              shape: BoxShape.circle,
                            ),
                            child: Icon(
                              Icons.event_busy,
                              size: 48,
                              color: colors.primary,
                            ),
                          ),
                          const SizedBox(height: 20),
                          Text(
                            'No sessions available',
                            style: Theme.of(context).textTheme.titleMedium
                                ?.copyWith(fontWeight: FontWeight.w600),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Sessions will appear here when teachers start QR/OTP attendance',
                            textAlign: TextAlign.center,
                            style: TextStyle(color: colors.outline),
                          ),
                        ],
                      ),
                    ),
                  )
                : RefreshIndicator(
                    onRefresh: _fetchTimetables,
                    child: ListView.builder(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      itemCount: _timetables.length,
                      itemBuilder: (context, index) {
                        return _buildSessionCard(
                          _timetables[index] as Map<String, dynamic>,
                        );
                      },
                    ),
                  ),
          ),
        ],
      ),
    );
  }
}
