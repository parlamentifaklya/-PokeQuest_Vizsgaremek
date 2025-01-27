import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  final String baseUrl = 'http://localhost:5130/api'; // Replace with your actual API base URL

  // Function to login and get JWT token
  Future<String?> login(String email, String password) async {
    final url = Uri.parse('$baseUrl/User/Login'); // Assuming the login endpoint

    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: json.encode({'email': email, 'password': password}),
    );

    if (response.statusCode == 200) {
      final responseData = json.decode(response.body);
      return responseData['token']; // Extract token from response
    } else if (response.statusCode == 401 || response.statusCode == 403) {
      print('Unauthorized or Forbidden: ${response.body}');
      return null; // Token might be invalid or expired
    } else {
      print('Login failed: ${response.body}');
      return null;
    }
  }

  // Function to update user details (accept String userId)
  Future<bool> updateUser(String token, String userId, Map<String, dynamic> updatedUser) async {
    // Remove 'Inventory' from the updated user object to avoid validation errors
    updatedUser.remove('Inventory');

    final url = Uri.parse('$baseUrl/User/UpdateUser/$userId');
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

  // Function to delete a user by userId
  Future<bool> deleteUser(String token, String userId) async {
    final url = Uri.parse('$baseUrl/User/DeleteUser/$userId');
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

  // Function to create an admin
  Future<bool> createAdmin(String token, Map<String, dynamic> adminDetails) async {
    final url = Uri.parse('$baseUrl/User/CreateAdmin');
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

  // Function to get all users
  Future<List<dynamic>> getUsers(String token) async {
    final url = Uri.parse('$baseUrl/User/GetUsers');
    final response = await http.get(
      url,
      headers: {
        'Authorization': 'Bearer $token', // Pass the JWT token here
      },
    );

    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else if (response.statusCode == 401 || response.statusCode == 403) {
      print('Unauthorized or Forbidden: ${response.body}');
      throw Exception('Unauthorized or Forbidden');
    } else {
      print('Error: ${response.body}');
      return [];
    }
  }

  // Function to check if the user has the 'Admin' role
  bool isAdmin(String token) {
    try {
      final decodedToken = _decodeJwt(token);
      if (decodedToken != null) {
        // Check if the token is expired
        if (isTokenExpired(decodedToken)) {
          print("Token has expired.");
          return false;
        }

        // Check for the custom role claim: "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        final role = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
        print("Decoded Token Role: $role"); // Debug: Log the role

        if (role == 'Admin') {
          return true;
        }
      }
    } catch (e) {
      print('Error decoding JWT: $e');
    }
    return false;
  }

  bool isTokenExpired(Map<String, dynamic> decodedToken) {
    final exp = decodedToken['exp'];
    if (exp != null) {
      final expirationTime = DateTime.fromMillisecondsSinceEpoch(exp * 1000); // Convert from seconds to milliseconds
      final currentTime = DateTime.now();
      if (currentTime.isAfter(expirationTime)) {
        return true;
      }
    }
    return false;
  }

  // Helper function to decode JWT token
  Map<String, dynamic>? _decodeJwt(String token) {
    try {
      final parts = token.split('.');
      final payload = parts[1];
      final decoded = _base64UrlDecode(payload);
      return json.decode(decoded);
    } catch (e) {
      print('Error decoding JWT token: $e');
      return null;
    }
  }

  // Helper function to decode base64url encoded JWT payload
  String _base64UrlDecode(String input) {
    var output = input.replaceAll('-', '+').replaceAll('_', '/');
    switch (output.length % 4) {
      case 2:
        output += '==';
        break;
      case 3:
        output += '=';
        break;
      default:
    }
    return String.fromCharCodes(base64Url.decode(output));
  }
}
