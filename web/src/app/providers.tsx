'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        background: '#1f2937',
                        color: '#f9fafb',
                        border: '1px solid #374151',
                        fontSize: '14px',
                    },
                    success: {
                        iconTheme: { primary: '#10b981', secondary: '#f9fafb' },
                    },
                    error: {
                        iconTheme: { primary: '#ef4444', secondary: '#f9fafb' },
                    },
                }}
            />
            {children}
        </AuthProvider>
    );
}
