export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="mt-16 py-8 border-t-[3px] border-black">
            <div className="text-center space-y-3 font-mono text-xs">
                <div className="text-gray-400">
                    ─────────────────────────────────────
                </div>
                <div className="font-black text-sm uppercase tracking-wider">
                    Construido con Intención
                </div>
                <div className="text-gray-600">
                    NEXT.JS • TAILWIND • GEMINI AI
                </div>
                <div className="text-gray-600">
                    DISEÑADO EN CDMX
                </div>
                <div className="font-bold">
                    {currentYear}
                </div>
                <div className="text-gray-400">
                    ─────────────────────────────────────
                </div>
            </div>
        </footer>
    )
}
