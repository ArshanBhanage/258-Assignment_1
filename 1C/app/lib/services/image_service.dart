import 'dart:typed_data';
import 'package:image_picker/image_picker.dart';
import 'package:flutter_image_compress/flutter_image_compress.dart';

class ImageService {
  final ImagePicker _picker = ImagePicker();

  Future<Uint8List?> pickImage(ImageSource source) async {
    final XFile? image = await _picker.pickImage(source: source);
    if (image == null) return null;

    final bytes = await image.readAsBytes();
    return _compressImage(bytes);
  }

  Future<Uint8List> _compressImage(Uint8List list) async {
    var result = await FlutterImageCompress.compressWithList(
      list,
      minHeight: 1024,
      minWidth: 1024,
      quality: 80,
    );
    return result;
  }
}
