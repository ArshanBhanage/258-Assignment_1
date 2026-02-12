'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserDecks } from '@/lib/firestore';
import { DeckWithMastery } from '@/lib/types';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import DeckCard from '@/components/DeckCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function DashboardPage() {
    return (
        <ProtectedRoute>
            <DashboardContent />
        </ProtectedRoute>
    );
}

function DashboardContent() {
    const { user } = useAuth();
    const [decks, setDecks] = useState<DeckWithMastery[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        loadDecks();
    }, [user]);

    const loadDecks = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const data = await getUserDecks(user.uid);
            setDecks(data);
        } catch (err) {
            console.error('Failed to load decks:', err);
            toast.error('Failed to load decks. Check Firestore rules.');
        } finally {
            setLoading(false);
        }
    };

    const overallMastery =
        decks.length > 0
            ? Math.round(decks.reduce((sum, d) => sum + d.masteryPercent, 0) / decks.length)
            : 0;

    const totalCards = decks.reduce((sum, d) => sum + d.cardCount, 0);

    return (
        <div className="min-h-screen bg-gray-950">
            <Navbar />
            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
                {/* Stats bar */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-white">{decks.length}</p>
                        <p className="text-xs text-gray-500 mt-1">Decks</p>
                    </div>
                    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-white">{totalCards}</p>
                        <p className="text-xs text-gray-500 mt-1">Total Cards</p>
                    </div>
                    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                            {overallMastery}%
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Avg Mastery</p>
                    </div>
                </div>

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-xl font-bold text-white">Your Decks</h1>
                    <Link
                        href="/create"
                        className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm rounded-lg font-medium transition-colors"
                    >
                        + New Deck
                    </Link>
                </div>

                {/* Deck grid */}
                {loading ? (
                    <LoadingSpinner message="Loading your decks..." />
                ) : decks.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-5xl mb-4">📚</div>
                        <h2 className="text-lg font-semibold text-white mb-2">No decks yet</h2>
                        <p className="text-sm text-gray-500 mb-6">
                            Create your first AI-generated flashcard deck to get started.
                        </p>
                        <Link
                            href="/create"
                            className="inline-block px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-medium transition-all hover:scale-105"
                        >
                            Create Your First Deck
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {decks.map((deck) => (
                            <DeckCard key={deck.id} deck={deck} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
