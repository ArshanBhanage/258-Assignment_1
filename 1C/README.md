# 🧾 Receipt2Split

A smart cross-platform mobile app built with **Flutter** and **Google Gemini** that makes splitting bills effortless. Snap a photo of your receipt, and let AI extract the items for you.

## Features

- 📸 **AI Receipt Scanning** – Uses Google Gemini to extract merchant, items, and prices from photos.
- 👥 **Easy Splitting** – Add friends and assign items with a simple tap.
- ➗ **Smart Math** – Automatically calculates tax and tip based on each person's share.
- 💾 **History** – Saves all your past splits locally.
- 🎨 **Modern UI** – Clean, polished interface with dark mode support (coming soon).

## Project Structure

This repo contains two projects (from Assignment 1B):

- `app/` – **Receipt2Split (Flutter App)** source code.
- `docs/` – Documentation artifacts.

## Getting Started

### Prerequisites
- [Flutter SDK](https://flutter.dev/docs/get-started/install) installed
- A [Google AI Studio API Key](https://aistudio.google.com/app/apikey)

### Installation

1. Navigate to the app directory:
   ```bash
   cd app
   ```

2. Install dependencies:
   ```bash
   flutter pub get
   ```

3. Configure Environment:
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Open `.env` and paste your Gemini API key:
     ```env
     GEMINI_API_KEY=your_api_key_here
     ```

4. Run the app:
   ```bash
   flutter run
   ```

## Documentation

- [Architecture Overview](docs/architecture.md)
- [Gemini Prompt Strategy](docs/prompt.md)

- [📹 Video Walkthrough](https://youtu.be/UHNFCb3G4_U)

## Tech Stack

- **Framework**: Flutter
- **AI Model**: Google Gemini 1.5 Flash (via `google_generative_ai`)
- **State Management**: Provider
- **Local Storage**: Hive
- **Image Handling**: `image_picker` + `flutter_image_compress`

## Troubleshooting

- **"Gemini API Key not found"**: Ensure your `.env` file exists in `app/.env` and you have added `.env` to the `assets` section of `pubspec.yaml` (already done).
- **"Analysis options" warning**: Run `dart fix --apply`.

---
*Created for CMPE 258 Assignment 1B*
