import 'package:flutter/material.dart';

class UserManagementScreen extends StatelessWidget {
  const UserManagementScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    // This is a placeholder. In a real app, fetch users from backend and display in a list.
    return Scaffold(
      appBar: AppBar(title: const Text('User Management')),
      body: ListView(
        padding: const EdgeInsets.all(16.0),
        children: [
          ListTile(
            leading: const Icon(Icons.person),
            title: const Text('John Doe'),
            subtitle: const Text('Role: Student'),
            trailing: IconButton(
              icon: const Icon(Icons.edit),
              onPressed: () {
                // TODO: Edit user
              },
            ),
          ),
          ListTile(
            leading: const Icon(Icons.person),
            title: const Text('Jane Smith'),
            subtitle: const Text('Role: Teacher'),
            trailing: IconButton(
              icon: const Icon(Icons.edit),
              onPressed: () {
                // TODO: Edit user
              },
            ),
          ),
          // Add more users here or fetch from backend
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // TODO: Add new user
        },
        child: const Icon(Icons.add),
        tooltip: 'Add User',
      ),
    );
  }
}
