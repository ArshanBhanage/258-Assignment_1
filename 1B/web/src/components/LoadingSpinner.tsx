export default function LoadingSpinner({ message = 'Loading...' }: { message?: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="relative">
                <div className="w-12 h-12 border-3 border-violet-500/20 rounded-full" />
                <div className="absolute inset-0 w-12 h-12 border-3 border-violet-500 border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-gray-400 text-sm">{message}</p>
        </div>
    );
}
