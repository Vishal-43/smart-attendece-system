import 'package:flutter/material.dart';

class Logo extends StatelessWidget {
  final Color? color;
  final double size;

  const Logo({super.key, this.color, required this.size});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: size,
      width: size,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
      ),
      padding: const EdgeInsets.all(4),
      child: Image.asset(
        'assets/images/logo.png',
        fit: BoxFit.contain,
        errorBuilder: (context, error, stackTrace) {
          return Icon(
            Icons.school,
            color: color ?? Theme.of(context).colorScheme.primary,
            size: size * 0.8,
          );
        },
      ),
    );
  }
}
