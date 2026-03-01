// Widget test for Student Select Session Screen
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:smart_attendance/screens/attendance/student_select_session_screen.dart';

void main() {
  group('StudentSelectSessionScreen Widget Tests', () {
    testWidgets('Screen renders with app bar', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: StudentSelectSessionScreen(),
        ),
      );

      // Verify app bar is present
      expect(find.text('Select Class Session'), findsOneWidget);
      expect(find.byType(AppBar), findsOneWidget);
    });

    testWidgets('Shows loading indicator initially', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: StudentSelectSessionScreen(),
        ),
      );

      // Should show loading initially
      expect(find.byType(CircularProgressIndicator), findsOneWidget);
    });

    testWidgets('Has Scaffold structure', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: StudentSelectSessionScreen(),
        ),
      );

      expect(find.byType(Scaffold), findsOneWidget);
    });
  });
}
