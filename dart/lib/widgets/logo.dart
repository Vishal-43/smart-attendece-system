

import 'package:flutter/material.dart';

class Logo extends StatelessWidget {
  final Color color;
  final double size;

  const Logo({required this.color, required this.size});

  @override
  Widget build(BuildContext context) {
    return Icon(Icons.person, color: color, size: size);
  }
}
