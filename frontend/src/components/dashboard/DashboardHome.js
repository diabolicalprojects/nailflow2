'use client';

import { useState, useEffect } from 'react';
import { getDashboardStats, getDashboardBookings } from '../../lib/api';

function StatCard({ icon, value, label, accent = 'text-primary' }) {
    return (
        <div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] p-8 border border-white shadow-soft-md flex flex-col gap-6 relative overflow-hidden group hover:shadow-soft-lg transition-all">
            <div className={`w-12 h-12 rounded-2xl bg-white shadow-soft-sm flex items-center justify-center ${accent}`}>
                <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">{icon}</span>
            </div>
            <div>
                <div className="text-3xl font-display font-medium text-stone-900 leading-tight">
                    {value}
                </div>
                <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400 mt-2">
                    {label}
                </div>
            </div>
        </div>
    );
}

export default function DashboardHome() {
    const [stats, setStats] = useState(null);
    const [recentBookings, setRecentBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('nailflow_user') || '{}');
        setUser(stored);

        Promise.all([getDashboardStats(), getDashboardBookings({})])
            .then(([s, b]) => {
                setStats(s);
                setRecentBookings(b.slice(0, 5));
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const statusBadge = (status, payStatus) => {
        if (payStatus === 'paid') return { label: 'Confirmada', color: 'text-green-600 bg-green-50' };
        if (status === 'cancelled') return { label: 'Cancelada', color: 'text-red-400 bg-red-50' };
        return { label: 'Pendiente', color: 'text-amber-500 bg-amber-50' };
    };

    const today = new Date();
    const dayName = today.toLocaleDateString('es-ES', { weekday: 'long' });
    const date = today.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });

    return (
        <div className="animate-fade-in max-w-5xl mx-auto">
            {/* Welcome Header */}
            <header className="mb-12">
                <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-stone-400 mb-3">
                    {dayName}, {date}
                </p>
                <h1 className="text-4xl lg:text-5xl font-display italic text-stone-900 leading-tight">
                    Bienvenida, {user?.name?.split(' ')[0] || 'Lidia'} 💅
                </h1>
                <p className="text-stone-400 mt-3 font-medium">Aquí tienes lo que está pasando hoy en tu estudio.</p>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {loading ? (
                    Array(4).fill(0).map((_, i) => (
                        <div key={i} className="h-44 rounded-[2.5rem] bg-stone-100 animate-pulse" />
                    ))
                ) : (
                    <>
                        <StatCard icon="event" value={stats?.total_bookings ?? 0} label="Total de Citas" />
                        <StatCard icon="verified" value={stats?.paid_bookings ?? 0} label="Confirmadas" accent="text-green-500" />
                        <StatCard icon="account_balance_wallet" value={`$${Number(stats?.total_revenue ?? 0).toFixed(0)}`} label="Recaudado" accent="text-amber-600" />
                        <StatCard icon="group" value={stats?.total_clients ?? 0} label="Clientas" accent="text-blue-400" />
                    </>
                )}
            </div>

            {/* Recent Bookings Section */}
            <section className="bg-white/60 backdrop-blur-md rounded-[3rem] p-10 border border-white shadow-soft-lg">
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-300 mb-2">Citas de hoy</p>
                        <h2 className="text-2xl font-display font-medium text-stone-800 italic">Próximas Citas</h2>
                    </div>
                    {recentBookings.length > 0 && (
                        <span className="bg-primary/10 text-primary text-[10px] font-bold px-4 py-2 rounded-full uppercase tracking-wider">
                            {recentBookings.length} en agenda
                        </span>
                    )}
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {Array(3).fill(0).map((_, i) => <div key={i} className="h-20 rounded-3xl bg-stone-50 animate-pulse" />)}
                    </div>
                ) : recentBookings.length === 0 ? (
                    <div className="py-20 text-center flex flex-col items-center">
                        <div className="w-20 h-20 rounded-full bg-stone-50 flex items-center justify-center text-stone-200 mb-6">
                            <span className="material-symbols-outlined text-4xl">calendar_month</span>
                        </div>
                        <p className="font-display italic text-stone-300 text-lg">Tu agenda está tranquila hoy.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {recentBookings.map(b => {
                            const badge = statusBadge(b.status, b.payment_status);
                            return (
                                <div
                                    key={b.id}
                                    className="flex items-center gap-6 p-6 rounded-3xl bg-white/40 border border-stone-50 hover:border-primary/20 hover:bg-white/80 transition-all group"
                                >
                                    {/* Time Block */}
                                    <div className="min-w-[70px] border-r border-stone-100 pr-6 text-center">
                                        <span className="block text-lg font-display font-bold text-stone-800">
                                            {b.start_time?.slice(0, 5)}
                                        </span>
                                        <span className="text-[9px] uppercase tracking-widest text-stone-400 font-bold block mt-1">
                                            {b.duration_minutes}m
                                        </span>
                                    </div>

                                    {/* Client Initial Avatar */}
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center font-bold text-stone-600 shadow-soft-sm">
                                        {b.client_name?.charAt(0)}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1">
                                        <p className="font-medium text-stone-800 text-lg font-display">{b.client_name}</p>
                                        <p className="text-stone-400 text-xs italic mt-1">{b.service_name}</p>
                                    </div>

                                    {/* Status Badge */}
                                    <span className={`px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-wider ${badge.color}`}>
                                        {badge.label}
                                    </span>

                                    <span className="material-symbols-outlined text-stone-200 group-hover:text-primary transition-colors">
                                        chevron_right
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}
