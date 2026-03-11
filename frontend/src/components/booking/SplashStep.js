'use client';

import { useEffect } from 'react';

export default function SplashStep({ onComplete, businessName = 'NailFlow', logoUrl }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onComplete();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-bg-light animate-fade-in">
            <div className="flex flex-col items-center justify-center w-full max-w-xs">
                <div className="mb-6 flex items-center justify-center">
                    {logoUrl ? (
                        <div className="w-24 h-24 rounded-full overflow-hidden shadow-soft-lg border-4 border-white mb-4 animate-pulse">
                            <img src={logoUrl} alt={businessName} className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <span className="material-symbols-outlined text-primary text-6xl font-light scale-110 animate-pulse">
                            brush
                        </span>
                    )}
                </div>
                <div className="text-center">
                    <h1 className="text-stone-800 text-4xl font-display font-light tracking-wide mb-2">
                        {businessName}
                    </h1>
                    <p className="text-primary/80 text-sm font-display font-light italic tracking-widest leading-loose">
                        Art at your fingertips
                    </p>
                </div>
                <div className="mt-32 w-32 flex flex-col items-center">
                    <div className="w-full h-[1px] bg-primary/20 overflow-hidden relative">
                        <div className="absolute inset-0 bg-primary/60 animate-loading-bar"></div>
                    </div>
                    <span className="mt-4 text-[10px] uppercase tracking-[0.3em] text-primary/60 font-medium">
                        Loading
                    </span>
                </div>
            </div>
        </div>
    );
}
