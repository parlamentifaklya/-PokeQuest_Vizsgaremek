import 'dart:io';
import 'package:flutter/material.dart';
import 'package:http_parser/http_parser.dart';
import 'package:image_picker/image_picker.dart';
import 'package:http/http.dart' as http;
import 'package:pokequest_adminpanel/services/api_service.dart';
import 'package:mime/mime.dart';

class ManageItemsScreen extends StatefulWidget {
  final String token; // Token received from AdminPanelScreen

  const ManageItemsScreen({super.key, required this.token});

  @override
  _ManageItemsScreenState createState() => _ManageItemsScreenState();
}

class _ManageItemsScreenState extends State<ManageItemsScreen> {
  bool _isLoading = false;
  List<dynamic> _items = [];
  final ApiService _apiService = ApiService();
  final _picker = ImagePicker();

  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _descriptionController = TextEditingController();
  final TextEditingController _itemAbilityController = TextEditingController();
  final TextEditingController _rarityController = TextEditingController();
  XFile? _image; // Use XFile to handle image from ImagePicker

  @override
  void initState() {
    super.initState();
    _fetchItems();
  }

  // Fetch all items from API
  Future<void> _fetchItems() async {
    setState(() {
      _isLoading = true;
    });

    try {
      print("Fetching items from API...");
      final items = await _apiService.getAllItems(widget.token);
      setState(() {
        _items = items;
      });
      print("Items fetched successfully: ${_items.length} items.");
    } catch (e) {
      print('Error fetching items: $e');
      ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load items')));
    }

    setState(() {
      _isLoading = false;
    });
  }

  // Pick an image for the item (Mobile support)
  Future<void> _pickImage() async {
    print("Picking image from gallery...");
    final pickedFile = await _picker.pickImage(source: ImageSource.gallery);
    if (pickedFile != null) {
      setState(() {
        _image = pickedFile;
      });
      print("Image picked successfully: ${_image!.path}");
    } else {
      print("No image selected.");
    }
  }

