import 'dart:convert';
import 'dart:typed_data';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:google_generative_ai/google_generative_ai.dart';
import '../models/receipt.dart';

class GeminiService {
  late final GenerativeModel _model;
  static const String _modelName = 'gemini-2.0-flash';

  GeminiService() {
    final apiKey = dotenv.env['GEMINI_API_KEY'];
    if (apiKey == null) {
      throw Exception('GEMINI_API_KEY not found in .env');
    }
    _model = GenerativeModel(
      model: _modelName,
      apiKey: apiKey,
      generationConfig: GenerationConfig(
        responseMimeType: 'application/json',
      ),
    );
  }

  Future<Receipt> extractReceipt(Uint8List imageBytes) async {
    final prompt = Content.multi([
      TextPart(_receiptPrompt),
      DataPart('image/jpeg', imageBytes),
    ]);

    try {
      final response = await _model.generateContent([prompt]);
      final text = response.text;
      
      if (text == null) {
        throw Exception('Empty response from Gemini');
      }

      final json = jsonDecode(text) as Map<String, dynamic>;
      
      // Basic validation
      if (!json.containsKey('items') || !json.containsKey('total')) {
         throw Exception('Invalid JSON structure: missing items or total');
      }

      return Receipt.fromJson(json);
    } catch (e) {
      throw Exception('Failed to process receipt: $e');
    }
  }

  static const String _receiptPrompt = '''
Extract data from this receipt image and return strict JSON.
Schema:
{
  "merchant": string,
  "date": string (ISO 8601 YYYY-MM-DD or null),
  "currency": string (e.g. "USD"),
  "items": [
    {"name": string, "qty": number, "unit_price": number, "total_price": number}
  ],
  "subtotal": number,
  "tax": number (null if missing),
  "tip": number (null if missing),
  "total": number
}
Ensure all numbers are floats. If quantity is missing, assume 1.
If an item name is truncated, try to reconstruct it.
''';
}
