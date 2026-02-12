import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';
import '../providers/split_provider.dart';

class NewSplitScreen extends StatelessWidget {
  const NewSplitScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<SplitProvider>(context);

    // Show loading overlay if processing
    return Stack(
      children: [
        Scaffold(
          appBar: AppBar(title: const Text('New Split')),
          body: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Spacer(),
                const Icon(Icons.camera_alt_outlined, size: 80, color: Colors.teal),
                const SizedBox(height: 32),
                const Text(
                  'Scan a receipt to get started',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                ),
                 const SizedBox(height: 12),
                Text(
                  'We use Gemini AI to extract items and prices automatically.',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 16, color: Colors.grey[600]),
                ),
                const Spacer(),
                
                // Camera Button
                ElevatedButton.icon(
                  onPressed: () => _handleImageSource(context, ImageSource.camera),
                  icon: const Icon(Icons.camera_alt),
                  label: const Text('Take Photo'),
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.all(16),
                    backgroundColor: Colors.teal,
                    foregroundColor: Colors.white,
                  ),
                ),
                const SizedBox(height: 16),
                
                // Gallery Button
                OutlinedButton.icon(
                  onPressed: () => _handleImageSource(context, ImageSource.gallery),
                  icon: const Icon(Icons.photo_library),
                  label: const Text('Choose from Gallery'),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.all(16),
                  ),
                ),
                
                const SizedBox(height: 24),
                TextButton(
                  onPressed: () => _handleDemo(context),
                  child: const Text('Try with Demo Receipt'),
                ),
                const SizedBox(height: 24),
              ],
            ),
          ),
        ),
        if (provider.isLoading)
          Container(
            color: Colors.black54,
            child: const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  CircularProgressIndicator(color: Colors.white),
                  SizedBox(height: 20),
                  Text(
                    'Analyzing receipt with Gemini...',
                    style: TextStyle(color: Colors.white, fontSize: 16),
                  ),
                ],
              ),
            ),
          ),
      ],
    );
  }

  Future<void> _handleImageSource(BuildContext context, ImageSource source) async {
    final provider = Provider.of<SplitProvider>(context, listen: false);
    final success = await provider.extractReceipt(source);
    
    if (success && context.mounted) {
       Navigator.pushReplacementNamed(context, '/review');
    } else if (provider.error != null && context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: ${provider.error}')),
      );
    }
  }

  Future<void> _handleDemo(BuildContext context) async {
     final provider = Provider.of<SplitProvider>(context, listen: false);
     
     // Load asset bytes
     try {
       final byteData = await rootBundle.load('assets/demo_receipt.jpg');
       final bytes = byteData.buffer.asUint8List();
       await provider.loadDemoReceipt(bytes);
       
       if (context.mounted) {
         if (provider.error != null) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('Error: ${provider.error}')),
            );
         } else {
            Navigator.pushReplacementNamed(context, '/review');
         }
       }
     } catch (e) {
       if (context.mounted) {
         ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Failed to load demo asset: $e')),
         );
       }
     }
  }
}
