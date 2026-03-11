'use client';

import { useState, useEffect } from 'react';
import { getDashboardBookings } from '../../lib/api';

const FILTERS = [
    { key: 'all', label: 'Todas' },
    { key: 'pending', label: 'Pendientes' },
    { key: 'confirmed', label: 'Confirmadas' },
    { key: 'cancelled', label: 'Canceladas' },
];

function statusBadge(status, payStatus) {
    if (payStatus === 'paid') return { label: 'Confirmada', color: 'text-green-600 bg-green-50' };
    if (status === 'cancelled') return { label: 'Cancelada', color: 'text-red-400 bg-red-50' };
    if (payStatus === 'failed') return { label: 'Pago Fallido', color: 'text-red-500 bg-red-50' };
    return { label: 'Pendiente', color: 'text-amber-500 bg-amber-50' };
}

export default function DashboardBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        setLoading(true);
        const params = filter !== 'all' ? { status: filter } : {};
        getDashboardBookings(params)
            .then(setBookings)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [filter]);

    return (
        <div className="animate-fade-in max-w-6xl mx-auto">
            {/* Header */}
            <header className="mb-12">
                <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-stone-400 mb-3">Agenda</p>
                <h1 className="text-4xl lg:text-5xl font-display italic text-stone-900 leading-tight">Reservas</h1>
            </header>

            {/* Filter Navigation */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-12">
                <nav className="flex bg-stone-100/50 p-1.5 rounded-full border border-stone-100">
                    {FILTERS.map(f => (
                        <button
                            key={f.key}
                            onClick={() => setFilter(f.key)}
                            className={`px-6 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all ${filter === f.key ? 'bg-white text-stone-900 shadow-soft-sm' : 'text-stone-400 hover:text-stone-600'}`}
                        >
                            {f.label}
                        </button>
                    ))}
                </nav>
                <div className="bg-primary/5 text-primary text-[10px] font-bold px-6 py-3 rounded-full uppercase tracking-[0.1em] border border-primary/10">
                    {bookings.length} {bookings.length === 1 ? 'resultado' : 'resultados'}
                </div>
            </div>

            {/* Bookings List/Table */}
            {loading ? (
                <div className="space-y-6">
                    {Array(5).fill(0).map((_, i) => (
                        <div key={i} className="h-24 rounded-[2rem] bg-stone-100 animate-pulse" />
                    ))}
                </div>
            ) : bookings.length === 0 ? (
                <div className="bg-white/60 backdrop-blur-md rounded-[3rem] p-20 border border-white shadow-soft-lg text-center flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full bg-stone-50 flex items-center justify-center text-stone-200 mb-8">
                        <span className="material-symbols-outlined text-5xl">calendar_today</span>
                    </div>
                    <h2 className="font-display italic text-2xl text-stone-800 mb-3">No hay citas registradas</h2>
                    <p className="text-stone-400 max-w-md mx-auto italic">Tu agenda está tranquila por ahora. Aquí aparecerán todos los turnos reservados.</p>
                </div>
            ) : (
                <div className="bg-white/60 backdrop-blur-md rounded-[3rem] p-4 lg:p-8 border border-white shadow-soft-lg space-y-4">
                    {bookings.map(b => {
                        const badge = statusBadge(b.status, b.payment_status);
                        return (
                            <div
                                key={b.id}
                                className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-[2rem] bg-white border border-stone-50 hover:border-primary/20 hover:shadow-soft-md transition-all group"
                            >
                                {/* Time/Date Block */}
                                <div className="min-w-[100px] text-center border-b sm:border-b-0 sm:border-r border-stone-100 pb-4 sm:pb-0 sm:pr-8">
                                    <span className="block text-2xl font-display font-medium text-stone-900">
                                        {b.start_time?.slice(0, 5)}
                                    </span>
                                    <span className="block text-[10px] uppercase tracking-widest text-stone-400 font-bold mt-1">
                                        {new Date(b.booking_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                                    </span>
                                </div>

                                {/* Avatar */}
                                <div className="w-14 h-14 rounded-full bg-stone-50 flex items-center justify-center font-bold text-stone-500 shadow-soft-sm border-2 border-white overflow-hidden flex-shrink-0">
                                    {b.client_name?.charAt(0)}
                                </div>

                                {/* Main Info */}
                                <div className="flex-1 text-center sm:text-left">
                                    <h3 className="font-display italic text-xl text-stone-800 leading-tight mb-1">{b.client_name}</h3>
                                    <div className="flex items-center justify-center sm:justify-start gap-4">
                                        <p className="text-stone-400 text-xs italic">{b.service_name}</p>
                                        <div className="w-1 h-1 rounded-full bg-stone-200"></div>
                                        <div className="flex items-center gap-1.5 text-stone-400 text-[10px] font-bold uppercase tracking-widest">
                                            <span className="material-symbols-outlined text-[14px]">face</span>
                                            {b.staff_name || 'Sin asignar'}
                                        </div>
                                    </div>
                                </div>

                                {/* Pricing info */}
                                <div className="text-right hidden lg:block pr-8">
                                    <p className="text-[9px] uppercase tracking-widest font-bold text-stone-300 mb-1">Seña pagada</p>
                                    <span className="text-xl font-display font-bold text-stone-800">${Number(b.deposit_amount || 0).toFixed(0)}</span>
                                </div>

                                {/* Status */}
                                <div className="flex items-center gap-6">
                                    <span className={`px-5 py-2.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest ${badge.color}`}>
                                        {badge.label}
                                    </span>
                                    <button className="w-10 h-10 rounded-full hover:bg-stone-50 flex items-center justify-center text-stone-300 hover:text-primary transition-all">
                                        <span className="material-symbols-outlined">more_vert</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
