# Flashcard Forge – Architecture

## System Overview

```
┌──────────────────────────────────────────────────────────┐
│                      BROWSER (Client)                     │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │              Next.js App (React + TS)                │  │
│  │                                                      │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │  │
│  │  │  Auth     │  │ Dashboard│  │   Study Mode      │   │  │
│  │  │  Pages    │  │  + Deck  │  │   (FlashCards)    │   │  │
│  │  │          │  │  Detail  │  │                    │   │  │
│  │  └────┬─────┘  └────┬─────┘  └────────┬───────────┘   │  │
│  │       │              │                 │               │  │
│  │       ▼              ▼                 ▼               │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │            Firebase Client SDK                   │  │  │
│  │  │     (Auth  +  Firestore read/write)              │  │  │
│  │  └────────────────────┬─────────────────────────────┘  │  │
│  └───────────────────────┼────────────────────────────────┘  │
│                          │                                    │
│  ┌───────────────────────┼────────────────────────────────┐  │
│  │  Next.js API Route    │                                │  │
│  │  /api/generate-       │                                │  │
│  │   flashcards          │  ← GEMINI_API_KEY (server env) │  │
│  └───────────┬───────────┘                                │  │
└──────────────┼────────────────────────────────────────────┘
               │
    ┌──────────▼──────────┐    ┌────────────────────────┐
    │  Google Gemini API   │    │   Firebase Services    │
    │  (gemini-2.0-flash)  │    │                        │
    │                      │    │  • Authentication      │
    │  Generates Q/A JSON  │    │  • Firestore (NoSQL)   │
    └──────────────────────┘    │  • Hosting             │
                                └────────────────────────┘
```

## Data Flow

1. **Sign Up / Login** → Firebase Auth (email/password)
2. **Create Deck** → Client sends form → Next.js API route → Gemini API → JSON response → saved to Firestore
3. **Study** → Client reads cards from Firestore → user answers → stats updated in Firestore
4. **Dashboard** → Reads all user decks + computes mastery from card-level stats

## Firestore Data Model

```
users/{uid}/
  └── decks/{deckId}/
  │     ├── title (string)
  │     ├── topic (string)
  │     ├── difficulty (string)
  │     ├── examType (string | null)
  │     ├── cardCount (number)
  │     ├── createdAt (timestamp)
  │     ├── updatedAt (timestamp)
  │     └── lastStudiedAt (timestamp | null)
  │
  └── decks/{deckId}/cards/{cardId}/
        ├── question (string)
        ├── answer (string)
        ├── hint (string)
        ├── seenCount (number)
        ├── correctCount (number)
        ├── lastSeenAt (timestamp | null)
        └── createdAt (timestamp)
```

## Security Model

- **Firestore Rules**: Each user can only read/write documents under their own `users/{uid}/` path
- **Gemini API Key**: Stored as server-side env variable, never exposed to the client
- **Firebase Client Keys**: Safe to expose (restricted by Firebase project security rules)
