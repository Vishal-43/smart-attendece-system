import 'package:flutter/material.dart';

import '../../../constants.dart';
import 'custom_button.dart';
import 'custom_input_field.dart';
import 'fade_slide_transition.dart';

import '../../../services/auth_service.dart';

class LoginForm extends StatefulWidget {
  final Animation<double> animation;

  const LoginForm({super.key, required this.animation});

  @override
  State<LoginForm> createState() => _LoginFormState();
}

class _LoginFormState extends State<LoginForm> {
  final TextEditingController _identifierController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  bool _isEmail = true;
  bool _loading = false;
  String? _error;

  Future<void> _handleLogin() async {
    if (_identifierController.text.trim().isEmpty) {
      setState(() => _error = 'Please enter your email or username');
      return;
    }
    if (_passwordController.text.isEmpty) {
      setState(() => _error = 'Please enter your password');
      return;
    }

    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final authService = AuthService();
      final result = await authService.login(
        _isEmail ? _identifierController.text.trim() : '',
        _passwordController.text,
        !_isEmail ? _identifierController.text.trim() : '',
      );
      setState(() => _loading = false);
      if (result != null) {
        if (mounted) {
          Navigator.of(context).pushReplacementNamed('/home');
        }
      } else {
        setState(() => _error = 'Login failed. Please check your credentials.');
      }
    } catch (e) {
      setState(() {
        _loading = false;
        _error = e.toString().replaceFirst('Exception: ', '');
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
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
            child: Row(
              children: [
                ChoiceChip(
                  label: const Text('Email'),
                  selected: _isEmail,
                  onSelected: (selected) {
                    setState(() {
                      _isEmail = true;
                      _identifierController.clear();
                    });
                  },
                ),
                const SizedBox(width: 8),
                ChoiceChip(
                  label: const Text('Username'),
                  selected: !_isEmail,
                  onSelected: (selected) {
                    setState(() {
                      _isEmail = false;
                      _identifierController.clear();
                    });
                  },
                ),
              ],
            ),
          ),
          SizedBox(height: space),
          FadeSlideTransition(
            animation: widget.animation,
            additionalOffset: 0.0,
            child: CustomInputField(
              label: _isEmail ? 'Email' : 'Username',
              prefixIcon: _isEmail ? Icons.email : Icons.person,
              obscureText: false,
              controller: _identifierController,
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
              child: Text(_error!, style: TextStyle(color: colors.error)),
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
