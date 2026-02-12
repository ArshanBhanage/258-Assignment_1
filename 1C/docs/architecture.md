# Receipt2Split Architecture

## Overview

The app follows a **Layered Architecture** with **Provider** for state management.

```mermaid
graph TD
    UI[UI Layer (Screens)] -->|Reads/Writes| State[State Layer (Provider)]
    State -->|Calls| Service[Service Layer]
    State -->|Persists| Storage[Storage Layer (Hive)]
    
    subgraph Services
    Gemini[GeminiService]
    Image[ImageService]
    end
    
    Service -->|API| Gemini
    Service -->|Native| Image
```

## Layers

### 1. UI Layer (`lib/screens`, `lib/widgets`)
- Pure presentation logic.
- Listens to `SplitProvider` for state changes.
- **Key Screens**: `HomeScreen`, `NewSplitScreen`, `ReviewScreen`, `AssignScreen`.

### 2. State Layer (`lib/providers`)
- `SplitProvider`: The "Brain" of the app.
- Manages the `SplitSession` state.
- Handles business logic for:
  - Validating receipt data
  - Adding/removing participants
  - Toggling item assignments
  - Calculating final totals (subtotal + proportional tax/tip)

### 3. Service Layer (`lib/services`)
- `GeminiService`: Handles communication with Google AI.
  - Sends compressed image bytes.
  - Prompts model for strict JSON extraction.
  - Parses response into `Receipt` model.
- `ImageService`: Wraps `image_picker` and `flutter_image_compress`.
  - Compresses images to ~1024px to reduce token usage and latency.

### 4. Data Layer (`lib/models`, Hive)
- **Models**: `Receipt`, `ReceiptItem`, `Participant`, `SplitSession`.
- **Storage**: Uses **Hive** for fast, offline key-value storage.
  - Adapters generated via `build_runner`.

## Data Flow

1. **Capture**: User takes photo → `ImageService` compresses it.
2. **Extract**: `SplitProvider` sends bytes to `GeminiService` → returns `Receipt` object.
3. **Session**: A new `SplitSession` is created with the `Receipt`.
4. **Interaction**: User modifies `SplitSession` (adding people, assigning items).
5. **Calculation**: On demand, `SplitProvider.calculateTotals()` aggregates costs.
6. **Save**: Session is serialized and saved to Hive box.
