'use client';

import { useState } from 'react';
import { createBooking } from '../../lib/api';

export default function ClientInfoStep({ booking, staff, onUpdate, onNext, onBack }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!booking.clientName.trim() || !booking.clientPhone.trim()) {
            setError('Nombre y teléfono son requeridos');
            return;
        }

        setLoading(true);
        try {
            const result = await createBooking({
                service_id: booking.service.id,
                staff_id: booking.staffId,
                booking_date: booking.date,
                start_time: booking.time,
                client_name: booking.clientName,
                client_phone: booking.clientPhone,
                client_email: booking.clientEmail,
                notes: booking.notes,
            });

            onUpdate({ bookingId: result.booking_id, depositAmount: result.deposit_amount });
            onNext();
        } catch (err) {
            const msg = err.response?.data?.error || 'Error al crear la reserva. Intenta de nuevo.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col p-6 animate-fade-in pb-24 lg:pb-6">
            <header className="mb-10 flex items-center justify-between">
                <button onClick={onBack} className="w-10 h-10 rounded-full hover:bg-stone-100 flex items-center justify-center transition-colors">
                    <span className="material-symbols-outlined text-stone-400">arrow_back_ios_new</span>
                </button>
                <div className="text-center flex-1 pr-10">
                    <h1 className="text-3xl font-light font-display text-stone-800 leading-tight">
                        Tus <span className="italic font-medium">datos</span>
                    </h1>
                    <p className="text-stone-400 mt-2 text-[10px] tracking-[0.2em] font-bold uppercase">Casi terminamos</p>
                </div>
            </header>

            {/* Summary Tooltip */}
            <div className="bg-stone-50/80 backdrop-blur-sm rounded-3xl p-6 border border-stone-100 mb-8 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-soft-sm flex items-center justify-center text-primary/60 shrink-0">
                    <span className="material-symbols-outlined">event_available</span>
                </div>
                <div>
                    <p className="text-stone-800 font-display font-bold italic text-sm line-clamp-1">{booking.service?.name}</p>
                    <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-1">
                        {new Date(booking.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} • {booking.time}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Nombre Completo *</label>
                    <input
                        required
                        value={booking.clientName}
                        onChange={e => onUpdate({ clientName: e.target.value })}
                        placeholder="ej. María García"
                        className="w-full bg-white/60 border border-stone-100 rounded-2xl px-6 py-4 text-sm font-display text-stone-700 outline-none focus:border-primary transition-all shadow-soft-sm"
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">WhatsApp / Teléfono *</label>
                    <input
                        required
                        type="tel"
                        value={booking.clientPhone}
                        onChange={e => onUpdate({ clientPhone: e.target.value })}
                        placeholder="+54 9 11 ..."
                        className="w-full bg-white/60 border border-stone-100 rounded-2xl px-6 py-4 text-sm font-display text-stone-700 outline-none focus:border-primary transition-all shadow-soft-sm"
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Email (opcional)</label>
                    <input
                        type="email"
                        value={booking.clientEmail}
                        onChange={e => onUpdate({ clientEmail: e.target.value })}
                        placeholder="maria@example.com"
                        className="w-full bg-white/60 border border-stone-100 rounded-2xl px-6 py-4 text-sm font-display text-stone-700 outline-none focus:border-primary transition-all shadow-soft-sm"
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Notas (opcional)</label>
                    <textarea
                        rows={3}
                        value={booking.notes}
                        onChange={e => onUpdate({ notes: e.target.value })}
                        placeholder="¿Tienes alguna preferencia o diseño en mente?"
                        className="w-full bg-white/60 border border-stone-100 rounded-2xl px-6 py-4 text-sm font-display text-stone-700 outline-none focus:border-primary transition-all resize-none shadow-soft-sm"
                    />
                </div>

                {error && (
                    <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-[11px] font-bold flex items-center gap-3 border border-red-100 px-6">
                        <span className="material-symbols-outlined text-lg">error</span>
                        {error}
                    </div>
                )}

                <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-md lg:relative lg:p-0 lg:bg-transparent">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-stone-900 text-white py-5 rounded-2xl shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 font-display text-lg"
                    >
                        {loading ? 'Confirmando...' : 'Proceder al Pago'}
                        <span className="material-symbols-outlined text-xl">{loading ? 'sync' : 'payments'}</span>
                    </button>
                    <div className="flex items-center justify-center gap-6 mt-6 hidden lg:flex">
                        <div className="h-[2px] w-8 bg-primary rounded-full"></div>
                        <div className="h-[2px] w-8 bg-primary rounded-full"></div>
                        <p className="text-center text-[10px] text-stone-400 uppercase tracking-[0.3em] font-bold">Paso 3 de 4</p>
                        <div className="h-[2px] w-8 bg-stone-200 rounded-full"></div>
                    </div>
                </div>
            </form>
        </div>
    );
}
