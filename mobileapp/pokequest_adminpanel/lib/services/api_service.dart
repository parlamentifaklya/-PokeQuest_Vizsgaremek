import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  final String baseUrl = 'https://yourapi.com/api'; // Replace with your actual API base URL

  // Function to login and get JWT token
  Future<String?> login(String email, String password) async {
    final url = Uri.parse('$baseUrl/login');
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: json.encode({
        'email': email,
        'password': password,
      }),
    );

    if (response.statusCode == 200) {
      final responseBody = json.decode(response.body);
      // Extract the token from the response and return it
      return responseBody['token'];
    } else {
      print('Login failed: ${response.body}');
      return null;
    }
  }

  // Function to update user
  Future<bool> updateUser(String token, String username, Map<String, dynamic> updatedUser) async {
    final url = Uri.parse('$baseUrl/users/$username');
    final response = await http.put(
      url,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token', // Pass the JWT token here
      },
      body: json.encode(updatedUser),
    );

    if (response.statusCode == 200) {
      return true;
    } else {
      print('Error: ${response.body}');
      return false;
    }
  }

  // Function to delete user
  Future<bool> deleteUser(String token, int userId) async {
    final url = Uri.parse('$baseUrl/users/$userId');
    final response = await http.delete(
      url,
      headers: {
        'Authorization': 'Bearer $token', // Pass the JWT token here
      },
    );

    if (response.statusCode == 200) {
      return true;
    } else {
      print('Error: ${response.body}');
      return false;
    }
  }

  // Function to create admin
  Future<bool> createAdmin(String token, Map<String, dynamic> adminDetails) async {
    final url = Uri.parse('$baseUrl/users/create-admin');
    final response = await http.post(
      url,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token', // Pass the JWT token here
      },
      body: json.encode(adminDetails),
    );

    if (response.statusCode == 200) {
      return true;
    } else {
      print('Error: ${response.body}');
      return false;
    }
  }
}