  // Create a new item
  Future<void> _createItem() async {
    if (_nameController.text.isEmpty ||
        _descriptionController.text.isEmpty ||
        _itemAbilityController.text.isEmpty ||
        _rarityController.text.isEmpty) {
      print("Validation failed: All fields are required.");
      ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('All fields are required')));
      return;
    }

    if (_image == null) {
      print("Validation failed: Image is required.");
      ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Image is required')));
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      var uri = Uri.parse(
          "http://10.0.2.2:5130/api/Item/CreateItem"); // Emulator special URL
      print('Sending request to: $uri');
      var request = http.MultipartRequest('POST', uri);
      request.headers['Authorization'] = 'Bearer ${widget.token}';

      // Add the item parameters
      request.fields['name'] = _nameController.text;
      request.fields['description'] = _descriptionController.text;
      request.fields['itemAbility'] = _itemAbilityController.text;
      request.fields['rarity'] = _rarityController.text; // Send as integer in text form

      // Use XFile from image_picker (Mobile support)
      if (_image != null) {
        var mimeType = lookupMimeType(_image!.path)!;
        var multipartFile = await http.MultipartFile.fromPath(
          'file',
          _image!.path,
          contentType: MediaType.parse(mimeType),
        );
        request.files.add(multipartFile);
        print("Added image file to request: ${_image!.path}");
      }

      var response = await request.send();
      print("Response received with status code: ${response.statusCode}");

      if (response.statusCode == 201) {
        ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Item created successfully')));
        _fetchItems(); // Refresh the list
        _nameController.clear();
        _descriptionController.clear();
        _itemAbilityController.clear();
        _rarityController.clear();
        setState(() {
          _image = null;
        });
      } else {
        print('Failed to create item: ${response.statusCode}');
        ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Failed to create item')));
      }
    } catch (e) {
      print('Error: $e');
      ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')));
    }

    setState(() {
      _isLoading = false;
    });
  }

  // Update an existing item via dialog
  Future<void> _updateItem(int itemId) async {
    print("Updating item with ID: $itemId");

    var item = _items.firstWhere((item) => item['id'] == itemId);

    _nameController.text = item['name'] ?? 'Unknown Item';
    _descriptionController.text = item['description'] ?? 'No Description';
    _itemAbilityController.text = item['itemAbility'] ?? 'No Ability';
    _rarityController.text = item['rarity'].toString(); // Set the stored rarity as a string

    // Show dialog with current item data prefilled
    await showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: Text('Update Item'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: _nameController,
                  decoration: InputDecoration(labelText: 'Item Name'),
                ),
                TextField(
                  controller: _descriptionController,
                  decoration: InputDecoration(labelText: 'Description'),
                ),
                TextField(
                  controller: _itemAbilityController,
                  decoration: InputDecoration(labelText: 'Item Ability'),
                ),
                DropdownButtonFormField<int>(
                  value: int.tryParse(_rarityController.text),
                  onChanged: (int? newValue) {
                    setState(() {
                      _rarityController.text = newValue.toString();
                    });
                  },
                  items: List.generate(5, (index) {
                    return DropdownMenuItem<int>(
                      value: index,
                      child: Text(['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'][index]),
                    );
                  }),
                  decoration: InputDecoration(labelText: 'Rarity'),
                ),
                SizedBox(height: 8),
                ElevatedButton.icon(
                  onPressed: _pickImage,
                  icon: Icon(Icons.image),
                  label: Text('Pick Image'),
                ),
                SizedBox(height: 8),
                _buildImageDisplay(item['img']), // Display current image
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () async {
                if (_nameController.text.isEmpty ||
                    _descriptionController.text.isEmpty ||
                    _itemAbilityController.text.isEmpty ||
                    _rarityController.text.isEmpty) {
                  print("Validation failed: All fields are required.");
                  ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('All fields are required')));
                  return;
                }

                setState(() {
                  _isLoading = true;
                });

                var uri = Uri.parse(
                    "http://10.0.2.2:5130/api/Item/UpdateItem/$itemId");
                print('Sending update request to: $uri');
                var request = http.MultipartRequest('PUT', uri);
                request.headers['Authorization'] = 'Bearer ${widget.token}';
                request.fields['name'] = _nameController.text;
                request.fields['description'] = _descriptionController.text;
                request.fields['itemAbility'] = _itemAbilityController.text;
                request.fields['rarity'] = _rarityController.text;

                if (_image != null) {
                  var mimeType = lookupMimeType(_image!.path)!;
                  var multipartFile = await http.MultipartFile.fromPath(
                    'file',
                    _image!.path,
                    contentType: MediaType.parse(mimeType),
                  );
                  request.files.add(multipartFile);
                  print("Added new image file to update request: ${_image!.path}");
                }

                var response = await request.send();
                print("Response received with status code: ${response.statusCode}");

                if (response.statusCode == 200) {
                  ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Item updated successfully')));
                  _fetchItems(); // Refresh the list
                  Navigator.pop(context); // Close dialog
                } else {
                  print('Failed to update item: ${response.statusCode}');
                  ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Failed to update item')));
                }

                setState(() {
                  _isLoading = false;
                });
              },
              child: Text('Update'),
            ),
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: Text('Cancel'),
            ),
          ],
        );
      },
    );
  }

  // Delete an item
  Future<void> _deleteItem(int itemId) async {
    setState(() {
      _isLoading = true;
    });

    print("Deleting item with ID: $itemId");
    bool success = await _apiService.deleteItem(widget.token, itemId);
    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Item deleted successfully')));
      _fetchItems(); // Refresh the list
    } else {
      print('Failed to delete item');
      ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to delete item')));
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
      String baseUrl = 'http://10.0.2.2:5130/api';
      String fullUrl = '$baseUrl/$imageUrl';
      return Image.network(fullUrl); // Display image from backend
    } else {
      return Placeholder(fallbackHeight: 150, fallbackWidth: 150);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Manage Items')),
      body: _isLoading
          ? Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Manage Items',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            SizedBox(height: 16),
            Column(
              children: _items.map((item) {
                return Container(
                  width: double.infinity,
                  margin: EdgeInsets.symmetric(vertical: 8),
                  child: Card(
                    elevation: 4,
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        children: [
                          _buildImageDisplay(item['img']),
                          SizedBox(height: 8),
                          Text(
                            item['name'] ?? 'Unknown Item',
                            textAlign: TextAlign.center,
                            style: TextStyle(fontWeight: FontWeight.bold),
                          ),
                          Text('Item Ability: ${item['itemAbility'] ?? 'N/A'}'),
                          Text('Rarity: ${item['rarity'] ?? 'Unknown'}'),
                          SizedBox(height: 8),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              IconButton(
                                icon: Icon(Icons.edit),
                                onPressed: () {
                                  _updateItem(item['id']);
                                },
                              ),
                              IconButton(
                                icon: Icon(Icons.delete),
                                onPressed: () {
                                  _deleteItem(item['id']);
                                },
                              ),
                            ],
                          )
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
    );
  }
}
