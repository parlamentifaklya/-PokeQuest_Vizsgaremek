import 'package:flutter/material.dart';
import 'package:pokequest_adminpanel/services/api_service.dart';
import 'package:jwt_decoder/jwt_decoder.dart'; // For checking token expiration
import 'login_screen.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AdminPanelScreen extends StatefulWidget {
  final String token; // Token passed from the login screen

  const AdminPanelScreen({super.key, required this.token}); // Receiving the token

  @override
  _AdminPanelScreenState createState() => _AdminPanelScreenState();
}

class _AdminPanelScreenState extends State<AdminPanelScreen> {
  bool _isLoading = false;
  List<dynamic> _data = [];
  final ApiService _apiService = ApiService(); // Instance of ApiService

  // Controllers for text fields
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _roleController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _fetchProtectedData(); // Fetch protected data after initialization
  }

  Future<void> _fetchProtectedData() async {
    setState(() {
      _isLoading = true;
    });

    // Check if token is expired before making the request
    if (isTokenExpired(widget.token)) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Session expired, please log in again')),
      );
      SharedPreferences prefs = await SharedPreferences.getInstance();
      prefs.remove('jwt_token'); // Clear saved token
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => LoginScreen()),
      );
      return;
    }

    try {
      final users = await _apiService.getUsers(widget.token); // Using getUsers method

      setState(() {
        _data = users;
      });
        } catch (e) {
      print('Error fetching data: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to load data')),
      );
    }

    setState(() {
      _isLoading = false;
    });
  }

  bool isTokenExpired(String token) {
    return JwtDecoder.isExpired(token); // Using jwt_decoder package to check token expiry
  }

  // Function to update a user
  Future<void> _updateUser(String userId, Map<String, dynamic> updatedUser) async {
    setState(() {
      _isLoading = true;
    });

    // Ensure the Inventory field is present (either empty or with existing data)
    updatedUser['Inventory'] = updatedUser['Inventory'] ?? {
      'OwnedFeylings': [],
      'UserItems': [],
    };

    bool success = await _apiService.updateUser(widget.token, userId, updatedUser);
    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('User updated successfully')));
      _fetchProtectedData(); // Refresh data after update
    } else {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to update user')));
    }

    setState(() {
      _isLoading = false;
    });
  }

  // Function to delete a user
  Future<void> _deleteUser(String userId) async {
    setState(() {
      _isLoading = true;
    });

    bool success = await _apiService.deleteUser(widget.token, userId);
    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('User deleted successfully')));
      _fetchProtectedData(); // Refresh data after deletion
    } else {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to delete user')));
    }

    setState(() {
      _isLoading = false;
    });
  }

  // Function to create a new admin
  Future<void> _createAdmin() async {
    if (_nameController.text.isEmpty || _emailController.text.isEmpty || _roleController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('All fields are required')));
      return;
    }

    Map<String, dynamic> newAdmin = {
      'name': _nameController.text,
      'email': _emailController.text,
      'role': _roleController.text,
    };

    setState(() {
      _isLoading = true;
    });

    bool success = await _apiService.createAdmin(widget.token, newAdmin);
    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Admin created successfully')));
      _fetchProtectedData(); // Refresh data after creating admin
    } else {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to create admin')));
    }

    setState(() {
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Admin Panel')),
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

                return ListTile(
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
                      controller: _roleController,
                      decoration: InputDecoration(labelText: 'Role'),
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
