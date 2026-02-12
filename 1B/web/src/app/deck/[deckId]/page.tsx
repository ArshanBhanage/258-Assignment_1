'use client';

import { useEffect, useState, use } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { getDeck, getDeckCards, deleteDeck, regenerateDeck } from '@/lib/firestore';
import { Deck, FlashCard, GeneratedDeck } from '@/lib/types';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import LoadingSpinner from '@/components/LoadingSpinner';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function DeckPage({ params }: { params: Promise<{ deckId: string }> }) {
    const { deckId } = use(params);
    return (
        <ProtectedRoute>
            <DeckContent deckId={deckId} />
        </ProtectedRoute>
    );
}

function DeckContent({ deckId }: { deckId: string }) {
    const { user } = useAuth();
    const router = useRouter();
    const [deck, setDeck] = useState<Deck | null>(null);
    const [cards, setCards] = useState<FlashCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [regenerating, setRegenerating] = useState(false);

    useEffect(() => {
        if (!user) return;
        loadDeck();
    }, [user, deckId]);

    const loadDeck = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const [d, c] = await Promise.all([
                getDeck(user.uid, deckId),
                getDeckCards(user.uid, deckId),
            ]);
            if (!d) {
                toast.error('Deck not found');
                router.push('/dashboard');
                return;
            }
            setDeck(d);
            setCards(c);
        } catch (err) {
            console.error('Failed to load deck:', err);
            toast.error('Failed to load deck');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!user || !deck) return;
        if (!confirm('Are you sure you want to delete this deck? This cannot be undone.')) return;
        setDeleting(true);
        try {
            await deleteDeck(user.uid, deckId);
            toast.success('Deck deleted');
            router.push('/dashboard');
        } catch (err) {
            console.error(err);
            toast.error('Failed to delete deck');
            setDeleting(false);
        }
    };

    const handleRegenerate = async () => {
        if (!user || !deck) return;
        if (!confirm('Regenerate this deck? All current cards and progress will be replaced.')) return;
        setRegenerating(true);
        try {
            const res = await fetch('/api/generate-flashcards', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic: deck.topic,
                    difficulty: deck.difficulty,
                    numCards: deck.cardCount,
                    examType: deck.examType,
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Failed to regenerate');
            }

            const data: GeneratedDeck = await res.json();
            await regenerateDeck(user.uid, deckId, data.title, data.cards);
            toast.success('Deck regenerated!');
            loadDeck();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Regeneration failed';
            toast.error(message);
        } finally {
            setRegenerating(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950">
                <Navbar />
                <LoadingSpinner message="Loading deck..." />
            </div>
        );
    }

    if (!deck) return null;

    const totalSeen = cards.reduce((s, c) => s + c.seenCount, 0);
    const totalCorrect = cards.reduce((s, c) => s + c.correctCount, 0);
    const masteryPercent = totalSeen > 0 ? Math.round((totalCorrect / totalSeen) * 100) : 0;

    function getDifficultyColor(difficulty: string) {
        switch (difficulty) {
            case 'Beginner': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
            case 'Intermediate': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
            case 'Advanced': return 'text-red-400 bg-red-400/10 border-red-400/20';
            default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
        }
    }

    return (
        <div className="min-h-screen bg-gray-950">
            <Navbar />
            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
                <Link
                    href="/dashboard"
                    className="inline-flex items-center text-sm text-gray-500 hover:text-gray-300 transition-colors mb-6"
                >
                    ← Back to Dashboard
                </Link>

                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-white mb-2">{deck.title}</h1>
                            <div className="flex flex-wrap items-center gap-2 text-sm">
                                <span className={`px-2 py-0.5 rounded-full border text-xs ${getDifficultyColor(deck.difficulty)}`}>
                                    {deck.difficulty}
                                </span>
                                {deck.examType && (
                                    <span className="px-2 py-0.5 rounded bg-gray-800 text-gray-400 text-xs">
                                        {deck.examType}
                                    </span>
                                )}
                                <span className="text-gray-500">{deck.cardCount} cards</span>
                                <span className="text-gray-600">·</span>
                                <span className="text-gray-500">{deck.createdAt.toLocaleDateString()}</span>
                            </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                            <Link
                                href={`/deck/${deckId}/study`}
                                className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm rounded-lg font-medium transition-colors"
                            >
                                📖 Study
                            </Link>
                            <button
                                onClick={handleRegenerate}
                                disabled={regenerating}
                                className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg border border-gray-700 transition-colors disabled:opacity-50"
                            >
                                {regenerating ? '⏳ Regenerating...' : '🔄 Regenerate'}
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="px-4 py-2.5 hover:bg-red-600/20 text-red-400 text-sm rounded-lg border border-red-600/20 transition-colors disabled:opacity-50"
                            >
                                🗑
                            </button>
                        </div>
                    </div>

                    <div className="mt-5 pt-5 border-t border-gray-800">
                        <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-gray-400">Overall Mastery</span>
                            <span className="text-white font-medium">{masteryPercent}%</span>
                        </div>
                        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 transition-all duration-500"
                                style={{ width: `${masteryPercent}%` }}
                            />
                        </div>
                    </div>
                </div>

                <h2 className="text-lg font-semibold text-white mb-4">Cards ({cards.length})</h2>
                {cards.length === 0 ? (
                    <p className="text-gray-500 text-sm">No cards found.</p>
                ) : (
                    <div className="space-y-3">
                        {cards.map((card, idx) => {
                            const cardMastery =
                                card.seenCount > 0
                                    ? Math.round((card.correctCount / card.seenCount) * 100)
                                    : 0;
                            return (
                                <div
                                    key={card.id}
                                    className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs text-gray-600 font-mono">#{idx + 1}</span>
                                                <span className="text-sm font-medium text-white">{card.question}</span>
                                            </div>
                                            <p className="text-sm text-gray-500 pl-6">{card.answer}</p>
                                            {card.hint && (
                                                <p className="text-xs text-amber-500/60 pl-6 mt-1">💡 {card.hint}</p>
                                            )}
                                        </div>
                                        <div className="text-right shrink-0">
                                            {card.seenCount > 0 ? (
                                                <>
                                                    <p className="text-sm font-medium text-white">{cardMastery}%</p>
                                                    <p className="text-xs text-gray-500">
                                                        {card.correctCount}/{card.seenCount}
                                                    </p>
                                                </>
                                            ) : (
                                                <span className="text-xs text-gray-600">Not studied</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
