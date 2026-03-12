'use client';

import { useState } from 'react';
import { createBooking } from '../../lib/api';

export default function SummaryStep({ booking, staff, onUpdate, onNext, onBack }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleConfirm = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await createBooking({
                service_id: booking.service.id,
                staff_id: booking.staffId,
                booking_date: booking.date,
                start_time: booking.time,
                client_name: booking.clientName,
                client_phone: booking.clientPhone,
                client_email: booking.clientEmail || '',
                notes: booking.notes || '',
            });

            onUpdate({
                bookingId: result.booking_id,
                depositAmount: result.deposit_amount,
                totalPrice: booking.service.price
            });
            onNext();
        } catch (err) {
            console.error(err);
            setError('Hubo un problema al procesar tu reserva. Por favor intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const formattedDate = new Date(booking.date).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    return (
        <div className="flex-1 flex flex-col p-6 animate-fade-in pb-40">
            <nav className="flex items-center justify-between py-4 mb-4">
                <button onClick={onBack} className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-stone-100 transition-colors">
                    <span className="material-symbols-outlined text-stone-800 font-light text-xl">arrow_back_ios_new</span>
                </button>
                <span className="text-[11px] font-bold tracking-[0.3em] uppercase opacity-40 font-display italic">Resumen</span>
                <div className="w-10"></div>
            </nav>

            <header className="mb-8 text-center">
                <h1 className="text-4xl font-medium font-display text-stone-900 leading-tight">Confirmar Reserva</h1>
                <p className="text-stone-400 text-[10px] tracking-widest uppercase mt-3 font-bold">Casi listo, te estamos esperando</p>
            </header>

            <div className="bg-white rounded-[2.5rem] p-8 shadow-soft-lg border border-white/60 mb-8">
                <div className="space-y-6">
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">Servicio Elegido</span>
                        <h2 className="text-2xl font-display font-semibold text-stone-800">{booking.service?.name}</h2>
                    </div>

                    <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">Fecha</span>
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm text-primary">calendar_today</span>
                                <p className="text-sm font-semibold text-stone-700">{formattedDate}</p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">Hora</span>
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm text-primary">schedule</span>
                                <p className="text-sm font-semibold text-stone-700">{booking.time} HS</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">Duración estimada</span>
                        <p className="text-sm font-medium italic font-display text-stone-600 text-lg">
                            {booking.service?.duration_minutes} minutos de relax
                        </p>
                    </div>

                    {staff && (
                        <div className="flex flex-col gap-2">
                            <span className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">Profesional</span>
                            <div className="flex items-center gap-3 bg-stone-50 p-3 rounded-2xl border border-stone-100">
                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-xs">
                                    {staff.name.charAt(0)}
                                </div>
                                <span className="text-sm font-semibold text-stone-700">{staff.name}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <section className="space-y-4 px-2">
                <div className="flex justify-between items-end mb-2">
                    <span className="font-display text-xl italic text-stone-700">Total del servicio</span>
                    <span className="text-2xl font-display font-bold text-stone-900">${booking.service?.price}</span>
                </div>

                <div className="p-5 rounded-3xl bg-primary/5 border border-primary/10 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary text-2xl font-light">payments</span>
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-widest font-bold text-primary/70">Seña para confirmar</span>
                            <span className="text-sm font-semibold text-stone-700 tracking-tight">Anticipo obligatorio</span>
                        </div>
                    </div>
                    <span className="text-xl font-bold font-display text-primary">
                        ${((booking.service?.price || 0) * (staff?.deposit_percentage || 30) / 100).toFixed(2)}
                    </span>
                </div>

                {error && <p className="text-red-500 text-xs text-center font-medium mt-4">{error}</p>}

                <p className="text-[10px] text-center text-stone-400 italic px-4 mt-6 leading-relaxed">
                    * El anticipo se descontará del total el día de tu cita. <br />
                    Aceptamos MercadoPago, Tarjetas y Apple Pay.
                </p>
            </section>

            <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-white via-white/80 to-transparent pt-12 pointer-events-none z-10 w-full">
                <div className="w-full mx-auto pointer-events-auto">
                    <button
                        onClick={handleConfirm}
                        disabled={loading}
                        className="w-full bg-primary text-white py-5 rounded-full shadow-soft-lg hover:shadow-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-4 group"
                    >
                        {loading ? (
                            <span className="spinner w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                        ) : (
                            <>
                                <span className="font-display text-xl tracking-wider font-semibold">Ir al Pago</span>
                                <span className="material-symbols-outlined font-light text-2xl group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
