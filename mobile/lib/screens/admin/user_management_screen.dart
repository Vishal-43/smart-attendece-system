
import 'package:flutter/material.dart';
import '../../services/admin/admin_service.dart';
import 'user_edit_screen.dart';

class UserManagementScreen extends StatefulWidget {
  const UserManagementScreen({super.key});

  @override
  State<UserManagementScreen> createState() => _UserManagementScreenState();
}

class _UserManagementScreenState extends State<UserManagementScreen> {
  bool _loading = true;
  List<Map<String, dynamic>> _users = [];
  bool _deleting = false;
    Future<void> _deleteUser(String userId) async {
      setState(() {
        _deleting = true;
        _error = null;
      });
      try {
        final service = AdminService();
        await service.deleteUser(userId);
        await _fetchUsers();
      } catch (e) {
        setState(() {
          _error = 'Failed to delete user: $e';
        });
      } finally {
        setState(() {
          _deleting = false;
        });
      }
    }
  String? _error;

  @override
  void initState() {
    super.initState();
    _fetchUsers();
  }

  Future<void> _fetchUsers() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final service = AdminService();
      final users = await service.fetchUsers();
      setState(() {
        _users = users;
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _error = 'Failed to fetch users: $e';
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('User Management')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Text(_error!, style: const TextStyle(color: Colors.red)))
              : _users.isEmpty
                  ? const Center(child: Text('No users found.'))
                  : ListView.builder(
                      padding: const EdgeInsets.all(16.0),
                      itemCount: _users.length,
                      itemBuilder: (context, i) {
                        final user = _users[i];
                        return ListTile(
                          leading: const Icon(Icons.person),
                          title: Text(user['username'] ?? user['email'] ?? 'Unknown'),
                          subtitle: Text('Role: ${user['role'] ?? 'N/A'}'),
                          trailing: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              IconButton(
                                icon: const Icon(Icons.edit),
                                onPressed: () async {
                                  final updated = await Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder: (context) => UserEditScreen(user: user),
                                    ),
                                  );
                                  if (updated == true) {
                                    await _fetchUsers();
                                  }
                                },
                              ),
                              IconButton(
                                icon: const Icon(Icons.delete, color: Colors.red),
                                onPressed: _deleting
                                    ? null
                                    : () async {
                                        final confirm = await showDialog<bool>(
                                          context: context,
                                          builder: (context) => AlertDialog(
                                            title: const Text('Delete User'),
                                            content: const Text('Are you sure you want to delete this user?'),
                                            actions: [
                                              TextButton(
                                                onPressed: () => Navigator.pop(context, false),
                                                child: const Text('Cancel'),
                                              ),
                                              TextButton(
                                                onPressed: () => Navigator.pop(context, true),
                                                child: const Text('Delete'),
                                              ),
                                            ],
                                          ),
                                        );
                                        if (confirm == true) {
                                          await _deleteUser(user['id'].toString());
                                        }
                                      },
                              ),
                            ],
                          ),
                        );
                      },
                    ),
      floatingActionButton: FloatingActionButton(
        onPressed: () async {
          final created = await Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => UserEditScreen(),
            ),
          );
          if (created == true) {
            await _fetchUsers();
          }
        },
        tooltip: 'Add User',
        child: const Icon(Icons.add),
      ),
      bottomNavigationBar: _deleting
          ? const LinearProgressIndicator(minHeight: 3)
          : null,
    );
  }
}
