// app_colors.dart
// Single source of truth for all app colours.
// Import this file (or the barrel app_theme.dart) rather than hardcoding hex values.

import 'package:flutter/material.dart';

/// Brand palette
class AppColors {
  AppColors._();

  // ── Primary ────────────────────────────────────────────────────────────────
  static const Color primary        = Color(0xFF4C2D8E); // deep-purple brand
  static const Color primaryLight   = Color(0xFF7B52C1);
  static const Color primaryDark    = Color(0xFF341F62);
  static const Color primarySubtle  = Color(0xFFEDE7F6);

  // ── Secondary ──────────────────────────────────────────────────────────────
  static const Color secondary      = Color(0xFF0EA5E9);
  static const Color secondaryLight = Color(0xFF38BDF8);
  static const Color secondaryDark  = Color(0xFF0369A1);

  // ── Neutral ────────────────────────────────────────────────────────────────
  static const Color background     = Color(0xFFF4F5F7);
  static const Color surface        = Color(0xFFFFFFFF);
  static const Color surfaceVar     = Color(0xFFF0F2F8);
  static const Color border         = Color(0xFFCFD8E3);
  static const Color borderStrong   = Color(0xFFB0BEC5);
  static const Color divider        = Color(0xFFE2E8F0);

  // ── Text ───────────────────────────────────────────────────────────────────
  static const Color textPrimary    = Color(0xFF2D3243);
  static const Color textSecondary  = Color(0xFF546E7A);
  static const Color textMuted      = Color(0xFF90A4AE);
  static const Color textInverse    = Color(0xFFFFFFFF);

  // ── Status ─────────────────────────────────────────────────────────────────
  static const Color success        = Color(0xFF10B981);
  static const Color successBg      = Color(0xFFD1FAE5);
  static const Color successBorder  = Color(0xFF6EE7B7);

  static const Color warning        = Color(0xFFF59E0B);
  static const Color warningBg      = Color(0xFFFEF3C7);
  static const Color warningBorder  = Color(0xFFFCD34D);

  static const Color error          = Color(0xFFEF4444);
  static const Color errorBg        = Color(0xFFFEE2E2);
  static const Color errorBorder    = Color(0xFFFCA5A5);

  static const Color info           = Color(0xFF3B82F6);
  static const Color infoBg         = Color(0xFFDBEAFE);
  static const Color infoBorder     = Color(0xFF93C5FD);

  // ── Dark surfaces (login, code panels) ─────────────────────────────────────
  static const Color darkCard       = Color(0xFF0B0F14);
  static const Color darkInput      = Color(0xFF070A0F);
  static const Color darkText       = Color(0xFFE6EDF3);
  static const Color darkTextMuted  = Color(0xFF9DA7B3);
  static const Color darkBorder     = Color(0x0FFFFFFF); // rgba(255,255,255,0.06)
}
