// app_decorations.dart
// Reusable BoxDecoration / InputDecoration factories.

import 'package:flutter/material.dart';
import 'app_colors.dart';
import 'app_spacing.dart';

/// Pre-built [BoxDecoration] values.
class AppDecorations {
  AppDecorations._();

  /// Flat surface card (main content panels)
  static BoxDecoration card({
    Color? color,
    double radius = AppRadius.lg,
    bool hasBorder = true,
    List<BoxShadow>? shadow,
  }) {
    return BoxDecoration(
      color: color ?? AppColors.surface,
      borderRadius: BorderRadius.circular(radius),
      border: hasBorder
          ? Border.all(color: AppColors.border, width: 1)
          : null,
      boxShadow: shadow ?? [
        const BoxShadow(
          color: Color(0x0A000000),
          blurRadius: 8,
          offset: Offset(0, 2),
        ),
      ],
    );
  }

  /// Elevated card with larger shadow
  static BoxDecoration elevatedCard({
    Color? color,
    double radius = AppRadius.xl,
  }) {
    return BoxDecoration(
      color: color ?? AppColors.surface,
      borderRadius: BorderRadius.circular(radius),
      boxShadow: const [
        BoxShadow(
          color: Color(0x14000000),
          blurRadius: 16,
          offset: Offset(0, 4),
        ),
        BoxShadow(
          color: Color(0x0A000000),
          blurRadius: 4,
          offset: Offset(0, 1),
        ),
      ],
    );
  }

  /// Status badge container
  static BoxDecoration badge(Color color) {
    return BoxDecoration(
      color: color.withValues(alpha: 0.12),
      borderRadius: BorderRadius.circular(AppRadius.full),
    );
  }

  /// Linear gradient header / hero backgrounds
  static BoxDecoration primaryGradient({
    double radius = AppRadius.xl,
    AlignmentGeometry begin = Alignment.topLeft,
    AlignmentGeometry end = Alignment.bottomRight,
  }) {
    return BoxDecoration(
      gradient: LinearGradient(
        begin: begin,
        end: end,
        colors: const [AppColors.primaryDark, AppColors.primaryLight],
      ),
      borderRadius: BorderRadius.circular(radius),
    );
  }

  /// OTP / QR code display panel
  static BoxDecoration codePanel() {
    return const BoxDecoration(
      color: AppColors.darkCard,
      borderRadius: BorderRadius.all(Radius.circular(AppRadius.lg)),
    );
  }
}

/// Pre-built [InputDecoration] theme factory.
class AppInputDecoration {
  AppInputDecoration._();

  static InputDecoration standard({
    required String label,
    String? hint,
    Widget? prefixIcon,
    Widget? suffixIcon,
    bool hasError = false,
  }) {
    final borderColor = hasError ? AppColors.error : AppColors.border;
    final focusColor  = hasError ? AppColors.error : AppColors.primary;

    return InputDecoration(
      labelText: label,
      hintText: hint,
      prefixIcon: prefixIcon,
      suffixIcon: suffixIcon,
      labelStyle: const TextStyle(
        fontFamily: 'Inter',
        color: AppColors.textSecondary,
        fontSize: 14,
      ),
      hintStyle: const TextStyle(
        fontFamily: 'Inter',
        color: AppColors.textMuted,
        fontSize: 14,
      ),
      filled: true,
      fillColor: AppColors.surface,
      contentPadding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.md,
        vertical: AppSpacing.sm,
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(AppRadius.md),
        borderSide: BorderSide(color: borderColor),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(AppRadius.md),
        borderSide: BorderSide(color: focusColor, width: 2),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(AppRadius.md),
        borderSide: const BorderSide(color: AppColors.error),
      ),
      focusedErrorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(AppRadius.md),
        borderSide: const BorderSide(color: AppColors.error, width: 2),
      ),
    );
  }
}
