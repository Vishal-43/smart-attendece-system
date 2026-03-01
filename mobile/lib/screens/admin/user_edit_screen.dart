import 'package:flutter/material.dart';
import '../../services/admin/admin_service.dart';

class UserEditScreen extends StatefulWidget {
  final Map<String, dynamic>? user;
  const UserEditScreen({super.key, this.user});

  @override
  State<UserEditScreen> createState() => _UserEditScreenState();
}

class _UserEditScreenState extends State<UserEditScreen> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _emailController;
  late TextEditingController _usernameController;
  late TextEditingController _firstNameController;
  late TextEditingController _lastNameController;
  late TextEditingController _phoneController;
  late TextEditingController _passwordController;
  String _role = 'student';
  bool _isActive = true;
  bool _saving = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    final user = widget.user ?? {};
    _emailController = TextEditingController(text: user['email'] ?? '');
    _usernameController = TextEditingController(text: user['username'] ?? '');
    _firstNameController = TextEditingController(text: user['first_name'] ?? '');
    _lastNameController = TextEditingController(text: user['last_name'] ?? '');
    _phoneController = TextEditingController(text: user['phone'] ?? '');
    _role = user['role']?.toString() ?? 'student';
    _isActive = user['is_active'] ?? true;
    _passwordController = TextEditingController();
  }

  @override
  void dispose() {
    _emailController.dispose();
    _usernameController.dispose();
    _firstNameController.dispose();
    _lastNameController.dispose();
    _phoneController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _saveUser() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() { _saving = true; _error = null; });
    try {
      final service = AdminService();
      final userData = {
        'email': _emailController.text,
        'username': _usernameController.text,
        'first_name': _firstNameController.text,
        'last_name': _lastNameController.text,
        'phone': _phoneController.text,
        'role': _role,
        'is_active': _isActive,
      };
      if (_passwordController.text.isNotEmpty || widget.user == null) {
        userData['password'] = _passwordController.text;
      }
      if (widget.user == null) {
        await service.createUser(userData);
      } else {
        await service.updateUser(widget.user!['id'].toString(), userData);
      }
      if (!mounted) return;
      Navigator.pop(context, true);
    } catch (e) {
      setState(() { _error = 'Failed to save user: $e'; });
    } finally {
      setState(() { _saving = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.user == null ? 'Add User' : 'Edit User')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: ListView(
            children: [
              TextFormField(
                controller: _emailController,
                decoration: const InputDecoration(labelText: 'Email'),
                validator: (v) => v == null || v.isEmpty ? 'Email required' : null,
              ),
              TextFormField(
                controller: _usernameController,
                decoration: const InputDecoration(labelText: 'Username'),
                validator: (v) => v == null || v.isEmpty ? 'Username required' : null,
              ),
              TextFormField(
                controller: _passwordController,
                decoration: const InputDecoration(labelText: 'Password'),
                obscureText: true,
                validator: (v) {
                  if (widget.user == null && (v == null || v.isEmpty)) {
                    return 'Password required';
                  }
                  return null;
                },
              ),
              TextFormField(
                controller: _firstNameController,
                decoration: const InputDecoration(labelText: 'First Name'),
              ),
              TextFormField(
                controller: _lastNameController,
                decoration: const InputDecoration(labelText: 'Last Name'),
              ),
              TextFormField(
                controller: _phoneController,
                decoration: const InputDecoration(labelText: 'Phone'),
              ),
              DropdownButtonFormField<String>(
                initialValue: _role,
                items: const [
                  DropdownMenuItem(value: 'admin', child: Text('Admin')),
                  DropdownMenuItem(value: 'teacher', child: Text('Teacher')),
                  DropdownMenuItem(value: 'student', child: Text('Student')),
                ],
                onChanged: (v) => setState(() => _role = v ?? 'student'),
                decoration: const InputDecoration(labelText: 'Role'),
              ),
              SwitchListTile(
                value: _isActive,
                onChanged: (v) => setState(() => _isActive = v),
                title: const Text('Active'),
              ),
              if (_error != null)
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 8.0),
                  child: Text(_error!, style: const TextStyle(color: Colors.red)),
                ),
              ElevatedButton(
                onPressed: _saving ? null : _saveUser,
                child: _saving ? const CircularProgressIndicator() : Text(widget.user == null ? 'Create' : 'Update'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
