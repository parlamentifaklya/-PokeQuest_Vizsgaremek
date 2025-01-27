import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class AdminPanelScreen extends StatefulWidget {
  final String token; // Token passed from the login screen

  AdminPanelScreen({required this.token}); // Receiving the token

  @override
  _AdminPanelScreenState createState() => _AdminPanelScreenState();
}

class _AdminPanelScreenState extends State<AdminPanelScreen> {
  bool _isLoading = false;
  List<dynamic> _data = [];

  @override
  void initState() {
    super.initState();
    _fetchProtectedData(); // Fetch protected data after initialization
  }

  Future<void> _fetchProtectedData() async {
    setState(() {
      _isLoading = true;
    });

    // API call using the token for authentication
    final response = await http.get(
      Uri.parse('https://yourapi.com/api/protected-endpoint'),
      headers: {
        'Authorization': 'Bearer ${widget.token}', // Sending token in header
      },
    );

    if (response.statusCode == 200) {
      setState(() {
        _data = json.decode(response.body);
      });
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to load data')),
      );
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
                return ListTile(
                  title: Text(_data[index]['name']),
                  // Replace 'name' with the field from your API
                );
              },
            ),
    );
  }
}
