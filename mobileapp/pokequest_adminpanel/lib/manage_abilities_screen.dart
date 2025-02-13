import 'dart:io';
import 'package:flutter/material.dart';
import 'package:http_parser/http_parser.dart';
import 'package:image_picker/image_picker.dart';
import 'package:http/http.dart' as http;
import 'package:mime/mime.dart';
import 'package:pokequest_adminpanel/services/api_service.dart';

class ManageAbilitiesScreen extends StatefulWidget {
  final String token; // Token received from AdminPanelScreen

  const ManageAbilitiesScreen({super.key, required this.token});

  @override
  _ManageAbilitiesScreenState createState() => _ManageAbilitiesScreenState();
}

class _ManageAbilitiesScreenState extends State<ManageAbilitiesScreen> {
  bool _isLoading = false;
  List<dynamic> _abilities = [];
  List<dynamic> _types = []; // List to hold the types fetched from the API
  final ApiService _apiService = ApiService();
  final _picker = ImagePicker();

  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _damageController = TextEditingController();
  final TextEditingController _descriptionController = TextEditingController();
  final TextEditingController _healthPointController = TextEditingController();
  final TextEditingController _rechargeTimeController = TextEditingController();
  dynamic _image; // Allow both File types
  String? _selectedTypeId; // Store the selected type ID

  @override
  void initState() {
    super.initState();
    _fetchAbilities();
    _fetchTypes(); // Fetch types on init
  }

