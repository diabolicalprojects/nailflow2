'use client';

export default function MobileContainer({ children }) {
    return (
        <div className="min-h-screen bg-bg-light dark:bg-bg-dark text-stone-800 dark:text-stone-200 font-sans antialiased">
            <main className="w-full max-w-md mx-auto min-h-screen shadow-2xl bg-white dark:bg-stone-900 relative overflow-hidden flex flex-col">
                {children}
            </main>
        </div>
    );
}
