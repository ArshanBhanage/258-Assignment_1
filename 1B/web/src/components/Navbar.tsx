'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Navbar() {
    const { user, signOut } = useAuth();
    const router = useRouter();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleSignOut = async () => {
        await signOut();
        router.push('/login');
    };

    if (!user) return null;

    return (
        <nav className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-xl border-b border-gray-800">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between h-16">
                    <Link href="/dashboard" className="flex items-center gap-2 group">
                        <span className="text-2xl">⚡</span>
                        <span className="text-lg font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent group-hover:from-violet-300 group-hover:to-cyan-300 transition-all">
                            Flashcard Forge
                        </span>
                    </Link>

                    {/* Desktop nav */}
                    <div className="hidden sm:flex items-center gap-4">
                        <Link
                            href="/dashboard"
                            className="text-sm text-gray-400 hover:text-white transition-colors"
                        >
                            Dashboard
                        </Link>
                        <Link
                            href="/create"
                            className="text-sm px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white transition-colors"
                        >
                            + New Deck
                        </Link>
                        <div className="w-px h-6 bg-gray-700" />
                        <span className="text-xs text-gray-500 truncate max-w-[150px]">
                            {user.email}
                        </span>
                        <button
                            onClick={handleSignOut}
                            className="text-sm text-gray-400 hover:text-red-400 transition-colors"
                        >
                            Sign Out
                        </button>
                    </div>

                    {/* Mobile hamburger */}
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="sm:hidden text-gray-400 hover:text-white"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {menuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Mobile menu */}
                {menuOpen && (
                    <div className="sm:hidden pb-4 space-y-2">
                        <Link href="/dashboard" className="block text-sm text-gray-400 hover:text-white py-2" onClick={() => setMenuOpen(false)}>
                            Dashboard
                        </Link>
                        <Link href="/create" className="block text-sm text-gray-400 hover:text-white py-2" onClick={() => setMenuOpen(false)}>
                            + New Deck
                        </Link>
                        <div className="border-t border-gray-800 pt-2 mt-2">
                            <span className="block text-xs text-gray-500 pb-2">{user.email}</span>
                            <button onClick={handleSignOut} className="text-sm text-red-400 hover:text-red-300">
                                Sign Out
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