  // Fetch all abilities from API
  Future<void> _fetchAbilities() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final abilities = await _apiService.getAllAbilities(widget.token);
      setState(() {
        _abilities = abilities;
      });
    } catch (e) {
      print('Error fetching abilities: $e');
      ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load abilities')));
    }

    setState(() {
      _isLoading = false;
    });
  }

  // Fetch all types from API
  Future<void> _fetchTypes() async {
    try {
      final types = await _apiService.getAllTypes(widget.token);
      setState(() {
        _types = types;
      });
    } catch (e) {
      print('Error fetching types: $e');
      ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load types')));
    }
  }

  // Pick an image for the ability (Mobile support)
  Future<void> _pickImage() async {
    final pickedFile = await _picker.pickImage(source: ImageSource.gallery);
    if (pickedFile != null) {
      setState(() {
        _image = pickedFile;
      });
    }
  }

  // Create a new ability
  Future<void> _createAbility() async {
    if (_nameController.text.isEmpty ||
        _damageController.text.isEmpty ||
        _descriptionController.text.isEmpty ||
        _healthPointController.text.isEmpty ||
        _rechargeTimeController.text.isEmpty ||
        _selectedTypeId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('All fields are required')));
      return;
    }

    if (_image == null) {
      ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Image is required')));
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      var uri = Uri.parse("http://10.0.2.2:5130/api/Ability/CreateAbility"); // Emulator special URL
      var request = http.MultipartRequest('POST', uri);
      request.headers['Authorization'] = 'Bearer ${widget.token}';

      // Add the ability parameters
      request.fields['name'] = _nameController.text;
      request.fields['damage'] = _damageController.text;
      request.fields['description'] = _descriptionController.text;
      request.fields['healthPoint'] = _healthPointController.text;
      request.fields['rechargeTime'] = _rechargeTimeController.text;
      request.fields['typeId'] = _selectedTypeId!; // Add the selected type ID

      // Mobile platform: use File from image_picker
      var imageFile = File(_image!.path);
      var mimeType = lookupMimeType(_image!.path)!;
      var multipartFile = await http.MultipartFile.fromPath(
        'img',
        _image!.path,
        contentType: MediaType.parse(mimeType),
      );
      request.files.add(multipartFile);

      var response = await request.send();
      if (response.statusCode == 200) {
        ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Ability created successfully')));
        _fetchAbilities(); // Refresh the list
        _nameController.clear();
        _damageController.clear();
        _descriptionController.clear();
        _healthPointController.clear();
        _rechargeTimeController.clear();
        setState(() {
          _image = null;
          _selectedTypeId = null;
        });
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Failed to create ability')));
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')));
    }

    setState(() {
      _isLoading = false;
    });
  }

  // Update an existing ability via dialog (Updated to PUT and with typeId)
  Future<void> _updateAbility(int abilityId) async {
    var ability = _abilities.firstWhere((ability) => ability['id'] == abilityId);

    _nameController.text = ability['name'];
    _damageController.text = ability['damage'].toString();
    _descriptionController.text = ability['description'];
    _healthPointController.text = ability['healthPoint'].toString();
    _rechargeTimeController.text = ability['rechargeTime'].toString();
    _selectedTypeId = ability['typeId'].toString(); // Prefill the typeId

    // Show dialog with current ability data prefilled
    await showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: Text('Update Ability'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: _nameController,
                  decoration: InputDecoration(labelText: 'Ability Name'),
                ),
                TextField(
                  controller: _damageController,
                  decoration: InputDecoration(labelText: 'Damage'),
                  keyboardType: TextInputType.number,
                ),
                TextField(
                  controller: _descriptionController,
                  decoration: InputDecoration(labelText: 'Description'),
                ),
                TextField(
                  controller: _healthPointController,
                  decoration: InputDecoration(labelText: 'Health Point'),
                  keyboardType: TextInputType.number,
                ),
                TextField(
                  controller: _rechargeTimeController,
                  decoration: InputDecoration(labelText: 'Recharge Time'),
                  keyboardType: TextInputType.number,
                ),
                SizedBox(height: 8),
                DropdownButton<String>(
                  value: _selectedTypeId,
                  hint: Text('Select Ability Type'),
                  onChanged: (String? newValue) {
                    setState(() {
                      _selectedTypeId = newValue;
                    });
                  },
                  items: _types.map<DropdownMenuItem<String>>((type) {
                    return DropdownMenuItem<String>(
                      value: type['id'].toString(),
                      child: Text(type['name']),
                    );
                  }).toList(),
                ),
                SizedBox(height: 8),
                ElevatedButton.icon(
                  onPressed: _pickImage,
                  icon: Icon(Icons.image),
                  label: Text('Pick Image'),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () async {
                // Handle update
                var uri = Uri.parse(
                    "http://10.0.2.2:5130/api/Ability/UpdateAbility/$abilityId");
                var request = http.MultipartRequest('PUT', uri);
                request.headers['Authorization'] = 'Bearer ${widget.token}';
                request.fields['name'] = _nameController.text;
                request.fields['damage'] = _damageController.text;
                request.fields['description'] = _descriptionController.text;
                request.fields['healthPoint'] = _healthPointController.text;
                request.fields['rechargeTime'] = _rechargeTimeController.text;
                request.fields['typeId'] = _selectedTypeId!;

                if (_image != null) {
                  var imageFile = File(_image!.path);
                  var mimeType = lookupMimeType(_image!.path)!;
                  var multipartFile = await http.MultipartFile.fromPath(
                    'img',
                    _image!.path,
                    contentType: MediaType.parse(mimeType),
                  );
                  request.files.add(multipartFile);
                }

                var response = await request.send();
                if (response.statusCode == 200) {
                  ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Ability updated successfully')));
                  _fetchAbilities(); // Refresh the list
                  Navigator.pop(context); // Close dialog
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Failed to update ability')));
                }
              },
              child: Text('Update'),
            ),
            TextButton(
              onPressed: () => Navigator.pop(context), // Close dialog
              child: Text('Cancel'),
            ),
          ],
        );
      },
    );
  }

  // Delete an ability
  Future<void> _deleteAbility(int abilityId) async {
    setState(() {
      _isLoading = true;
    });

    bool success = await _apiService.deleteAbility(widget.token, abilityId);
    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Ability deleted successfully')));
      _fetchAbilities(); // Refresh the list
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to delete ability')));
    }

    setState(() {
      _isLoading = false;
    });
  }

  // Build Image Widget (Handles Mobile)
  Widget _buildImageDisplay(String? imageUrl) {
    if (_image != null) {
      return Image.file(File(_image!.path)); // Display image picked from mobile
    } else if (imageUrl != null && imageUrl.isNotEmpty) {
      String baseUrl = 'http://10.0.2.2:5130/api'; // Base URL without /Uploads
      String fullUrl = '$baseUrl/$imageUrl'; // Concatenate the imageUrl directly to the base URL
      return Image.network(fullUrl); // Display image from backend
    } else {
      return Placeholder(fallbackHeight: 150, fallbackWidth: 150); // Show placeholder when no image
    }
  }

  // Function to show the dialog for creating a new ability
  void _showCreateAbilityDialog() {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: Text('Create New Ability'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: _nameController,
                  decoration: InputDecoration(labelText: 'Ability Name'),
                ),
                TextField(
                  controller: _damageController,
                  decoration: InputDecoration(labelText: 'Damage'),
                  keyboardType: TextInputType.number,
                ),
                TextField(
                  controller: _descriptionController,
                  decoration: InputDecoration(labelText: 'Description'),
                ),
                TextField(
                  controller: _healthPointController,
                  decoration: InputDecoration(labelText: 'Health Point'),
                  keyboardType: TextInputType.number,
                ),
                TextField(
                  controller: _rechargeTimeController,
                  decoration: InputDecoration(labelText: 'Recharge Time'),
                  keyboardType: TextInputType.number,
                ),
                SizedBox(height: 8),
                DropdownButton<String>(
                  value: _selectedTypeId,
                  hint: Text('Select Ability Type'),
                  onChanged: (String? newValue) {
                    setState(() {
                      _selectedTypeId = newValue;
                    });
                  },
                  items: _types.map<DropdownMenuItem<String>>((type) {
                    return DropdownMenuItem<String>(
                      value: type['id'].toString(),
                      child: Text(type['name']),
                    );
                  }).toList(),
                ),
                SizedBox(height: 8),
                ElevatedButton.icon(
                  onPressed: _pickImage,
                  icon: Icon(Icons.image),
                  label: Text('Pick Image'),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () {
                _createAbility();
                Navigator.pop(context); // Close dialog after creating ability
              },
              child: Text('Create Ability'),
            ),
            TextButton(
              onPressed: () => Navigator.pop(context), // Close dialog
              child: Text('Cancel'),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Manage Abilities')),
      body: _isLoading
          ? Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Manage Abilities',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            SizedBox(height: 16),
            // Display abilities in a vertical list (Scrollable)
            Column(
              children: _abilities.map((ability) {
                return Container(
                  width: double.infinity,
                  margin: EdgeInsets.symmetric(vertical: 8),
                  child: Card(
                    elevation: 4,
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        children: [
                          _buildImageDisplay(ability['img']),
                          SizedBox(height: 8),
                          Text(
                            ability['name'] ?? 'Unknown Ability',
                            textAlign: TextAlign.center,
                            style: TextStyle(fontWeight: FontWeight.bold),
                          ),
                          Text('Damage: ${ability['damage']}'),
                          Text('Health Point: ${ability['healthPoint']}'),
                          Text('Recharge Time: ${ability['rechargeTime']}'),
                          Text('Description: ${ability['description']}'),
                          SizedBox(height: 8),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              IconButton(
                                onPressed: () =>
                                    _updateAbility(ability['id']),
                                icon: Icon(Icons.edit),
                              ),
                              IconButton(
                                onPressed: () =>
                                    _deleteAbility(ability['id']),
                                icon: Icon(Icons.delete),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _showCreateAbilityDialog,
        child: Icon(Icons.add),
      ),
    );
  }
}
