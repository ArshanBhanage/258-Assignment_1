'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { createDeck } from '@/lib/firestore';
import { GeneratedDeck } from '@/lib/types';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import toast from 'react-hot-toast';

export default function CreatePage() {
    return (
        <ProtectedRoute>
            <CreateContent />
        </ProtectedRoute>
    );
}

function CreateContent() {
    const { user } = useAuth();
    const router = useRouter();
    const [topic, setTopic] = useState('');
    const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
    const [numCards, setNumCards] = useState(10);
    const [examType, setExamType] = useState('');
    const [generating, setGenerating] = useState(false);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!topic.trim()) {
            toast.error('Please enter a topic');
            return;
        }
        if (!user) return;

        setGenerating(true);
        try {
            const res = await fetch('/api/generate-flashcards', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic: topic.trim(),
                    difficulty,
                    numCards,
                    examType: examType || null,
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Failed to generate flashcards');
            }

            const data: GeneratedDeck = await res.json();

            const deckId = await createDeck(
                user.uid,
                {
                    title: data.title,
                    topic: topic.trim(),
                    difficulty,
                    examType: examType || null,
                    cardCount: data.cards.length,
                },
                data.cards
            );

            toast.success(`Created "${data.title}" with ${data.cards.length} cards!`);
            router.push(`/deck/${deckId}`);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Something went wrong';
            toast.error(message);
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-950">
            <Navbar />
            <main className="max-w-lg mx-auto px-4 sm:px-6 py-8">
                <h1 className="text-2xl font-bold text-white mb-2">Create New Deck</h1>
                <p className="text-sm text-gray-500 mb-8">
                    Enter a topic and Gemini AI will generate flashcards for you.
                </p>

                <form onSubmit={handleGenerate} className="space-y-5">
                    <div>
                        <label htmlFor="topic" className="block text-sm font-medium text-gray-400 mb-1.5">
                            Topic <span className="text-red-400">*</span>
                        </label>
                        <input
                            id="topic"
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                            placeholder="e.g., React Hooks, Photosynthesis, SQL Joins"
                            disabled={generating}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1.5">
                            Difficulty <span className="text-red-400">*</span>
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {(['Beginner', 'Intermediate', 'Advanced'] as const).map((level) => (
                                <button
                                    key={level}
                                    type="button"
                                    onClick={() => setDifficulty(level)}
                                    disabled={generating}
                                    className={`py-2 px-3 rounded-lg text-sm font-medium border transition-all ${difficulty === level
                                        ? 'bg-violet-600/20 border-violet-500 text-violet-300'
                                        : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-600'
                                        }`}
                                >
                                    {level}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="numCards" className="block text-sm font-medium text-gray-400 mb-1.5">
                            Number of Cards: <span className="text-white font-semibold">{numCards}</span>
                        </label>
                        <input
                            id="numCards"
                            type="range"
                            min={5}
                            max={20}
                            value={numCards}
                            onChange={(e) => setNumCards(Number(e.target.value))}
                            className="w-full accent-violet-500"
                            disabled={generating}
                        />
                        <div className="flex justify-between text-xs text-gray-600 mt-1">
                            <span>5</span>
                            <span>20</span>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="examType" className="block text-sm font-medium text-gray-400 mb-1.5">
                            Exam Type <span className="text-gray-600">(optional)</span>
                        </label>
                        <select
                            id="examType"
                            value={examType}
                            onChange={(e) => setExamType(e.target.value)}
                            className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                            disabled={generating}
                        >
                            <option value="">None</option>
                            <option value="Interview">Interview</option>
                            <option value="School">School</option>
                            <option value="Certification">Certification</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={generating}
                        className="w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 disabled:from-violet-800 disabled:to-purple-800 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all relative"
                    >
                        {generating ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Generating with Gemini...
                            </span>
                        ) : (
                            '⚡ Generate Deck'
                        )}
                    </button>
                </form>
            </main>
        </div>
    );
}
