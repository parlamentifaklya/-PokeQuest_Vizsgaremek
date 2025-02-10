import 'dart:async';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:http_parser/http_parser.dart';
import 'package:image_picker/image_picker.dart'; // For image picking
import 'package:http/http.dart' as http;
import 'package:mime/mime.dart'; // To determine MIME type of image
import 'package:pokequest_adminpanel/services/api_service.dart';

class ManageTypesScreen extends StatefulWidget {
  final String token; // Token received from AdminPanelScreen

  const ManageTypesScreen({super.key, required this.token});

  @override
  _ManageTypesScreenState createState() => _ManageTypesScreenState();
}

class _ManageTypesScreenState extends State<ManageTypesScreen> {
  bool _isLoading = false;
  List<dynamic> _types = [];
  final ApiService _apiService = ApiService();
  final _picker = ImagePicker();

  final TextEditingController _nameController = TextEditingController();
  dynamic _image; // Allow both File types

  @override
  void initState() {
    super.initState();
    _fetchTypes();
  }

  // Fetch all types from API
  Future<void> _fetchTypes() async {
    setState(() {
      _isLoading = true;
    });

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

    setState(() {
      _isLoading = false;
    });
  }

  // Pick an image for the type (Mobile support)
  Future<void> _pickImage() async {
    final pickedFile = await _picker.pickImage(source: ImageSource.gallery);
    if (pickedFile != null) {
      setState(() {
        _image = pickedFile;
      });
    }
  }

  // Create a new type
  Future<void> _createType() async {
    if (_nameController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Name is required')));
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
      var uri = Uri.parse(
          "http://10.0.2.2:5130/api/Type/CreateType"); // Emulator special URL
      var request = http.MultipartRequest('POST', uri);
      request.headers['Authorization'] = 'Bearer ${widget.token}';

      // Add the name parameter
      request.fields['name'] = _nameController.text;

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
            SnackBar(content: Text('Type created successfully')));
        _fetchTypes(); // Refresh the list
        _nameController.clear();
        setState(() {
          _image = null;
        });
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Failed to create type')));
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')));
    }

    setState(() {
      _isLoading = false;
    });
  }

  // Update an existing type
  Future<void> _updateType(int typeId) async {
    if (_nameController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Name is required')));
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
      var uri = Uri.parse(
          "http://10.0.2.2:5130/api/Type/UpdateType/$typeId"); // Emulator special URL
      var request = http.MultipartRequest('POST', uri);
      request.headers['Authorization'] = 'Bearer ${widget.token}';

      // Add the name parameter
      request.fields['name'] = _nameController.text;

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
            SnackBar(content: Text('Type updated successfully')));
        _fetchTypes(); // Refresh the list
        _nameController.clear();
        setState(() {
          _image = null;
        });
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Failed to update type')));
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')));
    }

    setState(() {
      _isLoading = false;
    });
  }

  // Delete a type
  Future<void> _deleteType(int typeId) async {
    setState(() {
      _isLoading = true;
    });

    bool success = await _apiService.deleteType(widget.token, typeId);
    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Type deleted successfully')));
      _fetchTypes(); // Refresh the list
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to delete type')));
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
      String baseUrl = 'http://10.0.2.2:5130/api'; // Base URL without `/Uploads`
      String fullUrl = '$baseUrl/$imageUrl'; // Concatenate the imageUrl directly to the base URL
      return Image.network(fullUrl); // Display image from backend
    } else {
      return Placeholder(fallbackHeight: 150,
          fallbackWidth: 150); // Show placeholder when no image
    }
  }


  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Manage Types')),
      body: _isLoading
          ? Center(child: CircularProgressIndicator())
          : Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Manage Types',
              style: Theme
                  .of(context)
                  .textTheme
                  .headlineSmall,
            ),
            SizedBox(height: 16),
            TextField(
              controller: _nameController,
              decoration: InputDecoration(
                labelText: 'Type Name',
                border: OutlineInputBorder(),
              ),
            ),
            SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: _pickImage,
              icon: Icon(Icons.image),
              label: Text('Pick Image'),
              style: ElevatedButton.styleFrom(
                padding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              ),
            ),
            SizedBox(height: 16),
            _buildImageDisplay(null), // Display the image
            SizedBox(height: 16),
            ElevatedButton(
              onPressed: _createType,
              style: ElevatedButton.styleFrom(
                padding: EdgeInsets.symmetric(vertical: 12),
              ),
              child: Text('Create Type'),
            ),
            SizedBox(height: 16),
            // Display types in a vertical list (Scrollable)
            Expanded(
              child: SingleChildScrollView(
                child: Column(
                  children: _types.map((type) {
                    return Container(
                      width: double.infinity,
                      // Full width of screen
                      margin: EdgeInsets.symmetric(vertical: 8),
                      // Vertical margin between cards
                      child: Card(
                        elevation: 4,
                        child: Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: Column(
                            children: [
                              _buildImageDisplay(type['img']),
                              // Display backend image
                              SizedBox(height: 8),
                              Text(
                                type['name'] ?? 'Unknown Type',
                                textAlign: TextAlign.center,
                                style: TextStyle(fontWeight: FontWeight.bold),
                              ),
                              SizedBox(height: 8),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  IconButton(
                                    icon: Icon(Icons.edit),
                                    onPressed: () {
                                      // Handle edit
                                      _updateType(type['id']);
                                    },
                                  ),
                                  IconButton(
                                    icon: Icon(Icons.delete),
                                    onPressed: () {
                                      // Handle delete
                                      _deleteType(type['id']);
                                    },
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
              ),
            ),
          ],
        ),
      ),
    );
  }
}
