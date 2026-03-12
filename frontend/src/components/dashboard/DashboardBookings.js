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
    const [selected, setSelected] = useState(null);
    const [viewPhoto, setViewPhoto] = useState(null);

    useEffect(() => {
        setLoading(true);
        const params = filter !== 'all' ? { status: filter } : {};
        getDashboardBookings(params)
            .then(setBookings)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [filter]);

    return (
        <div className="animate-fade-in max-w-6xl mx-auto relative min-h-[80vh]">
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
                                onClick={() => setSelected(b)}
                                className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-[2rem] bg-white border border-stone-50 hover:border-primary/20 hover:shadow-soft-md transition-all group cursor-pointer"
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
                                        <span className="material-symbols-outlined">chevron_right</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Right Sidebar Detail */}
            <div className={`fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-[100] transform transition-transform duration-500 ease-out ${selected ? 'translate-x-0' : 'translate-x-full'}`}>
                {selected && (
                    <div className="h-full flex flex-col">
                        <header className="p-8 border-b border-stone-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
                            <div>
                                <h2 className="font-display italic text-2xl text-stone-800">Detalles de Cita</h2>
                                <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400 mt-1">Ref: #{selected.id.toString().padStart(4, '0')}</p>
                            </div>
                            <button onClick={() => setSelected(null)} className="w-12 h-12 rounded-full bg-stone-50 flex items-center justify-center text-stone-400 hover:text-primary transition-colors ring-1 ring-stone-100">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </header>

                        <div className="flex-1 overflow-y-auto p-8 scrollbar-hide space-y-10 pb-32">
                            {/* Client Section */}
                            <section>
                                <div className="flex items-center gap-6 mb-6">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-3xl font-bold text-stone-600 shadow-soft-sm border-4 border-white">
                                        {selected.client_name?.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-display italic text-3xl text-stone-800 leading-tight">{selected.client_name}</h3>
                                        <div className="flex items-center gap-2 text-stone-400 mt-2">
                                            <span className="material-symbols-outlined text-sm">call</span>
                                            <span className="text-xs font-bold tracking-widest uppercase">{selected.client_phone}</span>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-6 rounded-[2rem] bg-stone-50 border border-stone-100">
                                    <p className="text-[9px] uppercase tracking-widest font-bold text-stone-400 mb-2">Fecha</p>
                                    <p className="text-lg font-display italic text-stone-800">{new Date(selected.booking_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}</p>
                                </div>
                                <div className="p-6 rounded-[2rem] bg-stone-50 border border-stone-100">
                                    <p className="text-[9px] uppercase tracking-widest font-bold text-stone-400 mb-2">Horario</p>
                                    <p className="text-lg font-display italic text-stone-800">{selected.start_time?.slice(0, 5)} HS</p>
                                </div>
                            </div>

                            {/* Service Details */}
                            <section className="p-8 rounded-[2.5rem] bg-white border border-stone-100 shadow-soft-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                                    <span className="material-symbols-outlined text-7xl">spa</span>
                                </div>
                                <p className="text-[10px] uppercase tracking-widest font-bold text-primary mb-4">Servicio contratado</p>
                                <h4 className="text-2xl font-display italic text-stone-800 mb-6">{selected.service_name}</h4>

                                <div className="flex items-center gap-4 text-stone-500 mb-8 pb-8 border-b border-stone-50">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm">face</span>
                                        <span className="text-[11px] font-bold uppercase tracking-wider">{selected.staff_name || 'Sin asignar'}</span>
                                    </div>
                                    <div className="w-1 h-1 rounded-full bg-stone-200"></div>
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm">schedule</span>
                                        <span className="text-[11px] font-bold uppercase tracking-wider">60 m</span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-[9px] uppercase tracking-widest font-bold text-stone-300">Seña pagada</p>
                                        <p className="text-3xl font-display font-bold text-stone-800">${Number(selected.deposit_amount).toFixed(0)}</p>
                                    </div>
                                    <div className={`px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest ${statusBadge(selected.status, selected.payment_status).color}`}>
                                        {statusBadge(selected.status, selected.payment_status).label}
                                    </div>
                                </div>
                            </section>

                            {/* Reference Photos */}
                            <section>
                                <header className="flex items-center justify-between mb-6 px-1">
                                    <h4 className="font-display text-xl italic text-stone-700">Fotos de Referencia</h4>
                                    <span className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">
                                        {selected.reference_images?.length || 0} fotos
                                    </span>
                                </header>
                                {selected.reference_images?.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-4">
                                        {selected.reference_images.map((img, i) => (
                                            <div
                                                key={i}
                                                onClick={() => setViewPhoto(img)}
                                                className="aspect-square rounded-[2rem] overflow-hidden border-2 border-white shadow-soft-sm hover:scale-[1.02] transition-transform cursor-zoom-in"
                                            >
                                                <img src={img} alt="Referencia" className="w-full h-full object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-12 bg-stone-50/50 rounded-[2rem] border-2 border-dashed border-stone-100 text-center flex flex-col items-center">
                                        <span className="material-symbols-outlined text-stone-200 mb-2">no_photography</span>
                                        <p className="text-stone-300 text-xs italic">No hay fotos de referencia</p>
                                    </div>
                                )}
                            </section>

                            {/* Notes */}
                            {selected.notes && (
                                <section className="p-6 rounded-[2rem] bg-amber-50/30 border border-amber-100/50 text-stone-600">
                                    <p className="text-[9px] uppercase tracking-widest font-bold text-amber-500 mb-2">Notas de la clienta</p>
                                    <p className="text-sm italic italic leading-relaxed">"{selected.notes}"</p>
                                </section>
                            )}
                        </div>

                        <footer className="p-8 border-t border-stone-100 bg-white sticky bottom-0 z-10 flex gap-4">
                            <button className="flex-1 py-4 rounded-2xl bg-stone-900 text-white font-display text-lg tracking-wide hover:bg-black transition-all shadow-lg active:scale-[0.98]">
                                Contactar WhatsApp
                            </button>
                            <button onClick={() => setSelected(null)} className="w-16 h-16 rounded-2xl bg-stone-50 flex items-center justify-center text-stone-400 hover:text-red-400 transition-colors">
                                <span className="material-symbols-outlined">delete</span>
                            </button>
                        </footer>
                    </div>
                )}
            </div>

            {/* Backdrop for detail view */}
            {selected && (
                <div
                    className="fixed inset-0 bg-stone-900/20 backdrop-blur-[2px] z-[90] animate-in fade-in transition-all"
                    onClick={() => setSelected(null)}
                />
            )}

            {/* Photo Gallery Modal */}
            {viewPhoto && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-8 lg:p-20">
                    <div className="absolute inset-0 bg-stone-900/95 backdrop-blur-md" onClick={() => setViewPhoto(null)} />
                    <button onClick={() => setViewPhoto(null)} className="absolute top-10 right-10 w-12 h-12 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all flex items-center justify-center">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                    <div className="relative w-full max-w-4xl max-h-full flex items-center justify-center animate-in zoom-in duration-300">
                        <img src={viewPhoto} alt="Zoom" className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl" />
                    </div>
                </div>
            )}

            <style jsx global>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}
