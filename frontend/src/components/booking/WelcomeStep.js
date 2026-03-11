'use client';

import { useState } from 'react';

export default function WelcomeStep({ onNext, booking, onUpdate, staff }) {
    const [error, setError] = useState('');

    const handleContinue = () => {
        if (!booking.clientName.trim() || !booking.clientPhone.trim()) {
            setError('Por favor completa tu nombre y teléfono');
            return;
        }
        onNext();
    };

    return (
        <div className="flex-1 flex flex-col p-8 animate-fade-in">
            <header className="flex flex-col items-center mb-12 mt-8">
                <div className="relative mb-6">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-soft-lg">
                        <img
                            alt={staff?.name || "Nail Tech"}
                            className="w-full h-full object-cover"
                            src={staff?.image_url || "https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0?q=80&w=200&h=200&auto=format&fit=crop"}
                        />
                    </div>
                </div>
                <h1 className="font-display text-4xl font-medium text-stone-900 mb-2 italic">
                    ¡Hola! Soy {staff?.name?.split(' ')[0] || 'Ana'}
                </h1>
                <p className="text-[11px] uppercase tracking-[0.2em] text-stone-400 font-semibold">
                    Especialista en Nail Art
                </p>
            </header>

            <div className="space-y-6 flex-1">
                <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-stone-400 font-bold ml-1">Tu Nombre</label>
                    <input
                        type="text"
                        placeholder="Ej. María García"
                        className="w-full bg-white/60 border-none rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                        value={booking.clientName}
                        onChange={e => {
                            onUpdate({ clientName: e.target.value });
                            setError('');
                        }}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-stone-400 font-bold ml-1">WhatsApp / Teléfono</label>
                    <input
                        type="tel"
                        placeholder="+54 9 11 ..."
                        className="w-full bg-white/60 border-none rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                        value={booking.clientPhone}
                        onChange={e => {
                            onUpdate({ clientPhone: e.target.value });
                            setError('');
                        }}
                    />
                </div>

                {error && (
                    <p className="text-red-400 text-xs text-center font-medium animate-pulse">{error}</p>
                )}
            </div>

            <div className="mt-12">
                <button
                    onClick={handleContinue}
                    className="w-full bg-primary text-white py-5 rounded-full shadow-soft-md hover:shadow-soft-lg active:scale-[0.98] transition-all font-display text-xl tracking-wide"
                >
                    Continuar
                </button>
            </div>
        </div>
    );
}
