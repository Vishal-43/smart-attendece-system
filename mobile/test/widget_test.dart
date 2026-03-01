// Main app widget test
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:smart_attendance/main.dart';

void main() {
  group('Smart Attendance App Widget Tests', () {
    testWidgets('App initializes without crashing', (WidgetTester tester) async {
      // Build and pump the app once
      await tester.pumpWidget(const App());

      // Verify the app starts with a MaterialApp
      expect(find.byType(MaterialApp), findsOneWidget);
    });

    testWidgets('App has routes configured', (WidgetTester tester) async {
      await tester.pumpWidget(const App());

      final materialApp = tester.widget<MaterialApp>(find.byType(MaterialApp));
      expect(materialApp.routes, isNotNull);
      expect(materialApp.routes!.isNotEmpty, true);
    });

    testWidgets('App initial route is login screen', (WidgetTester tester) async {
      await tester.pumpWidget(const App());

      final materialApp = tester.widget<MaterialApp>(find.byType(MaterialApp));
      expect(materialApp.initialRoute, '/');
    });

    testWidgets('App uses correct theme', (WidgetTester tester) async {
      await tester.pumpWidget(const App());

      final materialApp = tester.widget<MaterialApp>(find.byType(MaterialApp));
      expect(materialApp.theme, isNotNull);
      expect(materialApp.theme!.useMaterial3, isTrue);
    });

    testWidgets('App navigation routes are properly named', (WidgetTester tester) async {
      await tester.pumpWidget(const App());

      final materialApp = tester.widget<MaterialApp>(find.byType(MaterialApp));
      
      // Verify key routes exist
      expect(materialApp.routes!.containsKey('/'), true);
      expect(materialApp.routes!.containsKey('/home'), true);
      expect(materialApp.routes!.containsKey('/attendance-history'), true);
    });

    testWidgets('App debugShowCheckedModeBanner is disabled', (WidgetTester tester) async {
      await tester.pumpWidget(const App());

      final materialApp = tester.widget<MaterialApp>(find.byType(MaterialApp));
      expect(materialApp.debugShowCheckedModeBanner, false);
    });

    testWidgets('App title is set correctly', (WidgetTester tester) async {
      await tester.pumpWidget(const App());

      final materialApp = tester.widget<MaterialApp>(find.byType(MaterialApp));
      expect(materialApp.title, 'Smart Attendance');
    });
  });
}

