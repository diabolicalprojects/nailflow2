'use client';

import { useState, useEffect } from 'react';
import { getDashboardStats } from '../../lib/api';

export default function ClientManagement() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // En un caso real, tendríamos un endpoint getClients()
        // Por ahora usamos los stats o simulamos
        const token = localStorage.getItem('nailflow_token');
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

        fetch(`${API_URL}/api/dashboard/payments`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                // Extraer clientes únicos de los pagos como fallback si no hay endpoint de clientes
                const uniqueClients = [];
                const seen = new Set();
                data.forEach(p => {
                    if (p.client_name && !seen.has(p.client_name)) {
                        seen.add(p.client_name);
                        uniqueClients.push({
                            id: seen.size,
                            name: p.client_name,
                            phone: 'Sin registro', // No viene en el listado de pagos simple
                            lastVisit: p.created_at,
                            totalSpent: data.filter(x => x.client_name === p.client_name && x.payment_status === 'paid').reduce((s, x) => s + Number(x.amount), 0)
                        });
                    }
                });
                setClients(uniqueClients);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="animate-fade-in max-w-6xl mx-auto">
            {/* Header */}
            <header className="mb-12">
                <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-stone-400 mb-3">Gestión</p>
                <h1 className="text-4xl lg:text-5xl font-display italic text-stone-900 leading-tight">Clientas</h1>
            </header>

            {/* Actions & Search */}
            <div className="flex flex-col md:flex-row gap-6 mb-12 items-center justify-between">
                <div className="relative w-full max-w-md">
                    <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-stone-300">search</span>
                    <input
                        type="text"
                        placeholder="Buscar clienta por nombre..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-white/60 backdrop-blur-md border border-white rounded-full py-4 pl-16 pr-8 shadow-soft-sm outline-none focus:border-primary transition-all font-display italic text-stone-700"
                    />
                </div>

                <div className="bg-primary/5 text-primary text-[10px] font-bold px-6 py-3 rounded-full uppercase tracking-[0.1em] border border-primary/10">
                    {filteredClients.length} Total
                </div>
            </div>

            {/* Clients Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {Array(6).fill(0).map((_, i) => (
                        <div key={i} className="h-64 rounded-[3rem] bg-stone-100 animate-pulse" />
                    ))}
                </div>
            ) : filteredClients.length === 0 ? (
                <div className="bg-white/60 backdrop-blur-md rounded-[3rem] p-20 border border-white shadow-soft-lg text-center flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full bg-stone-50 flex items-center justify-center text-stone-200 mb-8">
                        <span className="material-symbols-outlined text-5xl">person_search</span>
                    </div>
                    <h2 className="font-display italic text-2xl text-stone-800 mb-3">No se encontraron clientas</h2>
                    <p className="text-stone-400 max-w-md mx-auto italic">Prueba con otro nombre o espera a que se registren nuevas reservas.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredClients.map(c => (
                        <div key={c.id} className="bg-white/60 backdrop-blur-md rounded-[3rem] p-8 border border-white shadow-soft-md hover:shadow-soft-lg transition-all group">
                            <div className="flex items-center gap-6 mb-8">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-2xl font-bold text-stone-600 shadow-soft-sm group-hover:scale-105 transition-transform">
                                    {c.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-display italic text-xl text-stone-800 leading-tight">{c.name}</h3>
                                    <p className="text-stone-400 text-[10px] font-bold uppercase tracking-widest mt-1">Miembro desde {new Date(c.lastVisit).getFullYear()}</p>
                                </div>
                            </div>

                            <div className="space-y-4 pt-6 border-t border-stone-50">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-stone-400 uppercase tracking-widest font-bold text-[9px]">Última visita</span>
                                    <span className="text-stone-600 font-display italic">{new Date(c.lastVisit).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-stone-400 uppercase tracking-widest font-bold text-[9px]">Total invertido</span>
                                    <span className="text-primary font-bold text-lg font-display">${c.totalSpent.toFixed(0)}</span>
                                </div>
                            </div>

                            <button className="w-full mt-8 py-4 rounded-2xl bg-stone-50 text-stone-400 text-xs font-bold uppercase tracking-widest hover:bg-stone-900 hover:text-white transition-all flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-base">history</span>
                                Ver Historial
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <style jsx global>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}
