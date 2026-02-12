'use client';

import { useState } from 'react';
import { FlashCard as FlashCardType } from '@/lib/types';

interface FlashCardProps {
    card: FlashCardType;
    currentIndex: number;
    totalCards: number;
    onAnswer: (correct: boolean) => void;
}

export default function FlashCardComponent({
    card,
    currentIndex,
    totalCards,
    onAnswer,
}: FlashCardProps) {
    const [flipped, setFlipped] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [answered, setAnswered] = useState(false);

    const handleReveal = () => {
        setFlipped(true);
    };

    const handleAnswer = (correct: boolean) => {
        setAnswered(true);
        onAnswer(correct);
        // Reset for next card after a brief pause
        setTimeout(() => {
            setFlipped(false);
            setShowHint(false);
            setAnswered(false);
        }, 300);
    };

    return (
        <div className="w-full max-w-lg mx-auto">
            {/* Card counter */}
            <div className="text-center mb-4">
                <span className="text-sm text-gray-500">
                    Card {currentIndex + 1} of {totalCards}
                </span>
            </div>

            {/* The card */}
            <div className="relative">
                <div
                    className={`min-h-[280px] rounded-2xl border transition-all duration-500 ${flipped
                            ? 'bg-gradient-to-br from-violet-950/50 to-cyan-950/50 border-violet-500/30'
                            : 'bg-gray-900/80 border-gray-700 hover:border-gray-600'
                        }`}
                >
                    <div className="p-8 flex flex-col items-center justify-center min-h-[280px]">
                        {!flipped ? (
                            <>
                                {/* Question side */}
                                <div className="text-xs uppercase tracking-wider text-violet-400 mb-4 font-medium">
                                    Question
                                </div>
                                <p className="text-white text-lg text-center leading-relaxed mb-6">
                                    {card.question}
                                </p>

                                {/* Hint toggle */}
                                {!showHint ? (
                                    <button
                                        onClick={() => setShowHint(true)}
                                        className="text-xs text-gray-500 hover:text-amber-400 transition-colors"
                                    >
                                        💡 Show Hint
                                    </button>
                                ) : (
                                    <p className="text-sm text-amber-400/80 bg-amber-400/5 border border-amber-400/10 rounded-lg px-4 py-2 text-center">
                                        💡 {card.hint}
                                    </p>
                                )}
                            </>
                        ) : (
                            <>
                                {/* Answer side */}
                                <div className="text-xs uppercase tracking-wider text-cyan-400 mb-4 font-medium">
                                    Answer
                                </div>
                                <p className="text-white text-lg text-center leading-relaxed">
                                    {card.answer}
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Action buttons */}
            <div className="mt-6 flex justify-center">
                {!flipped ? (
                    <button
                        onClick={handleReveal}
                        className="px-8 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-medium transition-all hover:scale-105 active:scale-95"
                    >
                        Reveal Answer
                    </button>
                ) : !answered ? (
                    <div className="flex gap-4">
                        <button
                            onClick={() => handleAnswer(false)}
                            className="px-6 py-3 bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-600/30 rounded-xl font-medium transition-all hover:scale-105 active:scale-95"
                        >
                            ✕ I Missed It
                        </button>
                        <button
                            onClick={() => handleAnswer(true)}
                            className="px-6 py-3 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-600/30 rounded-xl font-medium transition-all hover:scale-105 active:scale-95"
                        >
                            ✓ I Knew It
                        </button>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
