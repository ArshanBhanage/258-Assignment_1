'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-2xl text-center">
          <div className="mb-6">
            <span className="text-6xl">⚡</span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Flashcard Forge
            </span>
          </h1>
          <p className="text-lg text-gray-400 mb-10 max-w-lg mx-auto leading-relaxed">
            Generate AI-powered flashcard decks from any topic. Study smarter,
            track your mastery, and ace your exams.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="px-8 py-3.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-medium transition-all hover:scale-105 active:scale-95 text-center"
            >
              Get Started Free
            </Link>
            <Link
              href="/login"
              className="px-8 py-3.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl font-medium transition-all hover:scale-105 active:scale-95 border border-gray-700 text-center"
            >
              Sign In
            </Link>
          </div>

          {/* Feature highlights */}
          <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
              <div className="text-2xl mb-3">🤖</div>
              <h3 className="text-white font-semibold mb-1">AI-Generated</h3>
              <p className="text-sm text-gray-500">
                Powered by Google Gemini to create high-quality Q&A pairs instantly.
              </p>
            </div>
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
              <div className="text-2xl mb-3">📊</div>
              <h3 className="text-white font-semibold mb-1">Track Mastery</h3>
              <p className="text-sm text-gray-500">
                See your progress per card and per deck with detailed stats.
              </p>
            </div>
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
              <div className="text-2xl mb-3">🎯</div>
              <h3 className="text-white font-semibold mb-1">Custom Decks</h3>
              <p className="text-sm text-gray-500">
                Choose topic, difficulty, and exam type for tailored flashcards.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="text-center py-6 text-xs text-gray-600">
        Built with Next.js, Firebase & Google Gemini
      </footer>
    </div>
  );
}
