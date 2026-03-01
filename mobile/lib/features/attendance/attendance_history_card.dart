// attendance_history_card.dart
// Card widget for a single attendance record in the history list.

import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import 'attendance_record.dart';

class AttendanceHistoryCard extends StatelessWidget {
  final AttendanceRecord record;

  const AttendanceHistoryCard({super.key, required this.record});

  @override
  Widget build(BuildContext context) {
    final (color, bgColor, label, icon) = _statusMeta(record.status);

    return Container(
      margin: const EdgeInsets.symmetric(vertical: AppSpacing.s2),
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: AppDecorations.card(),
      child: Row(
        children: [
          // Status indicator circle
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: bgColor,
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: color, size: AppIconSize.md),
          ),
          const SizedBox(width: AppSpacing.md),

          // Details
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Timetable ID + status badge
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        'Session #${record.timetableId}',
                        style: AppTextStyles.labelLarge,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    _StatusBadge(label: label, color: color, bgColor: bgColor),
                  ],
                ),
                const SizedBox(height: AppSpacing.s1),

                // Date & time
                if (record.markedAt != null)
                  Text(
                    _formatDateTime(record.markedAt!),
                    style: AppTextStyles.bodySmall,
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  /// Returns (foreground colour, background colour, label, icon)
  (Color, Color, String, IconData) _statusMeta(String status) {
    return switch (status) {
      'present' => (
        AppColors.success,
        AppColors.successBg,
        'Present',
        Icons.check_circle_outline_rounded,
      ),
      'late' => (
        AppColors.warning,
        AppColors.warningBg,
        'Late',
        Icons.access_time_rounded,
      ),
      _ => (                       // absent
        AppColors.error,
        AppColors.errorBg,
        'Absent',
        Icons.cancel_outlined,
      ),
    };
  }

  String _formatDateTime(DateTime dt) {
    final d = '${dt.day.toString().padLeft(2, '0')}/'
        '${dt.month.toString().padLeft(2, '0')}/'
        '${dt.year}';
    final t = '${dt.hour.toString().padLeft(2, '0')}:'
        '${dt.minute.toString().padLeft(2, '0')}';
    return '$d  $t';
  }
}

class _StatusBadge extends StatelessWidget {
  final String label;
  final Color color;
  final Color bgColor;

  const _StatusBadge({
    required this.label,
    required this.color,
    required this.bgColor,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.s3,
        vertical: AppSpacing.s1,
      ),
      decoration: AppDecorations.badge(color),
      child: Text(
        label,
        style: AppTextStyles.caption.copyWith(
          color: color,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}
