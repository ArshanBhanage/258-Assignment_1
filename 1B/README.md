# ⚡ Flashcard Forge

AI-powered flashcard study app built with **Next.js**, **Firebase**, and **Google Gemini**.

Generate flashcard decks from any topic, study them interactively, and track your mastery over time.

<!-- ![Dashboard Screenshot](docs/screenshots/dashboard.png) -->
<!-- ![Study Mode Screenshot](docs/screenshots/study.png) -->

---

## Features

- 🔐 **Authentication** – Email/password sign up & login via Firebase Auth
- 🤖 **AI Generation** – Google Gemini creates flashcards from any topic
- 📖 **Study Mode** – Flip cards, mark "I Knew It" / "I Missed It"
- 📊 **Mastery Tracking** – Per-card and per-deck progress stats
- 🎯 **Custom Decks** – Choose difficulty, card count, and exam type
- 🔄 **Regenerate** – Get fresh cards for any deck with one click

---

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | Next.js (TypeScript) + Tailwind CSS |
| Auth       | Firebase Authentication             |
| Database   | Cloud Firestore                     |
| AI         | Google Gemini (gemini-2.0-flash)    |
| Hosting    | Firebase Hosting                    |

---

## Project Structure

```
├── web/                    # Next.js application
│   ├── src/
│   │   ├── app/            # Pages & API routes
│   │   │   ├── api/generate-flashcards/  # Gemini API (server-side)
│   │   │   ├── dashboard/  # Deck list & stats
│   │   │   ├── create/     # Create new deck form
│   │   │   ├── deck/[deckId]/           # Deck detail
│   │   │   └── deck/[deckId]/study/     # Study mode
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # Auth context
│   │   └── lib/            # Firebase config, Firestore service, types
│   ├── .env.example        # Environment variable template
│   └── package.json
├── firebase/               # Firebase configuration
│   ├── firebase.json       # Hosting & Firestore config
│   ├── firestore.rules     # Security rules
│   └── firestore.indexes.json
├── docs/
│   ├── architecture.md     # System architecture + ASCII diagram
│   ├── prompt.md           # Gemini prompt & schema documentation
│   └── demo_script.md      # Video walkthrough script
└── README.md               # This file
```

---

## Local Setup

### Prerequisites

- Node.js 18+ and npm
- A [Firebase project](https://console.firebase.google.com/)
- A [Google AI Studio / Gemini API key](https://aistudio.google.com/app/apikey)

### 1. Clone the repo

```bash
git clone https://github.com/<your-username>/258-Assignment_1B.git
cd 258-Assignment_1B
```

### 2. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/) and create a new project (or use existing)
2. **Enable Authentication**:
   - Go to Authentication → Sign-in method → Enable **Email/Password**
3. **Create Firestore Database**:
   - Go to Firestore Database → Create database → Start in **test mode** (we'll apply rules later)
4. **Get Firebase config**:
   - Go to Project Settings → General → Your apps → Add a **Web app**
   - Copy the config values

### 3. Get Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create an API key
3. Keep this key secret – it goes in `.env.local` only

### 4. Configure environment

```bash
cd web
cp .env.example .env.local
```

Edit `web/.env.local` and fill in your values:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef

GEMINI_API_KEY=your-gemini-api-key
```

### 5. Install & Run

```bash
cd web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deploy to Firebase Hosting

### Option A: Deploy as static site (simple)

```bash
# Build the Next.js app as static export
cd web
npm run build

# Install Firebase CLI (if not already)
npm install -g firebase-tools

# Login and deploy
cd ../firebase
firebase login
firebase init    # Select Hosting, link to your project
firebase deploy
```

### Option B: Deploy with Firebase App Hosting (recommended for API routes)

Since this app uses Next.js API routes (for Gemini), the recommended approach is:

1. **Use [Firebase App Hosting](https://firebase.google.com/docs/app-hosting)** which natively supports Next.js with server-side features
2. Connect your GitHub repo to Firebase App Hosting in the Firebase Console
3. Set environment variables in the Firebase Console:
   - `GEMINI_API_KEY` → your Gemini key (set as secret)
4. Deploy automatically on push

```bash
firebase apphosting:backends:create
```

> **Note**: For the API route (`/api/generate-flashcards`) to work in production, you need server-side rendering support. Firebase App Hosting provides this natively. Alternatively, you can move the Gemini call to a Firebase Cloud Function.

### Deploy Firestore Rules

```bash
cd firebase
firebase deploy --only firestore:rules
```

---

## Setting GEMINI_API_KEY Securely

⚠️ **Never commit your API key to Git.**

- **Local development**: Store in `web/.env.local` (already in `.gitignore`)
- **Firebase App Hosting**: Set via Firebase Console → App Hosting → Secrets
- **Vercel/other**: Set in the hosting platform's environment variable settings

The key is only used server-side in `/api/generate-flashcards` – it's never sent to the browser.

---

## Troubleshooting

### "Gemini API key is not configured on the server"
→ Make sure `GEMINI_API_KEY` is set in `web/.env.local`. Restart `npm run dev` after changes.

### "Permission denied" on Firestore
→ Check that Firestore security rules are deployed. During development, you can use test mode.

### "Invalid email or password" on login
→ The user must sign up first. Firebase Auth doesn't auto-create accounts.

### Build errors with `@google/genai`
→ Run `npm install` again. Make sure you're using Node.js 18+.

### Cards don't appear after generating
→ Check browser console for Firestore errors. Ensure your Firebase project ID matches your `.env.local`.

### "Too many requests" error
→ Gemini and Firebase have rate limits. Wait a moment and try again.

---

## Video Walkthrough

<!-- Replace with your actual video link -->
📹 [Watch the demo walkthrough](https://youtu.be/cYei9G2ame0)



---

## License

This project was created for CMPE 258 Assignment 1B.
