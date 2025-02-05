import 'package:flutter/material.dart';
import 'package:pokequest_adminpanel/services/api_service.dart';
import 'package:jwt_decoder/jwt_decoder.dart';
import 'login_screen.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'manage_types_screen.dart';

class AdminPanelScreen extends StatefulWidget {
  final String token;

  const AdminPanelScreen({super.key, required this.token});

  @override
  _AdminPanelScreenState createState() => _AdminPanelScreenState();
}

class _AdminPanelScreenState extends State<AdminPanelScreen> {
  bool _isLoading = false;
  List<dynamic> _data = [];
  final ApiService _apiService = ApiService();

  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _fetchProtectedData();
  }

  Future<void> _fetchProtectedData() async {
    setState(() {
      _isLoading = true;
    });

    // Check token expiration
    if (isTokenExpired(widget.token)) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Session expired, please log in again')),
      );
      SharedPreferences prefs = await SharedPreferences.getInstance();
      prefs.remove('jwt_token');
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => LoginScreen()),
      );
      return;
    }

    try {
      final users = await _apiService.getUsers(widget.token);
      setState(() {
        // Filter out users with 'Admin' role
        _data = users.where((user) {
          return !(user['roles'] != null && user['roles'].contains('Admin'));
        }).toList();
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to load data')));
    }

    setState(() {
      _isLoading = false;
    });
  }

  bool isTokenExpired(String token) {
    return JwtDecoder.isExpired(token);
  }

  Future<void> _updateUser(String userId, Map<String, dynamic> updatedUser) async {
    setState(() {
      _isLoading = true;
    });

    updatedUser['Inventory'] = updatedUser['Inventory'] ?? {'OwnedFeylings': [], 'UserItems': []};

    bool success = await _apiService.updateUser(widget.token, userId, updatedUser);
    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('User updated successfully')));
      _fetchProtectedData();
    } else {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to update user')));
    }

    setState(() {
      _isLoading = false;
    });
  }

  Future<void> _deleteUser(String userId) async {
    setState(() {
      _isLoading = true;
    });

    bool success = await _apiService.deleteUser(widget.token, userId);
    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('User deleted successfully')));
      _fetchProtectedData();
    } else {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to delete user')));
    }

    setState(() {
      _isLoading = false;
    });
  }

  Future<void> _createAdmin() async {
    if (_nameController.text.isEmpty || _emailController.text.isEmpty || _passwordController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('All fields are required')));
      return;
    }

    Map<String, dynamic> newAdmin = {
      'name': _nameController.text,
      'email': _emailController.text,
      'role': 'Admin',
      'password': _passwordController.text,
    };

    setState(() {
      _isLoading = true;
    });

    bool success = await _apiService.createAdmin(widget.token, newAdmin);
    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Admin created successfully')));
      _fetchProtectedData();
    } else {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to create admin')));
    }

    setState(() {
      _isLoading = false;
    });
  }

  void _navigateToManageTypesScreen() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => ManageTypesScreen(token: widget.token),
      ),
    );
  }

  Future<void> _logout() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    prefs.remove('jwt_token');
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (context) => LoginScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Admin Panel'),
        actions: [
          IconButton(
            icon: Icon(Icons.exit_to_app),
            onPressed: _logout,
          ),
        ],
      ),
      drawer: Drawer(
        child: ListView(
          padding: EdgeInsets.zero,
          children: <Widget>[
            DrawerHeader(
              decoration: BoxDecoration(
                color: Colors.blue,
              ),
              child: Text(
                'Admin Panel',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 24,
                ),
              ),
            ),
            ListTile(
              title: Text('Manage Users'),
              leading: Icon(Icons.group),
              onTap: () {
                Navigator.pushReplacementNamed(context, '/manageUsers', arguments: widget.token);
              },
            ),
            ListTile(
              title: Text('Manage Types'),
              leading: Icon(Icons.settings),
              onTap: _navigateToManageTypesScreen,
            ),
            ListTile(
              title: Text('Logout'),
              leading: Icon(Icons.logout),
              onTap: _logout,
            ),
          ],
        ),
      ),
      body: _isLoading
          ? Center(child: CircularProgressIndicator())
          : ListView.builder(
        itemCount: _data.length,
        itemBuilder: (context, index) {
          var user = _data[index];
          String userName = user['userName'] ?? 'Unknown';
          String email = user['email'] ?? 'Unknown';
          String roles = (user['roles'] != null && user['roles'] is List && user['roles'].isNotEmpty)
              ? user['roles'].join(', ')
              : 'Unknown';

          return Card(
            margin: EdgeInsets.symmetric(vertical: 8.0, horizontal: 16.0),
            child: ListTile(
              leading: CircleAvatar(
                child: Text(userName[0].toUpperCase()), // Display first letter of the user's name
              ),
              title: Text(userName),
              subtitle: Text('Email: $email\nRoles: $roles'),
              trailing: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  IconButton(
                    icon: Icon(Icons.edit),
                    onPressed: () {
                      Map<String, dynamic> updatedUser = {
                        'userName': 'Updated Name',
                        'email': email,
                      };
                      _updateUser(user['id'], updatedUser);
                    },
                  ),
                  IconButton(
                    icon: Icon(Icons.delete),
                    onPressed: () {
                      _deleteUser(user['id']);
                    },
                  ),
                ],
              ),
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          showModalBottomSheet(
            context: context,
            builder: (BuildContext context) {
              return Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    TextField(
                      controller: _nameController,
                      decoration: InputDecoration(labelText: 'Name'),
                    ),
                    TextField(
                      controller: _emailController,
                      decoration: InputDecoration(labelText: 'Email'),
                    ),
                    TextField(
                      controller: _passwordController,
                      decoration: InputDecoration(labelText: 'Password'),
                      obscureText: true,
                    ),
                    SizedBox(height: 20),
                    ElevatedButton(
                      onPressed: _createAdmin,
                      child: Text('Create Admin'),
                    ),
                  ],
                ),
              );
            },
          );
        },
        tooltip: 'Create Admin',
        child: Icon(Icons.add),
      ),
    );
  }
}
