import 'package:flutter/material.dart';

import '../../../constants.dart';

class CustomInputField extends StatelessWidget {
  final String label;
  final IconData prefixIcon;
  final bool obscureText;
  final TextEditingController? controller;

  const CustomInputField({super.key, 
    required this.label,
    required this.prefixIcon,
    this.obscureText = false,
    this.controller,
  });

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      decoration: InputDecoration(
        contentPadding: const EdgeInsets.all(kPaddingM),
        focusedBorder: OutlineInputBorder(
          borderSide: BorderSide(color: Colors.black.withValues(alpha: 0.12)),
        ),
        enabledBorder: OutlineInputBorder(
          borderSide: BorderSide(color: Colors.black.withValues(alpha: 0.12)),
        ),
        hintText: label,
        hintStyle: TextStyle(
          color: kBlack.withValues(alpha: 0.5),
          fontWeight: FontWeight.w500,
        ),
        prefixIcon: Icon(
          prefixIcon,
          color: kBlack.withValues(alpha: 0.5),
        ),
      ),
      obscureText: obscureText,
    );
  }
}