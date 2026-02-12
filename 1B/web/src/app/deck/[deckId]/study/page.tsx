'use client';

import { useEffect, useState, use } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { getDeck, getDeckCards, updateCardStats } from '@/lib/firestore';
import { Deck, FlashCard } from '@/lib/types';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import FlashCardComponent from '@/components/FlashCard';
import ProgressBar from '@/components/ProgressBar';
import LoadingSpinner from '@/components/LoadingSpinner';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function StudyPage({ params }: { params: Promise<{ deckId: string }> }) {
    const { deckId } = use(params);
    return (
        <ProtectedRoute>
            <StudyContent deckId={deckId} />
        </ProtectedRoute>
    );
}

function StudyContent({ deckId }: { deckId: string }) {
    const { user } = useAuth();
    const router = useRouter();
    const [deck, setDeck] = useState<Deck | null>(null);
    const [cards, setCards] = useState<FlashCard[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [sessionCorrect, setSessionCorrect] = useState(0);
    const [sessionTotal, setSessionTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [finished, setFinished] = useState(false);

    useEffect(() => {
        if (!user) return;
        loadData();
    }, [user, deckId]);

    const loadData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const [d, c] = await Promise.all([
                getDeck(user.uid, deckId),
                getDeckCards(user.uid, deckId),
            ]);
            if (!d || c.length === 0) {
                toast.error('Deck not found or has no cards');
                router.push('/dashboard');
                return;
            }
            setDeck(d);
            setCards(c.sort(() => Math.random() - 0.5));
        } catch (err) {
            console.error(err);
            toast.error('Failed to load deck');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = async (correct: boolean) => {
        if (!user) return;

        const currentCard = cards[currentIndex];
        setSessionTotal((prev) => prev + 1);
        if (correct) setSessionCorrect((prev) => prev + 1);

        try {
            await updateCardStats(user.uid, deckId, currentCard.id, correct);
        } catch (err) {
            console.error('Failed to update card stats:', err);
        }

        if (currentIndex + 1 < cards.length) {
            setCurrentIndex((prev) => prev + 1);
        } else {
            setFinished(true);
        }
    };

    const handleRestart = () => {
        setCurrentIndex(0);
        setSessionCorrect(0);
        setSessionTotal(0);
        setFinished(false);
        setCards((prev) => [...prev].sort(() => Math.random() - 0.5));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950">
                <Navbar />
                <LoadingSpinner message="Preparing study session..." />
            </div>
        );
    }

    if (!deck) return null;

    return (
        <div className="min-h-screen bg-gray-950">
            <Navbar />
            <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
                <div className="flex items-center justify-between mb-6">
                    <Link
                        href={`/deck/${deckId}`}
                        className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
                    >
                        ← Back to Deck
                    </Link>
                    <h1 className="text-lg font-semibold text-white truncate max-w-[200px] sm:max-w-none">
                        {deck.title}
                    </h1>
                </div>

                <div className="mb-8">
                    <ProgressBar
                        correct={sessionCorrect}
                        total={sessionTotal}
                        label="Session Progress"
                    />
                </div>

                {finished ? (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-6">
                            {sessionCorrect === cards.length
                                ? '🏆'
                                : sessionCorrect >= cards.length * 0.7
                                    ? '🎉'
                                    : '💪'}
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Session Complete!</h2>
                        <p className="text-lg text-gray-400 mb-1">
                            You got{' '}
                            <span className="text-emerald-400 font-semibold">{sessionCorrect}</span> out of{' '}
                            <span className="text-white font-semibold">{cards.length}</span> correct
                        </p>
                        <p className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent mb-8">
                            {Math.round((sessionCorrect / cards.length) * 100)}%
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={handleRestart}
                                className="px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-medium transition-all hover:scale-105"
                            >
                                🔄 Study Again
                            </button>
                            <Link
                                href={`/deck/${deckId}`}
                                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl font-medium border border-gray-700 transition-colors text-center"
                            >
                                View Deck
                            </Link>
                            <Link
                                href="/dashboard"
                                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl font-medium border border-gray-700 transition-colors text-center"
                            >
                                Dashboard
                            </Link>
                        </div>
                    </div>
                ) : (
                    <FlashCardComponent
                        card={cards[currentIndex]}
                        currentIndex={currentIndex}
                        totalCards={cards.length}
                        onAnswer={handleAnswer}
                    />
                )}
            </main>
        </div>
    );
}
