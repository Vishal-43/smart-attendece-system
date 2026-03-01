// app_spacing.dart
// Consistent spacing / sizing tokens mirroring the web CSS variable scale.

/// Spacing scale in logical pixels (matches CSS --space-N).
class AppSpacing {
  AppSpacing._();

  static const double s1  =  4.0;
  static const double s2  =  8.0;
  static const double s3  = 12.0;
  static const double s4  = 16.0;
  static const double s5  = 20.0;
  static const double s6  = 24.0;
  static const double s8  = 32.0;
  static const double s10 = 40.0;
  static const double s12 = 48.0;
  static const double s16 = 64.0;

  // Legacy aliases kept for existing code
  static const double xs  = s2;
  static const double sm  = s3;
  static const double md  = s4;
  static const double lg  = s6;
  static const double xl  = s8;
  static const double xxl = s12;
}

/// Border radius tokens
class AppRadius {
  AppRadius._();

  static const double xs    =  4.0;
  static const double sm    =  6.0;
  static const double md    =  8.0;
  static const double lg    = 12.0;
  static const double xl    = 16.0;
  static const double xxl   = 24.0;
  static const double full  = 9999.0;
}

/// Icon / avatar sizes
class AppIconSize {
  AppIconSize._();

  static const double xs  = 12.0;
  static const double sm  = 16.0;
  static const double md  = 20.0;
  static const double lg  = 24.0;
  static const double xl  = 32.0;
  static const double xxl = 48.0;
}

/// Animation durations
class AppDuration {
  AppDuration._();

  static const Duration fast   = Duration(milliseconds: 150);
  static const Duration base   = Duration(milliseconds: 200);
  static const Duration slow   = Duration(milliseconds: 300);
  static const Duration button = Duration(milliseconds: 600);
  static const Duration card   = Duration(milliseconds: 400);
  static const Duration login  = Duration(milliseconds: 1500);
}
