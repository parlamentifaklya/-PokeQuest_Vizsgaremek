import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'services/api_service.dart'; // Assuming this is where your API logic lives
import 'admin_panel_screen.dart'; // Your Admin Panel Screen
import 'package:jwt_decoder/jwt_decoder.dart'; // Add jwt_decoder to check token expiry

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  _LoginScreenState createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final ApiService _apiService = ApiService();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;

  // Function to handle login
  Future<void> _login() async {
    final email = _emailController.text.trim();
    final password = _passwordController.text.trim();

    if (email.isEmpty || password.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Please enter both email and password')),
      );
      return;
    }

    setState(() {
      _isLoading = true;
    });

    // Call the login API to get the JWT token
    final token = await _apiService.login(email, password);

    if (token != null) {
      // Check if the token is expired
      if (isTokenExpired(token)) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Session expired, please log in again')),
        );
        return;
      }

      // Check if the logged-in user has the "Admin" role
      if (_apiService.isAdmin(token)) {
        // Save the token in shared preferences
        SharedPreferences prefs = await SharedPreferences.getInstance();
        prefs.setString('jwt_token', token);

        // Navigate to the admin panel screen and pass the token
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (context) => AdminPanelScreen(token: token),
          ),
        );
      } else {
        // Show an error message if the user is not an admin
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('You are not authorized to access the admin panel')),
        );
      }
    } else {
      // Handle login failure
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Login failed')),
      );
    }

    setState(() {
      _isLoading = false;
    });
  }

  bool isTokenExpired(String token) {
    return JwtDecoder.isExpired(token);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Login')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            TextField(
              controller: _emailController,
              decoration: InputDecoration(labelText: 'Email'),
            ),
            TextField(
              controller: _passwordController,
              obscureText: true,
              decoration: InputDecoration(labelText: 'Password'),
            ),
            SizedBox(height: 20),
            _isLoading
                ? CircularProgressIndicator()
                : ElevatedButton(
                    onPressed: _login,
                    child: Text('Login'),
                  ),
          ],
        ),
      ),
    );
  }
}
