import 'package:flutter/material.dart';

import 'screens/login/login.dart';

class App extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Login',
      home: Builder(
        builder: (BuildContext context) {
          final screenHeight = MediaQuery.of(context).size.height;
          return Login(screenHeight: screenHeight);
        },
      ),
    );
  }
}

void main() => runApp(App());