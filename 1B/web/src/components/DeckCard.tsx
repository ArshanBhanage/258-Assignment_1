'use client';

import Link from 'next/link';
import { DeckWithMastery } from '@/lib/types';

interface DeckCardProps {
    deck: DeckWithMastery;
}

function getDifficultyColor(difficulty: string) {
    switch (difficulty) {
        case 'Beginner':
            return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
        case 'Intermediate':
            return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
        case 'Advanced':
            return 'text-red-400 bg-red-400/10 border-red-400/20';
        default:
            return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
}

function getMasteryColor(percent: number) {
    if (percent >= 80) return 'bg-emerald-500';
    if (percent >= 50) return 'bg-amber-500';
    if (percent > 0) return 'bg-orange-500';
    return 'bg-gray-700';
}

export default function DeckCard({ deck }: DeckCardProps) {
    const diffColor = getDifficultyColor(deck.difficulty);
    const masteryColor = getMasteryColor(deck.masteryPercent);

    return (
        <Link href={`/deck/${deck.id}`}>
            <div className="group relative bg-gray-900/50 border border-gray-800 rounded-xl p-5 hover:border-violet-500/50 hover:bg-gray-900/80 transition-all duration-300 cursor-pointer">
                {/* Glow on hover */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-600/0 to-cyan-600/0 group-hover:from-violet-600/5 group-hover:to-cyan-600/5 transition-all duration-300" />

                <div className="relative">
                    <div className="flex items-start justify-between gap-3 mb-3">
                        <h3 className="text-white font-semibold text-base leading-tight line-clamp-2 group-hover:text-violet-300 transition-colors">
                            {deck.title}
                        </h3>
                        <span className={`shrink-0 text-xs px-2 py-1 rounded-full border ${diffColor}`}>
                            {deck.difficulty}
                        </span>
                    </div>

                    {deck.examType && (
                        <span className="inline-block text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded mb-3">
                            {deck.examType}
                        </span>
                    )}

                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                        <span>{deck.cardCount} cards</span>
                        <span>·</span>
                        <span>{deck.createdAt.toLocaleDateString()}</span>
                    </div>

                    {/* Mastery bar */}
                    <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Mastery</span>
                            <span className="text-gray-400 font-medium">{deck.masteryPercent}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${masteryColor}`}
                                style={{ width: `${deck.masteryPercent}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
