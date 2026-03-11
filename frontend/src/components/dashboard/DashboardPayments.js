'use client';

import { useState, useEffect } from 'react';
import { getPayments } from '../../lib/api';

function StatItem({ label, value, icon, color = 'text-primary' }) {
    return (
        <div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] p-8 border border-white shadow-soft-md flex flex-col gap-4 group hover:shadow-soft-lg transition-all">
            <div className={`w-12 h-12 rounded-2xl bg-white shadow-soft-sm flex items-center justify-center ${color}`}>
                <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">{icon}</span>
            </div>
            <div>
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400 mb-1">{label}</p>
                <p className="text-3xl font-display font-medium text-stone-900 leading-tight">{value}</p>
            </div>
        </div>
    );
}

export default function DashboardPayments() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getPayments().then(setPayments).catch(console.error).finally(() => setLoading(false));
    }, []);

    const total = payments.filter(p => p.payment_status === 'paid').reduce((s, p) => s + Number(p.amount), 0);

    return (
        <div className="animate-fade-in max-w-6xl mx-auto">
            {/* Header */}
            <header className="mb-12">
                <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-stone-400 mb-3">Finanzas</p>
                <h1 className="text-4xl lg:text-5xl font-display italic text-stone-900 leading-tight">Pagos</h1>
            </header>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                <StatItem label="Total Recaudado" value={`$${total.toFixed(0)}`} icon="payments" color="text-amber-600" />
                <StatItem label="Pagos Exitosos" value={payments.filter(p => p.payment_status === 'paid').length} icon="check_circle" color="text-green-500" />
                <StatItem label="Pagos Fallidos" value={payments.filter(p => p.payment_status === 'failed').length} icon="error" color="text-red-400" />
            </div>

            {/* Payments List */}
            <section className="bg-white/60 backdrop-blur-md rounded-[3rem] p-8 lg:p-12 border border-white shadow-soft-lg">
                <div className="mb-10 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-display font-medium text-stone-800 italic">Historial de Transacciones</h2>
                        <p className="text-stone-400 text-xs mt-1 italic leading-relaxed">Registro detallado de todos los anticipos recibidos.</p>
                    </div>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {Array(5).fill(0).map((_, i) => <div key={i} className="h-16 rounded-2xl bg-stone-50 animate-pulse" />)}
                    </div>
                ) : payments.length === 0 ? (
                    <div className="py-20 text-center flex flex-col items-center">
                        <div className="w-20 h-20 rounded-full bg-stone-50 flex items-center justify-center text-stone-200 mb-6">
                            <span className="material-symbols-outlined text-4xl">credit_card</span>
                        </div>
                        <p className="font-display italic text-stone-300 text-lg">No hay pagos registrados aún.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto -mx-8 lg:-mx-12 scrollbar-hide">
                        <table className="w-full min-w-[800px] border-separate border-spacing-y-4 px-8 lg:px-12">
                            <thead>
                                <tr className="text-[10px] uppercase tracking-[0.25em] font-bold text-stone-300 text-left">
                                    <th className="px-6 pb-2">Cliente / Servicio</th>
                                    <th className="px-6 pb-2">Monto</th>
                                    <th className="px-6 pb-2">Método</th>
                                    <th className="px-6 pb-2">Estado</th>
                                    <th className="px-6 pb-2">Fecha</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.map(p => (
                                    <tr key={p.id} className="group">
                                        <td className="bg-white/40 group-hover:bg-white/80 rounded-l-[1.5rem] px-6 py-5 border-y border-l border-stone-50 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center text-stone-400 font-bold border border-white">
                                                    {p.client_name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-display font-bold text-stone-800 ">{p.client_name}</p>
                                                    <p className="text-[10px] text-stone-400 italic">{p.service_name}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="bg-white/40 group-hover:bg-white/80 px-6 py-5 border-y border-stone-50 transition-all">
                                            <span className="font-display font-medium text-lg text-stone-900">${Number(p.amount).toFixed(0)}</span>
                                        </td>
                                        <td className="bg-white/40 group-hover:bg-white/80 px-6 py-5 border-y border-stone-50 transition-all">
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-stone-300 text-lg">
                                                    {p.payment_method === 'mercadopago' ? 'universal_currency_alt' : 'credit_card'}
                                                </span>
                                                <span className="text-[10px] uppercase tracking-widest font-bold text-stone-500">{p.payment_method?.replace('_', ' ') || 'Prueba'}</span>
                                            </div>
                                        </td>
                                        <td className="bg-white/40 group-hover:bg-white/80 px-6 py-5 border-y border-stone-50 transition-all">
                                            <span className={`px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-wider ${p.payment_status === 'paid' ? 'bg-green-50 text-green-600' : p.payment_status === 'failed' ? 'bg-red-50 text-red-500' : 'bg-stone-50 text-stone-400'}`}>
                                                {p.payment_status === 'paid' ? 'Confirmado' : p.payment_status === 'failed' ? 'Fallido' : 'Pendiente'}
                                            </span>
                                        </td>
                                        <td className="bg-white/40 group-hover:bg-white/80 rounded-r-[1.5rem] px-6 py-5 border-y border-r border-stone-50 transition-all text-stone-400 text-[11px] font-medium font-display">
                                            {new Date(p.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}
