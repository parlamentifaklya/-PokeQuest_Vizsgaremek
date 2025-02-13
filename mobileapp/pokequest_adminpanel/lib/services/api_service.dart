import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:image_picker/image_picker.dart';

class ApiService {
  final String baseUrl = 'http://10.0.2.2:5130/api'; // Updated base URL for Android Emulator

  // Function to login and get JWT token
  Future<String?> login(String email, String password) async {
    final url = Uri.parse('$baseUrl/User/Login');

    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: json.encode({'email': email, 'password': password}),
    );

    if (response.statusCode == 200) {
      final responseData = json.decode(response.body);
      return responseData['token'];
    } else {
      print('Login failed: ${response.body}');
      return null;
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
      return json.decode(response.body); // Return the list of users
    } else {
      print('Error: ${response.body}');
      return [];
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

  // Function to get all types
  Future<List<dynamic>> getAllTypes(String token) async {
    final url = Uri.parse('$baseUrl/Type/GetAllTypes');
    final response = await http.get(
      url,
      headers: {
        'Authorization': 'Bearer $token', // Pass the JWT token here
      },
    );

    if (response.statusCode == 200) {
      return json.decode(response.body); // Return the list of types
    } else {
      print('Error: ${response.body}');
      return [];
    }
  }

  // Function to create a type with image path
  Future<bool> createType(String token, Map<String, dynamic> typeData, {required String imgPath}) async {
    final url = Uri.parse('$baseUrl/Type/CreateType');
    var request = http.MultipartRequest('POST', url)
      ..headers['Authorization'] = 'Bearer $token';

    // Add the form fields
    request.fields['Name'] = typeData['Name'] ?? '';

    // If there's an image, attach it to the request
    if (imgPath.isNotEmpty) {
      request.files.add(await http.MultipartFile.fromPath('img', imgPath));
    }

    final streamedResponse = await request.send();
    final response = await http.Response.fromStream(streamedResponse);

    if (response.statusCode == 201) {
      return true;
    } else {
      print('Error: ${response.body}');
      return false;
    }
  }

  // Function to create a type with XFile image
  Future<bool> createTypeWithXFile(String token, Map<String, dynamic> typeData, {required XFile imageFile}) async {
    final url = Uri.parse('$baseUrl/Type/CreateType');
    var request = http.MultipartRequest('POST', url)
      ..headers['Authorization'] = 'Bearer $token';

    // Add the form fields
    request.fields['Name'] = typeData['Name'] ?? '';

    // If there's an image, attach it to the request
    if (imageFile.path.isNotEmpty) {
      request.files.add(await http.MultipartFile.fromPath('img', imageFile.path));
    }

    final streamedResponse = await request.send();
    final response = await http.Response.fromStream(streamedResponse);

    if (response.statusCode == 201) {
      return true;
    } else {
      print('Error: ${response.body}');
      return false;
    }
  }

  // Function to update a type with optional XFile image
  Future<bool> updateTypeWithXFile(String token, int id, Map<String, dynamic> updatedTypeData, {XFile? imageFile}) async {
    final url = Uri.parse('$baseUrl/Type/UpdateType/$id');
    var request = http.MultipartRequest('PUT', url)
      ..headers['Authorization'] = 'Bearer $token';

    // Add the form fields
    request.fields['Name'] = updatedTypeData['Name'] ?? '';

    // If there's an image, attach it to the request
    if (imageFile != null && imageFile.path.isNotEmpty) {
      request.files.add(await http.MultipartFile.fromPath('img', imageFile.path));
    }

    final streamedResponse = await request.send();
    final response = await http.Response.fromStream(streamedResponse);

    if (response.statusCode == 204) {
      return true;
    } else {
      print('Error: ${response.body}');
      return false;
    }
  }

  // Function to delete a type
  Future<bool> deleteType(String token, int id) async {
    final url = Uri.parse('$baseUrl/Type/DeleteType/$id');
    final response = await http.delete(
      url,
      headers: {
        'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode == 204) {
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
        'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode == 204) {
      return true;
    } else {
      print('Error: ${response.body}');
      return false;
    }
  }

  // Function to get all abilities
  Future<List<dynamic>> getAllAbilities(String token) async {
    final url = Uri.parse('$baseUrl/Ability/GetAllAbilities');
    final response = await http.get(
      url,
      headers: {
        'Authorization': 'Bearer $token', // Pass the JWT token here
      },
    );

    if (response.statusCode == 200) {
      return json.decode(response.body); // Return the list of abilities
    } else {
      print('Error: ${response.body}');
      return [];
    }
  }

  // Function to create a new ability with image upload (XFile)
  Future<bool> createAbility(String token, Map<String, dynamic> abilityData, {required XFile file}) async {
    final url = Uri.parse('$baseUrl/Ability/CreateAbility');
    var request = http.MultipartRequest('POST', url)
      ..headers['Authorization'] = 'Bearer $token';

    // Add the form fields
    request.fields['Name'] = abilityData['Name'] ?? '';
    request.fields['Description'] = abilityData['Description'] ?? '';
    request.fields['Damage'] = abilityData['Damage'].toString();
    request.fields['healthPoint'] = abilityData['healthPoint'].toString();
    request.fields['RechargeTime'] = abilityData['RechargeTime'].toString();
    request.fields['TypeId'] = abilityData['TypeId'].toString();

    // If there's an image, attach it to the request
    if (file.path.isNotEmpty) {
      request.files.add(await http.MultipartFile.fromPath('File', file.path));
    }

    final streamedResponse = await request.send();
    final response = await http.Response.fromStream(streamedResponse);

    if (response.statusCode == 201) {
      return true;
    } else {
      print('Error: ${response.body}');
      return false;
    }
  }

  // Function to update an existing ability with optional image upload (XFile)
  Future<bool> updateAbility(String token, int id, Map<String, dynamic> updatedAbilityData, {XFile? file}) async {
    final url = Uri.parse('$baseUrl/Ability/UpdateAbility/$id');
    var request = http.MultipartRequest('PUT', url)
      ..headers['Authorization'] = 'Bearer $token';

    // Add the form fields
    request.fields['Name'] = updatedAbilityData['Name'] ?? '';
    request.fields['Description'] = updatedAbilityData['Description'] ?? '';
    request.fields['Damage'] = updatedAbilityData['Damage'].toString();
    request.fields['healthPoint'] = updatedAbilityData['healthPoint'].toString();
    request.fields['RechargeTime'] = updatedAbilityData['RechargeTime'].toString();
    request.fields['TypeId'] = updatedAbilityData['TypeId'].toString();

    // If there's an image, attach it to the request
    if (file != null && file.path.isNotEmpty) {
      request.files.add(await http.MultipartFile.fromPath('File', file.path));
    }

    final streamedResponse = await request.send();
    final response = await http.Response.fromStream(streamedResponse);

    if (response.statusCode == 204) {
      return true;
    } else {
      print('Error: ${response.body}');
      return false;
    }
  }

  // Function to delete an ability by ID
  Future<bool> deleteAbility(String token, int id) async {
    final url = Uri.parse('$baseUrl/Ability/DeleteAbility?id=$id');
    final response = await http.delete(
      url,
      headers: {
        'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode == 200) {
      return true;
    } else {
      print('Error: ${response.body}');
      return false;
    }
  }

  // Function to get all items
  Future<List<dynamic>> getAllItems(String token) async {
    final url = Uri.parse('$baseUrl/Item/all');
    final response = await http.get(
      url,
      headers: {
        'Authorization': 'Bearer $token', // Pass the JWT token here
      },
    );

    if (response.statusCode == 200) {
      return json.decode(response.body); // Return the list of items
    } else {
      print('Error: ${response.body}');
      return [];
    }
  }

  // Function to create an item with image upload (Image is required)
  Future<bool> createItem(String token, Map<String, dynamic> itemData, {required XFile imageFile}) async {
    final url = Uri.parse('$baseUrl/Item/CreateItem');
    var request = http.MultipartRequest('POST', url)
      ..headers['Authorization'] = 'Bearer $token';

    // Add the form fields
    request.fields['name'] = itemData['name'] ?? '';
    request.fields['description'] = itemData['description'] ?? '';
    request.fields['itemAbility'] = itemData['itemAbility'] ?? '';
    request.fields['rarity'] = itemData['rarity'] ?? '';

    // If there's an image, attach it to the request
    if (imageFile.path.isNotEmpty) {
      request.files.add(await http.MultipartFile.fromPath('file', imageFile.path));
    } else {
      print("Error: Image file is required.");
      return false;
    }

    final streamedResponse = await request.send();
    final response = await http.Response.fromStream(streamedResponse);

    if (response.statusCode == 201) {
      return true;
    } else {
      print('Error: ${response.body}');
      return false;
    }
  }

  // Function to update an existing item with optional image upload
  Future<bool> updateItem(String token, int id, Map<String, dynamic> updatedItemData, {XFile? imageFile}) async {
    final url = Uri.parse('$baseUrl/Item/$id');
    var request = http.MultipartRequest('PUT', url)
      ..headers['Authorization'] = 'Bearer $token';

    // Add the form fields
    request.fields['name'] = updatedItemData['name'] ?? '';
    request.fields['description'] = updatedItemData['description'] ?? '';
    request.fields['itemAbility'] = updatedItemData['itemAbility'] ?? '';
    request.fields['rarity'] = updatedItemData['rarity'] ?? '';

    // If there's an image file, attach it to the request
    if (imageFile != null && imageFile.path.isNotEmpty) {
      request.files.add(await http.MultipartFile.fromPath('file', imageFile.path));
    }

    final streamedResponse = await request.send();
    final response = await http.Response.fromStream(streamedResponse);

    if (response.statusCode == 204) {
      return true;
    } else {
      print('Error: ${response.body}');
      return false;
    }
  }

  // Function to delete an item by ID
  Future<bool> deleteItem(String token, int id) async {
    final url = Uri.parse('$baseUrl/Item/$id');
    final response = await http.delete(
      url,
      headers: {
        'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode == 204) {
      return true;
    } else {
      print('Error: ${response.body}');
      return false;
    }
  }

  // Method to get all Feylings
  Future<List<dynamic>> getAllFeylings(String token) async {
    final url = Uri.parse('$baseUrl/Feylings/GetAllFeylings');
    final response = await http.get(
      url,
      headers: {
        'Authorization': 'Bearer $token', // Pass the JWT token here
      },
    );

    if (response.statusCode == 200) {
      return json.decode(response.body); // Return the list of Feylings
    } else {
      print('Error: ${response.body}');
      return [];
    }
  }

  // Method to create a new Feyling
  Future<bool> createFeyling(String token, Map<String, dynamic> feylingData, {required XFile imgFile}) async {
    final url = Uri.parse('$baseUrl/Feylings/CreateFeyling');
    var request = http.MultipartRequest('POST', url)
      ..headers['Authorization'] = 'Bearer $token';

    // Add the form fields
    request.fields['name'] = feylingData['name'] ?? '';
    request.fields['description'] = feylingData['description'] ?? '';
    request.fields['typeId'] = feylingData['typeId'].toString();
    request.fields['abilityId'] = feylingData['abilityId'].toString();
    request.fields['isUnlocked'] = feylingData['isUnlocked'].toString();
    request.fields['hp'] = feylingData['hp'].toString();
    request.fields['atk'] = feylingData['atk'].toString();
    request.fields['itemId'] = feylingData['itemId']?.toString() ?? '';  // Nullable ItemId
    request.fields['weakAgainstId'] = feylingData['weakAgainstId'].toString();
    request.fields['strongAgainstId'] = feylingData['strongAgainstId'].toString();
    request.fields['sellPrice'] = feylingData['sellPrice'].toString();

    // If there's an image, attach it to the request
    if (imgFile.path.isNotEmpty) {
      request.files.add(await http.MultipartFile.fromPath('Img', imgFile.path));
    }

    final streamedResponse = await request.send();
    final response = await http.Response.fromStream(streamedResponse);

    if (response.statusCode == 201) {
      return true;
    } else {
      print('Error: ${response.body}');
      return false;
    }
  }

  // Method to update an existing Feyling
  Future<bool> updateFeyling(String token, int id, Map<String, dynamic> updatedFeylingData, {XFile? imgFile}) async {
    final url = Uri.parse('$baseUrl/Feylings/UpdateFeyling/$id');
    var request = http.MultipartRequest('PUT', url)
      ..headers['Authorization'] = 'Bearer $token';

    // Add the form fields
    request.fields['name'] = updatedFeylingData['name'] ?? '';
    request.fields['description'] = updatedFeylingData['description'] ?? '';
    request.fields['typeId'] = updatedFeylingData['typeId'].toString();
    request.fields['abilityId'] = updatedFeylingData['abilityId'].toString();
    request.fields['isUnlocked'] = updatedFeylingData['isUnlocked'].toString();
    request.fields['hp'] = updatedFeylingData['hp'].toString();
    request.fields['atk'] = updatedFeylingData['atk'].toString();
    request.fields['itemId'] = updatedFeylingData['itemId']?.toString() ?? '';
    request.fields['weakAgainstId'] = updatedFeylingData['weakAgainstId'].toString();
    request.fields['strongAgainstId'] = updatedFeylingData['strongAgainstId'].toString();
    request.fields['sellPrice'] = updatedFeylingData['sellPrice'].toString();

    // If there's an image, attach it to the request
    if (imgFile != null && imgFile.path.isNotEmpty) {
      request.files.add(await http.MultipartFile.fromPath('Img', imgFile.path));
    }

    final streamedResponse = await request.send();
    final response = await http.Response.fromStream(streamedResponse);

    if (response.statusCode == 204) {
      return true;
    } else {
      print('Error: ${response.body}');
      return false;
    }
  }

  // Method to delete a Feyling
  Future<bool> deleteFeyling(String token, int id) async {
    final url = Uri.parse('$baseUrl/Feylings/DeleteFeyling?id=$id');
    final response = await http.delete(
      url,
      headers: {
        'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode == 204) {
      return true;
    } else {
      print('Error: ${response.body}');
      return false;
    }
  }

  // Function to check if the user has the 'Admin' role
  bool isAdmin(String token) {
    try {
      final decodedToken = _decodeJwt(token);
      if (decodedToken != null) {
        if (isTokenExpired(decodedToken)) {
          print("Token has expired.");
          return false;
        }

        final role = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
        print("Decoded Token Role: $role");

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
      final expirationTime = DateTime.fromMillisecondsSinceEpoch(exp * 1000);
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
