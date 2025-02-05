import 'dart:async';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:http_parser/http_parser.dart';
import 'package:image_picker/image_picker.dart'; // For image picking
import 'package:http/http.dart' as http;
import 'package:mime/mime.dart'; // To determine MIME type of image
import 'package:pokequest_adminpanel/services/api_service.dart';
import 'dart:html' as html; // For blob conversion in Flutter web

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
      final types = await _apiService.getAllTypes(widget.token);
      setState(() {
        _types = types;
      });
    } catch (e) {
      print('Error fetching types: $e');
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text('Failed to load types')));
    }

    setState(() {
      _isLoading = false;
    });
  }

  // Normalize image paths to use forward slashes, and ensure a valid URL format
  String _normalizePath(String path) {
    Uri? uri = Uri.tryParse(path);
    if (uri == null) {
      print('Invalid URL: $path');
      return ''; // Return an empty string if the URL is invalid
    }
    return uri.isAbsolute ? uri.toString() : 'http://localhost:5130/api/$path';
  }

  // Pick an image for the type
  Future<void> _pickImage() async {
    final pickedFile = await _picker.pickImage(source: ImageSource.gallery);
    if (pickedFile != null) {
      setState(() {
        _image = pickedFile;
      });
    }
  }

  // Convert Blob URL to a MultipartFile (for Flutter Web)
  Future<http.MultipartFile?> convertBlobUrlToMultipartFile(String blobUrl) async {
    try {
      final response = await html.window.fetch(blobUrl);
      final blob = await response.blob();
      final reader = html.FileReader();
      final completer = Completer<http.MultipartFile?>();

      reader.onLoadEnd.listen((event) async {
        final file = html.Blob([reader.result]);
        final url = html.Url.createObjectUrlFromBlob(file);
        final byteArray = await _fetchFileBytes(url);
        final mimeType = lookupMimeType(url)!;

        completer.complete(http.MultipartFile.fromBytes('img', byteArray,
            contentType: MediaType.parse(mimeType)));
      });

      reader.readAsArrayBuffer(blob);
      return completer.future;
    } catch (e) {
      print("Error converting Blob URL to MultipartFile: $e");
      return null;
    }
  }

  // Helper function to fetch byte array from a Blob URL
  Future<List<int>> _fetchFileBytes(String url) async {
    final response = await http.get(Uri.parse(url));
    return response.bodyBytes;
  }

  // Create a new type
  Future<void> _createType() async {
    if (_nameController.text.isEmpty) {
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text('Name is required')));
      return;
    }

    if (_image == null) {
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text('Image is required')));
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      var uri = Uri.parse("http://localhost:5130/api/Type/CreateType");
      var request = http.MultipartRequest('POST', uri);
      request.headers['Authorization'] = 'Bearer ${widget.token}';

      // Add the name parameter
      request.fields['name'] = _nameController.text;

      // Check if the image is a blob URL or a file path
      if (_image!.path.startsWith('blob:')) {
        // Convert Blob URL to MultipartFile
        var multipartFile = await convertBlobUrlToMultipartFile(_image!.path);
        if (multipartFile == null) {
          ScaffoldMessenger.of(context)
              .showSnackBar(SnackBar(content: Text('Failed to convert Blob URL')));
          return;
        }

        // Add the MultipartFile to the request
        request.files.add(multipartFile);
      } else {
        // Regular file-based upload for mobile (no need to convert)
        var imageFile = File(_image!.path);
        var mimeType = lookupMimeType(_image!.path)!;
        var multipartFile = await http.MultipartFile.fromPath('img', _image!.path,
            contentType: MediaType.parse(mimeType));
        request.files.add(multipartFile);
      }

      var response = await request.send();
      if (response.statusCode == 200) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text('Type created successfully')));
        _fetchTypes(); // Refresh the list
        _nameController.clear();
        setState(() {
          _image = null;
        });
      } else {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text('Failed to create type')));
      }
    } catch (e) {
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text('Error: $e')));
    }

    setState(() {
      _isLoading = false;
    });
  }

  // Update an existing type
  Future<void> _updateType(int typeId) async {
    if (_nameController.text.isEmpty) {
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text('Name is required')));
      return;
    }

    if (_image == null) {
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text('Image is required')));
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      var uri = Uri.parse("http://localhost:5130/api/Type/UpdateType/$typeId");
      var request = http.MultipartRequest('POST', uri);
      request.headers['Authorization'] = 'Bearer ${widget.token}';

      // Add the name parameter
      request.fields['name'] = _nameController.text;

      // Check if the image is a blob URL or a file path
      if (_image!.path.startsWith('blob:')) {
        // Convert Blob URL to MultipartFile
        var multipartFile = await convertBlobUrlToMultipartFile(_image!.path);
        if (multipartFile == null) {
          ScaffoldMessenger.of(context)
              .showSnackBar(SnackBar(content: Text('Failed to convert Blob URL')));
          return;
        }

        // Add the MultipartFile to the request
        request.files.add(multipartFile);
      } else {
        // Regular file-based upload for mobile (no need to convert)
        var imageFile = File(_image!.path);
        var mimeType = lookupMimeType(_image!.path)!;
        var multipartFile = await http.MultipartFile.fromPath('img', _image!.path,
            contentType: MediaType.parse(mimeType));
        request.files.add(multipartFile);
      }

      var response = await request.send();
      if (response.statusCode == 200) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text('Type updated successfully')));
        _fetchTypes(); // Refresh the list
        _nameController.clear();
        setState(() {
          _image = null;
        });
      } else {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text('Failed to update type')));
      }
    } catch (e) {
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text('Error: $e')));
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
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text('Type deleted successfully')));
      _fetchTypes(); // Refresh the list
    } else {
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text('Failed to delete type')));
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
          : Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Manage Types',
                    style: Theme.of(context).textTheme.headlineSmall,
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
                  if (_image != null)
                    Container(
                      width: 100,
                      height: 100,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(8),
                        image: DecorationImage(
                          image: FileImage(File(_image!.path)),
                          fit: BoxFit.cover,
                        ),
                      ),
                    ),
                  SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: _createType,
                    child: Text('Create Type'),
                    style: ElevatedButton.styleFrom(
                      padding: EdgeInsets.symmetric(vertical: 12),
                    ),
                  ),
                  SizedBox(height: 16),
                  // Display types in a single row (one column)
                  Expanded(
                    child: SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: Row(
                        children: _types.map((type) {
                          String imagePath = _normalizePath(type['img'] ?? '');
                          return Container(
                            width: 200, // Width for each card
                            margin: EdgeInsets.symmetric(horizontal: 8),
                            child: Card(
                              elevation: 4,
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  imagePath.isNotEmpty
                                      ? Image.network(
                                          imagePath,
                                          width: 150, // Larger image
                                          height: 150,
                                          fit: BoxFit.cover,
                                        )
                                      : Container(),
                                  Padding(
                                    padding: const EdgeInsets.all(8.0),
                                    child: Text(
                                      type['name'] ?? 'Unknown Type',
                                      textAlign: TextAlign.center,
                                      style: TextStyle(
                                          fontWeight: FontWeight.bold),
                                    ),
                                  ),
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
