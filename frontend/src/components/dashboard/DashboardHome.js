'use client';

import { useState, useEffect } from 'react';
import { getDashboardStats, getDashboardBookings } from '../../lib/api';

function StatCard({ label, value, trend, icon, accent = 'primary' }) {
    return (
        <div className="glass p-8 rounded-[2.5rem] relative overflow-hidden group hover:shadow-soft-lg transition-all duration-500 border border-white/40 dark:border-white/5">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-soft-sm flex items-center justify-center text-primary group-hover:rotate-6 transition-transform">
                        <span className="material-symbols-outlined text-2xl">{icon}</span>
                    </div>
                    {trend && (
                        <span className="text-[10px] font-bold px-2.5 py-1 bg-green-500/10 text-green-600 rounded-full flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">trending_up</span>
                            {trend}%
                        </span>
                    )}
                </div>
                <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400 mb-1">{label}</p>
                    <h3 className="text-4xl font-display font-medium text-stone-900 group-hover:translate-x-1 transition-transform">{value}</h3>
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
    const [copySuccess, setCopySuccess] = useState(false);

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('nailflow_user') || '{}');
        setUser(stored);

        Promise.all([getDashboardStats(), getDashboardBookings({})])
            .then(([s, b]) => {
                setStats(s);
                // Filter for today's bookings
                const today = new Date().toISOString().split('T')[0];
                const sorted = b.sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''));
                setRecentBookings(sorted);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const handleCopyLink = () => {
        const url = `${window.location.origin}/book/${user?.business_slug || ''}`;
        navigator.clipboard.writeText(url);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    };

    const today = new Date();
    const formattedDate = today.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });

    return (
        <div className="animate-fade-in space-y-12">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-stone-400 mb-3">{formattedDate}</p>
                    <h1 className="text-4xl lg:text-6xl font-display italic text-stone-900 leading-tight">
                        {today.getHours() < 12 ? 'Buenos días' : 'Buenas tardes'}, {user?.name?.split(' ')[0] || 'Lidia'} ✨
                    </h1>
                </div>

                {/* Reservation Link Card */}
                <div className="bg-white/60 dark:bg-stone-800/40 p-4 rounded-3xl shadow-soft-sm flex items-center gap-6 border border-white max-w-sm">
                    <div className="w-12 h-12 rounded-2xl bg-accent/40 flex items-center justify-center text-primary flex-shrink-0">
                        <span className="material-symbols-outlined text-2xl">link</span>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-[9px] uppercase tracking-wider text-stone-400 font-bold mb-0.5">Link de reserva</p>
                        <p className="text-xs font-medium truncate text-stone-700">nailflow.app/book/{user?.business_slug || 'nailflow'}</p>
                    </div>
                    <button
                        onClick={handleCopyLink}
                        className={`p-3 rounded-2xl transition-all ${copySuccess ? 'bg-green-500 text-white' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}
                    >
                        <span className="material-symbols-outlined text-[20px]">{copySuccess ? 'check' : 'content_copy'}</span>
                    </button>
                </div>
            </header>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {loading ? (
                    Array(4).fill(0).map((_, i) => (
                        <div key={i} className="h-44 rounded-[2.5rem] bg-stone-100 animate-pulse" />
                    ))
                ) : (
                    <>
                        <StatCard
                            label="Ingresos de hoy"
                            value={`$${Number(stats?.total_revenue || 0).toLocaleString()}`}
                            trend={12}
                            icon="payments"
                        />
                        <StatCard
                            label="Citas Totales"
                            value={stats?.total_bookings || 0}
                            icon="event"
                        />
                        <StatCard
                            label="Confirmadas"
                            value={stats?.paid_bookings || 0}
                            icon="verified"
                        />
                        <StatCard
                            label="Clientas"
                            value={stats?.total_clients || 0}
                            icon="group"
                        />
                    </>
                )}
            </div>

            {/* Main Content Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Today's Agenda */}
                <section className="lg:col-span-2 space-y-8">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="font-display text-3xl font-medium text-stone-800 italic">Citas del Día</h2>
                        <span className="text-[10px] bg-primary/15 px-4 py-2 rounded-full text-primary font-bold uppercase tracking-wider">
                            {recentBookings.filter(b => b.status === 'pending').length} Pendientes
                        </span>
                    </div>

                    <div className="space-y-4">
                        {loading ? (
                            Array(3).fill(0).map((_, i) => (
                                <div key={i} className="h-24 rounded-3xl bg-stone-50 animate-pulse" />
                            ))
                        ) : recentBookings.length === 0 ? (
                            <div className="glass p-16 rounded-[3rem] text-center">
                                <span className="material-symbols-outlined text-stone-200 text-6xl mb-6">calendar_month</span>
                                <p className="font-display italic text-stone-300 text-xl text-center">No hay citas programadas para hoy.</p>
                            </div>
                        ) : (
                            recentBookings.map(b => (
                                <div key={b.id} className="bg-white hover:bg-white/80 p-6 rounded-[2.5rem] shadow-soft-sm border border-stone-100 flex items-center gap-8 group cursor-pointer transition-all hover:scale-[1.01]">
                                    <div className="flex flex-col items-center justify-center min-w-[70px] border-r border-stone-100 pr-8">
                                        <p className="text-xl font-bold font-display leading-tight text-stone-900">{b.start_time?.slice(0, 5) || '--:--'}</p>
                                        <p className="text-[10px] text-stone-400 font-bold uppercase tracking-tighter">
                                            {parseInt((b.start_time || '12:00').split(':')[0]) < 12 ? 'AM' : 'PM'}
                                        </p>
                                    </div>
                                    <div className="w-14 h-14 rounded-2xl bg-stone-50 flex items-center justify-center overflow-hidden border border-stone-100 shadow-soft-sm">
                                        {b.service_image ? (
                                            <img src={b.service_image} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="material-symbols-outlined text-stone-300">brush</span>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-lg font-bold font-display text-stone-800 mb-0.5">{b.client_name}</p>
                                        <div className="flex items-center gap-2">
                                            <p className="text-xs text-stone-400 italic font-medium">{b.service_name}</p>
                                            <span className="text-[8px] text-stone-300">•</span>
                                            <div className="flex items-center gap-1.5">
                                                {b.staff_image && (
                                                    <img src={b.staff_image} alt="" className="w-4 h-4 rounded-full object-cover" />
                                                )}
                                                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">{b.staff_name || 'Staff'}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-3 h-3 rounded-full ${b.payment_status === 'paid' ? 'bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.4)]' : 'bg-primary shadow-[0_0_12px_rgba(230,164,180,0.6)]'}`}></div>
                                        <span className="material-symbols-outlined text-stone-200 group-hover:text-primary transition-colors">chevron_right</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                {/* Quick Actions / Activity */}
                <aside className="space-y-8">
                    <h2 className="font-display text-3xl font-medium text-stone-800 italic px-2">Acceso Rápido</h2>

                    <div className="space-y-4">
                        <button className="w-full glass p-8 rounded-[2.5rem] flex items-center gap-6 group hover:bg-primary transition-all duration-500 text-left">
                            <div className="w-14 h-14 rounded-2xl bg-white shadow-soft-sm flex items-center justify-center text-primary group-hover:bg-white/20 group-hover:text-white transition-colors">
                                <span className="material-symbols-outlined text-3xl">add</span>
                            </div>
                            <div>
                                <p className="font-display text-xl font-medium text-stone-800 group-hover:text-white transition-colors">Crear Cita</p>
                                <p className="text-[10px] uppercase tracking-wider font-bold text-stone-400 group-hover:text-white/60 transition-colors">Registro manual</p>
                            </div>
                        </button>

                        <button className="w-full glass p-8 rounded-[2.5rem] flex items-center gap-6 group hover:bg-stone-900 transition-all duration-500 text-left">
                            <div className="w-14 h-14 rounded-2xl bg-white shadow-soft-sm flex items-center justify-center text-stone-800 group-hover:bg-white/20 group-hover:text-white transition-colors">
                                <span className="material-symbols-outlined text-3xl">calendar_month</span>
                            </div>
                            <div>
                                <p className="font-display text-xl font-medium text-stone-800 group-hover:text-white transition-colors">Ver Agenda</p>
                                <p className="text-[10px] uppercase tracking-wider font-bold text-stone-400 group-hover:text-white/60 transition-colors">Calendario completo</p>
                            </div>
                        </button>
                    </div>

                    {/* Stats mini card */}
                    <div className="bg-stone-900 rounded-[3rem] p-10 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
                        <h3 className="font-display text-2xl font-medium italic mb-2 relative z-10">NailFlow Pro</h3>
                        <p className="text-white/60 text-xs mb-8 leading-relaxed relative z-10">Tu estudio está al 85% de capacidad esta semana. ¡Buen trabajo!</p>
                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden relative z-10">
                            <div className="h-full bg-primary w-[85%] rounded-full shadow-[0_0_10px_rgba(230,164,180,0.5)]"></div>
                        </div>
                    </div>
                </aside>
            </div>

            <style jsx>{`
                .glass {
                    background: rgba(255, 255, 255, 0.45);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.5);
                }
            `}</style>
        </div>
    );
}
