export default function ProgressBar({
    correct,
    total,
    label,
}: {
    correct: number;
    total: number;
    label?: string;
}) {
    const percent = total > 0 ? Math.round((correct / total) * 100) : 0;

    return (
        <div className="w-full">
            {label && (
                <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-gray-400">{label}</span>
                    <span className="text-gray-300 font-medium">
                        {correct}/{total} ({percent}%)
                    </span>
                </div>
            )}
            <div className="h-2.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 transition-all duration-700 ease-out"
                    style={{ width: `${percent}%` }}
                />
            </div>
        </div>
    );
}
