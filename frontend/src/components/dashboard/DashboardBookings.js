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
    if (payStatus === 'paid') return { label: 'Confirmada', color: 'text-green-600 bg-green-50', dot: 'bg-green-500' };
    if (status === 'cancelled') return { label: 'Cancelada', color: 'text-red-400 bg-red-50', dot: 'bg-red-400' };
    if (payStatus === 'failed') return { label: 'Pago Fallido', color: 'text-red-500 bg-red-50', dot: 'bg-red-500' };
    return { label: 'Pendiente', color: 'text-amber-500 bg-amber-50', dot: 'bg-amber-500' };
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
        <div className="animate-fade-in w-full max-w-[1600px] mx-auto relative min-h-screen pb-20">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                <div>
                    <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-stone-400 mb-3">Control de Citas</p>
                    <h1 className="text-4xl lg:text-7xl font-display italic text-stone-900 leading-tight">Agenda</h1>
                </div>

                <div className="flex items-center gap-4">
                    <nav className="flex bg-white/50 backdrop-blur-sm p-1.5 rounded-full border border-stone-100 shadow-soft-sm">
                        {FILTERS.map(f => (
                            <button
                                key={f.key}
                                onClick={() => setFilter(f.key)}
                                className={`px-6 py-3 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all ${filter === f.key ? 'bg-stone-900 text-white shadow-lg' : 'text-stone-400 hover:text-stone-600'}`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Content Sidebar Layout */}
            <div className="flex flex-col lg:flex-row gap-12 items-start">
                {/* Bookings List */}
                <div className={`flex-1 space-y-4 transition-all duration-500 ${selected ? 'lg:w-2/3' : 'w-full'}`}>
                    {loading ? (
                        <div className="space-y-6">
                            {Array(5).fill(0).map((_, i) => (
                                <div key={i} className="h-32 rounded-[2.5rem] bg-stone-100 animate-pulse" />
                            ))}
                        </div>
                    ) : bookings.length === 0 ? (
                        <div className="bg-white/40 backdrop-blur-md rounded-[3rem] p-24 border border-white shadow-soft-xl text-center flex flex-col items-center">
                            <div className="w-24 h-24 rounded-full bg-stone-50 flex items-center justify-center text-stone-200 mb-8 border border-stone-100">
                                <span className="material-symbols-outlined text-5xl">event_busy</span>
                            </div>
                            <h2 className="font-display italic text-3xl text-stone-800 mb-4">Agenda Vacía</h2>
                            <p className="text-stone-400 max-w-sm mx-auto italic leading-relaxed">No hay citas en esta categoría. Las nuevas reservas aparecerán aquí automáticamente.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {bookings.map(b => {
                                const badge = statusBadge(b.status, b.payment_status);
                                const isSelected = selected?.id === b.id;
                                return (
                                    <div
                                        key={b.id}
                                        onClick={() => setSelected(b)}
                                        className={`flex flex-col sm:flex-row items-center gap-8 p-8 rounded-[2.5rem] transition-all duration-300 group cursor-pointer border ${isSelected ? 'bg-white border-primary shadow-soft-xl ring-2 ring-primary/5' : 'bg-white/60 border-white hover:border-primary/30 hover:bg-white hover:shadow-soft-lg'}`}
                                    >
                                        {/* Date/Time Block */}
                                        <div className="flex flex-col items-center min-w-[100px] border-b sm:border-b-0 sm:border-r border-stone-100 pb-4 sm:pb-0 sm:pr-8">
                                            <p className="text-2xl font-display font-bold text-stone-900 leading-none mb-2">{b.start_time?.slice(0, 5)}</p>
                                            <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold whitespace-nowrap">
                                                {new Date(b.booking_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                                            </p>
                                        </div>

                                        {/* Client Info */}
                                        <div className="flex items-center gap-6 flex-1 w-full">
                                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-stone-100 to-stone-50 flex items-center justify-center font-bold text-stone-400 text-xl border-4 border-white shadow-soft-sm uppercase">
                                                {b.client_name?.charAt(0)}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-display italic text-2xl text-stone-800 leading-tight mb-2">{b.client_name}</h3>
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <span className="text-primary text-[10px] font-bold uppercase tracking-widest bg-primary/5 px-3 py-1 rounded-lg">
                                                        {b.service_name}
                                                    </span>
                                                    <div className="w-1 h-1 rounded-full bg-stone-200"></div>
                                                    <span className="text-stone-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                                                        <span className="material-symbols-outlined text-sm">face</span>
                                                        {b.staff_name || 'Sin asignar'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status & Action */}
                                        <div className="flex items-center gap-8 w-full sm:w-auto justify-between sm:justify-end">
                                            <div className={`px-5 py-2.5 rounded-2xl flex items-center gap-3 ${badge.color}`}>
                                                <div className={`w-2 h-2 rounded-full ${badge.dot}`}></div>
                                                <span className="text-[10px] font-bold uppercase tracking-widest">{badge.label}</span>
                                            </div>
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isSelected ? 'bg-primary text-white shadow-lg rotate-90' : 'bg-stone-50 text-stone-300 group-hover:text-primary group-hover:bg-primary/5'}`}>
                                                <span className="material-symbols-outlined font-bold">chevron_right</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Right Sidebar Details (Desktop integrated, Mobile overlay) */}
                <div
                    className={`fixed lg:sticky top-0 lg:top-8 right-0 h-screen lg:h-[calc(100vh-4rem)] w-full lg:w-[450px] bg-white lg:rounded-[3.5rem] shadow-2xl lg:shadow-soft-2xl z-[100] transform transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] border-l lg:border border-stone-100 ${selected ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 lg:hidden'}`}
                >
                    {selected && (
                        <div className="h-full flex flex-col relative overflow-hidden">
                            {/* Decorative background for detail */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>

                            <header className="p-8 border-b border-stone-50 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
                                <div>
                                    <h2 className="font-display italic text-3xl text-stone-800 leading-tight">Cita de {selected.client_name.split(' ')[0]}</h2>
                                    <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-stone-400 mt-2">ID Registro: #{selected.id}</p>
                                </div>
                                <button
                                    onClick={() => setSelected(null)}
                                    className="w-12 h-12 rounded-full bg-stone-50 hover:bg-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-900 transition-all border border-stone-100 shadow-soft-sm"
                                >
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </header>

                            <div className="flex-1 overflow-y-auto p-8 lg:p-10 scrollbar-hide space-y-12 pb-32">
                                {/* Service Spotlight */}
                                <section className="relative">
                                    <div className="p-10 rounded-[3rem] bg-stone-900 text-white relative overflow-hidden shadow-2xl">
                                        {selected.service_image && (
                                            <img
                                                src={selected.service_image}
                                                alt=""
                                                className="absolute inset-0 w-full h-full object-cover opacity-20 blur-[2px]"
                                            />
                                        )}
                                        <div className="absolute top-0 right-0 p-8 opacity-10">
                                            <span className="material-symbols-outlined text-8xl">auto_awesome</span>
                                        </div>
                                        <div className="relative z-10">
                                            <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary/80 mb-4">Tratamiento</p>
                                            <h3 className="text-3xl font-display italic leading-tight mb-10">{selected.service_name}</h3>

                                            <div className="grid grid-cols-2 gap-6 pt-10 border-t border-white/10">
                                                <div>
                                                    <p className="text-[10px] uppercase font-bold tracking-widest text-white/30 mb-2">FECHA/HORA</p>
                                                    <p className="text-lg font-display italic">{new Date(selected.booking_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} • {selected.start_time.slice(0, 5)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] uppercase font-bold tracking-widest text-white/30 mb-2">PAGO SEÑA</p>
                                                    <p className="text-3xl font-display font-medium text-primary">${Number(selected.deposit_amount).toFixed(0)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* Client Contacts */}
                                <section className="space-y-6">
                                    <h4 className="font-display text-xl italic text-stone-700">Información del Cliente</h4>
                                    <div className="glass p-8 rounded-[2.5rem] border border-stone-100 space-y-6">
                                        <div className="flex items-center gap-5">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                <span className="material-symbols-outlined text-xl">person</span>
                                            </div>
                                            <p className="font-medium text-stone-800">{selected.client_name}</p>
                                        </div>
                                        <div className="flex items-center gap-5">
                                            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                                                <span className="material-symbols-outlined text-xl">call</span>
                                            </div>
                                            <p className="font-medium text-stone-800">{selected.client_phone}</p>
                                        </div>
                                        <div className="flex items-center gap-5">
                                            <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-500">
                                                <span className="material-symbols-outlined text-xl">face</span>
                                            </div>
                                            <p className="font-medium text-stone-800">Staff: {selected.staff_name || 'No asignado'}</p>
                                        </div>
                                    </div>
                                </section>

                                {/* Visual Reference - THE IMPORTANT PART */}
                                <section>
                                    <div className="flex items-center justify-between mb-6">
                                        <h4 className="font-display text-xl italic text-stone-700">Inspiración</h4>
                                        <span className="text-[10px] font-bold bg-stone-100 text-stone-500 px-3 py-1 rounded-full">
                                            {selected.reference_images?.length || 0} ARCHIVOS
                                        </span>
                                    </div>

                                    {selected.reference_images?.length > 0 ? (
                                        <div className="grid grid-cols-2 gap-4">
                                            {selected.reference_images.map((img, i) => (
                                                <div
                                                    key={i}
                                                    onClick={() => setViewPhoto(img)}
                                                    className="aspect-square rounded-[2rem] overflow-hidden border-2 border-white shadow-soft-md hover:scale-[1.05] transition-transform duration-500 cursor-zoom-in"
                                                >
                                                    <img src={img} alt="Referencia" className="w-full h-full object-cover" />
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-12 bg-stone-50/50 rounded-[2.5rem] border-2 border-dashed border-stone-100 text-center flex flex-col items-center">
                                            <span className="material-symbols-outlined text-stone-200 text-4xl mb-3">auto_fix_off</span>
                                            <p className="text-stone-300 text-[10px] font-bold uppercase tracking-widest">Sin fotos de referencia</p>
                                        </div>
                                    )}
                                </section>

                                {/* Internal Notes */}
                                {selected.notes && (
                                    <section className="bg-amber-50/30 border border-amber-100 rounded-[2.5rem] p-8">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-3 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-sm">edit_note</span>
                                            Nota Adicional
                                        </p>
                                        <p className="text-sm italic text-stone-600 leading-relaxed font-medium">"{selected.notes}"</p>
                                    </section>
                                )}
                            </div>

                            {/* Action Footer */}
                            <footer className="p-8 border-t border-stone-50 bg-white/80 backdrop-blur-md sticky bottom-0 z-10 flex gap-4">
                                <a
                                    href={`https://wa.me/${selected.client_phone?.replace(/[^\d]/g, '')}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex-1 bg-green-500 text-white py-5 rounded-2xl font-display text-lg tracking-wide hover:bg-green-600 transition-all shadow-lg flex items-center justify-center gap-3 active:scale-[0.98]"
                                >
                                    <span className="material-symbols-outlined">chat</span>
                                    WhatsApp
                                </a>
                                <button
                                    className="w-16 h-16 rounded-2xl bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center shadow-lg active:scale-[0.98]"
                                >
                                    <span className="material-symbols-outlined text-2xl">delete</span>
                                </button>
                            </footer>
                        </div>
                    )}
                </div>
            </div>

            {/* Photo Zoom Modal */}
            {viewPhoto && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-8 lg:p-20">
                    <div className="absolute inset-0 bg-stone-950/95 backdrop-blur-xl" onClick={() => setViewPhoto(null)} />
                    <button
                        onClick={() => setViewPhoto(null)}
                        className="absolute top-10 right-10 w-16 h-16 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all flex items-center justify-center z-10"
                    >
                        <span className="material-symbols-outlined text-3xl">close</span>
                    </button>
                    <div className="relative w-full max-w-5xl max-h-full flex items-center justify-center animate-in zoom-in duration-500">
                        <img src={viewPhoto} alt="Zoom" className="max-w-full max-h-[85vh] object-contain rounded-3xl shadow-2xl ring-1 ring-white/10" />
                    </div>
                </div>
            )}

            <style jsx global>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                .glass {
                    background: rgba(255, 255, 255, 0.45);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border: 1px solid rgba(255, 255, 255, 0.5);
                }
            `}</style>
        </div>
    );
}
