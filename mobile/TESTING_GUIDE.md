# Smart Attendance Mobile App - Testing Guide

## Overview

This document provides guidance on running and managing tests for the Smart Attendance mobile Flutter application. A comprehensive test suite has been created covering widgets, screens, and services.

## Test Structure

### Test Files Created

```
test/
├── widget_test.dart                      # Main app widget tests
├── screens/
│   ├── dashboard_screen_test.dart        # Dashboard screen tests
│   └── student_select_session_test.dart  # Student session selection tests
└── services/
    ├── location_service_test.dart        # Location service tests
    ├── qr_otp_service_test.dart          # QR OTP service tests
    └── wifi_service_test.dart            # Wifi service tests
```

## Running Tests

### Run All Tests
```bash
flutter test
```

### Run Specific Test File
```bash
flutter test test/widget_test.dart
flutter test test/screens/dashboard_screen_test.dart
flutter test test/services/location_service_test.dart
```

### Run Tests with Coverage
```bash
flutter test --coverage
```

### Run Tests with Timeout Protection
```bash
flutter test --timeout=30s
```

## Test Categories

### 1. Widget Tests (`widget_test.dart`)

Tests the main `App` widget configuration:
- ✓ App initializes without crashing
- ✓ App has routes configured
- ✓ App initial route is login screen
- ✓ App uses correct theme
- ✓ App navigation routes are properly named
- ✓ App debugShowCheckedModeBanner is disabled
- ✓ App title is set correctly

**Purpose:** Verify app-level widget setup, routing, and theme configuration.

### 2. Screen Tests

#### Dashboard Screen (`screens/dashboard_screen_test.dart`)
Tests the main dashboard UI:
- Screen renders properly
- App bar is present
- Loading indicator displays initially

#### Student Session Selection (`screens/student_select_session_test.dart`)
Tests the student session selection screen.

**Purpose:** Verify screen UI components and layout.

### 3. Service Tests

#### Location Service (`services/location_service_test.dart`)
Tests location acquisition functionality:
- Service instantiation
- Location retrieval
- Permission handling

#### QR OTP Service (`services/qr_otp_service_test.dart`)
Tests QR code and OTP functionality.

#### WiFi Service (`services/wifi_service_test.dart`)
Tests WiFi connectivity detection.

**Purpose:** Verify business logic of services (unit tests).

## Writing New Tests

### Widget Test Template
```dart
void main() {
  group('Feature Name Tests', () {
    testWidgets('Test description', (WidgetTester tester) async {
      // Setup
      await tester.pumpWidget(const MaterialApp(
        home: YourWidget(),
      ));

      // Act & Assert
      expect(find.byType(Widget), findsOneWidget);
    });
  });
}
```

### Service/Unit Test Template
```dart
void main() {
  group('ServiceName Tests', () {
    late ServiceName service;

    setUp(() {
      service = ServiceName();
    });

    test('Test description', () async {
      final result = await service.method();
      expect(result, expectedValue);
    });
  });
}
```

## Important Testing Notes

### Avoiding pumpAndSettle() Timeout Issues

The `pumpAndSettle()` method waits for all animations to complete. It can timeout when:
- Widgets have continuous animations
- Routes use `MediaQuery` which require full layout
- Heavy operations are running during build

**Solution:** Use `tester.pumpWidget()` alone for simple state checks without animations, or use `tester.pumpAndSettle(duration: Duration(seconds: 5))` with explicit timeout.

### Handling Async Services

For services that make network calls or access hardware:
```dart
test('async operation', () async {
  // No mocking required for this simple example
  final result = await service.operation();
  expect(result, isNotNull);
});
```

### Testing with Dependencies

For screens with complex dependencies:
```dart
testWidgets('with dependencies', (WidgetTester tester) async {
  // Wrap in MaterialApp to provide route context
  await tester.pumpWidget(const MaterialApp(
    home: ScreenWithDependencies(),
  ));

  // Test without trying to settle all animations
  expect(find.byType(SomeWidget), findsWidgets);
});
```

## Continuous Integration

Tests can be integrated into CI/CD pipelines:

```bash
# In GitHub Actions or similar
flutter test --coverage
flutter test --machine  # Machine-readable JSON output
```

## Troubleshooting

### Tests Hang or Timeout
- Remove `pumpAndSettle()` calls if not needed
- Check for continuous animations or rebuild loops
- Reduce test timeout expectations for slow CI systems

### Import Errors
- Run `flutter pub get` to fetch dependencies
- Verify correct package names in pubspec.yaml

### Widget Not Found
- Ensure parent widgets provide necessary context (MaterialApp, etc.)
- Use `find.byType()`, `find.byKey()`, or `find.text()` appropriately

## Best Practices

1. **Keep tests focused** - One test per feature/scenario
2. **Use meaningful names** - Describe what is being tested
3. **Arrange-Act-Assert pattern** - Setup, execute, verify
4. **Mock external dependencies** - Don't rely on real services
5. **Test behavior, not implementation** - Focus on user-visible outcomes

## Coverage Goals

- Unit tests: 80%+ coverage for services and utilities
- Widget tests: Critical UI paths and workflows
- Integration tests: Key user journeys (login, attendance marking)

## References

- [Flutter Testing Documentation](https://flutter.dev/docs/testing)
- [Dart Testing Guide](https://dart.dev/guides/testing)
- [Flutter Widget Testing](https://flutter.dev/docs/testing/unit-testing)
