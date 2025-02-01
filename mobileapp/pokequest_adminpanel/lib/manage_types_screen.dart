import 'dart:io';
import 'package:flutter/material.dart';
import 'package:pokequest_adminpanel/services/api_service.dart';
import 'package:image_picker/image_picker.dart'; // For image picking

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

  // Controllers for type name
  final TextEditingController _nameController = TextEditingController();

  // Variable to hold picked image
  XFile? _image;

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
      final types = await _apiService.getAllTypes(widget.token); // Fetch all types using the token
      setState(() {
        _types = types;
      });
    } catch (e) {
      print('Error fetching types: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to load types')),
      );
    }

    setState(() {
      _isLoading = false;
    });
  }

  // Normalize image paths to use forward slashes, but do not change .jfif to .jpg
  String _normalizePath(String path) {
    // Replace backslashes with forward slashes
    path = path.replaceAll("\\", "/");
    return path;
  }


  // Pick an image for the type
  Future<void> _pickImage() async {
    final pickedFile = await _picker.pickImage(source: ImageSource.gallery);
    if (pickedFile != null) {
      final fileExtension = pickedFile.path.split('.').last.toLowerCase();
      // Check if the image extension is valid (JPG or PNG)
      if (fileExtension == 'jpg' || fileExtension == 'jpeg' || fileExtension == 'png') {
        setState(() {
          _image = pickedFile;
        });
      } else {
        // Show error message if the file is not JPG or PNG
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Only JPG, JPEG, and PNG images are allowed')),
        );
      }
    }
  }

  // Create a new type
  Future<void> _createType() async {
    if (_nameController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Name is required')));
      return;
    }

    if (_image == null) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Image is required')));
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      bool success = await _apiService.createType(
        widget.token,
        {'name': _nameController.text},
        imgPath: _image!.path, // Pass the image path if selected
      );

      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Type created successfully')));
        _fetchTypes(); // Refresh the list
        _nameController.clear();
        setState(() {
          _image = null;
        });
      } else {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to create type')));
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
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

    bool success = await _apiService.deleteType(widget.token, typeId); // Use token here for deletion
    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Type deleted successfully')));
      _fetchTypes(); // Refresh the list
    } else {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to delete type')));
    }

    setState(() {
      _isLoading = false;
    });
  }

  // Update an existing type
  Future<void> _updateType(int typeId) async {
    if (_nameController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Name is required')));
      return;
    }

    if (_image == null) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Image is required')));
      return;
    }

    setState(() {
      _isLoading = true;
    });

    bool success = await _apiService.updateType(
      widget.token, // Use the token here
      typeId,
      {'name': _nameController.text},
      imgPath: _image!.path, // Pass image path if selected
    );

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Type updated successfully')));
      _fetchTypes(); // Refresh the list
      _nameController.clear();
      setState(() {
        _image = null;
      });
    } else {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to update type')));
    }

    setState(() {
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Manage Types')),
      body: _isLoading
          ? Center(child: CircularProgressIndicator())
          : Column(
              children: [
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: TextField(
                    controller: _nameController,
                    decoration: InputDecoration(labelText: 'Type Name'),
                  ),
                ),
                ElevatedButton(
                  onPressed: _pickImage,
                  child: Text('Pick Image'),
                ),
                _image != null
                    ? Image.file(
                        File(_image!.path),
                        height: 100,
                        width: 100,
                        fit: BoxFit.cover,
                      )
                    : Container(),
                ElevatedButton(
                  onPressed: _createType,
                  child: Text('Create Type'),
                ),
                Expanded(
                  child: ListView.builder(
                    itemCount: _types.length,
                    itemBuilder: (context, index) {
                      var type = _types[index];
                      String imagePath = _normalizePath(type['img'] ?? '');  // Normalize path and replace .jfif with .jpg
                      return ListTile(
                        title: Text(type['name'] ?? 'Unknown Type'),
                        subtitle: imagePath.isNotEmpty
                            ? Image.network(imagePath)
                            : null,
                        trailing: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            IconButton(
                              icon: Icon(Icons.edit),
                              onPressed: () {
                                _nameController.text = type['name'] ?? '';
                                setState(() {
                                  _image = null;
                                });
                                // You can open a dialog or just directly update the type
                                _updateType(type['id']);
                              },
                            ),
                            IconButton(
                              icon: Icon(Icons.delete),
                              onPressed: () {
                                _deleteType(type['id']);
                              },
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
    );
  }
}
