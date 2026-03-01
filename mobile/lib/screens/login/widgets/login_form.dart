import 'package:flutter/material.dart';

import '../../../constants.dart';
import 'custom_button.dart';
import 'custom_input_field.dart';
import 'fade_slide_transition.dart';

import '../../../services/auth_service.dart';

class LoginForm extends StatefulWidget {
  final Animation<double> animation;

  const LoginForm({super.key, 
    required this.animation,
  });

  @override
  State<LoginForm> createState() => _LoginFormState();
}

class _LoginFormState extends State<LoginForm> {
  final TextEditingController _usernameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  bool _loading = false;
  String? _error;

  Future<void> _handleLogin() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    final authService = AuthService();
    final success = await authService.login(
      _emailController.text.trim(),
      _passwordController.text,
      _usernameController.text.trim(),
    );
    setState(() => _loading = false);
    if (success) {
      // Navigate to home or dashboard
      if (mounted) {
        Navigator.of(context).pushReplacementNamed('/home');
      }
    } else {
      setState(() => _error = 'Login failed. Please check your credentials.');
    }
  }

  @override
  Widget build(BuildContext context) {
    final height =
        MediaQuery.of(context).size.height - MediaQuery.of(context).padding.top;
    final space = height > 650 ? kSpaceM : kSpaceS;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: kPaddingL),
      child: Column(
        children: <Widget>[
          FadeSlideTransition(
            animation: widget.animation,
            additionalOffset: 0.0,
            child: CustomInputField(
              label: 'Username',
              prefixIcon: Icons.person,
              obscureText: false,
              controller: _usernameController,
            ),
          ),
          SizedBox(height: space),
          FadeSlideTransition(
            animation: widget.animation,
            additionalOffset: 0.0,
            child: CustomInputField(
              label: 'Email',
              prefixIcon: Icons.email,
              obscureText: false,
              controller: _emailController,
            ),
          ),
          SizedBox(height: space),
          FadeSlideTransition(
            animation: widget.animation,
            additionalOffset: space,
            child: CustomInputField(
              label: 'Password',
              prefixIcon: Icons.lock,
              obscureText: true,
              controller: _passwordController,
            ),
          ),
          SizedBox(height: space),
          if (_error != null)
            Padding(
              padding: const EdgeInsets.only(bottom: 8.0),
              child: Text(_error!, style: TextStyle(color: Colors.red)),
            ),
          FadeSlideTransition(
            animation: widget.animation,
            additionalOffset: 2 * space,
            child: CustomButton(
              color: kBlue,
              textColor: kWhite,
              text: _loading ? 'Logging in...' : 'Login to continue',
              onPressed: () {
                if (!_loading) {
                  _handleLogin();
                }
              },
            ),
          ),
          SizedBox(height: 2 * space),
        ],
      ),
    );
  }
}