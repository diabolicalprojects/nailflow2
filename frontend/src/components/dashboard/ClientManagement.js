'use client';

import { useState, useEffect } from 'react';

export default function ClientManagement() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClient, setSelectedClient] = useState(null);
    const [clientHistory, setClientHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    useEffect(() => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('nailflow_token') : null;
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

        fetch(`${API_URL}/api/dashboard/payments`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                const uniqueClients = [];
                const seen = new Set();
                data.forEach(p => {
                    if (p.client_name && !seen.has(p.client_name)) {
                        seen.add(p.client_name);
                        uniqueClients.push({
                            id: seen.size,
                            name: p.client_name,
                            phone: p.client_phone || 'Sin registro',
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

    useEffect(() => {
        if (selectedClient) {
            setHistoryLoading(true);
            const token = typeof window !== 'undefined' ? localStorage.getItem('nailflow_token') : null;
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

            fetch(`${API_URL}/api/dashboard/bookings?client_name=${encodeURIComponent(selectedClient.name)}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => setClientHistory(data))
                .catch(console.error)
                .finally(() => setHistoryLoading(false));
        }
    }, [selectedClient]);

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="animate-fade-in max-w-[1600px] mx-auto relative min-h-screen pb-20">
            <header className="mb-12">
                <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-stone-400 mb-3">Relaciones</p>
                <h1 className="text-4xl lg:text-7xl font-display italic text-stone-900 leading-tight">Clientas</h1>
            </header>

            <div className="flex flex-col lg:flex-row gap-12">
                <div className={`flex-1 transition-all duration-500 ${selectedClient ? 'lg:w-2/3' : 'w-full'}`}>
                    <div className="flex flex-col md:flex-row gap-6 mb-12 items-center justify-between">
                        <div className="relative w-full max-w-md">
                            <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-stone-300">search</span>
                            <input
                                type="text"
                                placeholder="Buscar por nombre..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full bg-white/60 backdrop-blur-md border border-white rounded-[2rem] py-5 pl-16 pr-8 shadow-soft-sm outline-none focus:border-primary transition-all font-display italic text-lg text-stone-700 font-medium"
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {Array(4).fill(0).map((_, i) => (
                                <div key={i} className="h-64 rounded-[3rem] bg-stone-100 animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {filteredClients.map(c => (
                                <div key={c.id} className={`bg-white/60 backdrop-blur-md rounded-[3rem] p-8 border transition-all group ${selectedClient?.id === c.id ? 'border-primary ring-2 ring-primary/5 shadow-soft-xl' : 'border-white hover:border-primary/30 shadow-soft-md hover:shadow-soft-lg'}`}>
                                    <div className="flex items-center gap-6 mb-8">
                                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-3xl font-bold text-stone-600 shadow-soft-sm group-hover:scale-105 transition-transform uppercase">
                                            {c.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-display italic text-2xl text-stone-800 leading-tight">{c.name}</h3>
                                            <p className="text-stone-400 text-[10px] font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                                                <span className="material-symbols-outlined text-sm">schedule</span>
                                                Última: {new Date(c.lastVisit).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-6 border-t border-stone-50">
                                        <div className="flex justify-between items-center">
                                            <span className="text-stone-400 uppercase tracking-widest font-bold text-[9px]">Inversión Total</span>
                                            <span className="text-primary font-bold text-2xl font-display">${c.totalSpent.toFixed(0)}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setSelectedClient(c)}
                                        className={`w-full mt-8 py-5 rounded-[1.8rem] text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${selectedClient?.id === c.id ? 'bg-stone-900 text-white' : 'bg-stone-50 text-stone-400 hover:bg-stone-900 hover:text-white'}`}
                                    >
                                        <span className="material-symbols-outlined text-base">history</span>
                                        Historial de Visitas
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* History Sidebar */}
                <div
                    className={`fixed lg:sticky top-0 lg:top-8 right-0 h-screen lg:h-[calc(100vh-4rem)] w-full lg:w-[450px] bg-white lg:rounded-[3.5rem] shadow-2xl z-[110] transform transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] border-l lg:border border-stone-100 ${selectedClient ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 lg:hidden'}`}
                >
                    {selectedClient && (
                        <div className="h-full flex flex-col relative overflow-hidden">
                            <header className="p-10 border-b border-stone-50 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-20">
                                <div>
                                    <h2 className="font-display italic text-3xl text-stone-800 leading-tight">{selectedClient.name}</h2>
                                    <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-stone-400 mt-2">Historial de Visitas</p>
                                </div>
                                <button
                                    onClick={() => setSelectedClient(null)}
                                    className="w-12 h-12 rounded-full bg-stone-50 hover:bg-stone-100 flex items-center justify-center text-stone-400 transition-all border border-stone-100 shadow-soft-sm"
                                >
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </header>

                            <div className="flex-1 overflow-y-auto p-10 scrollbar-hide space-y-6">
                                {historyLoading ? (
                                    <div className="space-y-4">
                                        {[1, 2, 3].map(i => <div key={i} className="h-24 bg-stone-50 rounded-3xl animate-pulse" />)}
                                    </div>
                                ) : clientHistory.length === 0 ? (
                                    <p className="text-center py-20 text-stone-300 font-display italic text-lg">No hay registros de visitas.</p>
                                ) : (
                                    clientHistory.map(h => (
                                        <div key={h.id} className="p-6 rounded-3xl border border-stone-100 hover:border-primary/20 transition-colors bg-stone-50/30 group">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <p className="text-xs font-bold text-stone-700 uppercase tracking-tighter">{h.service_name}</p>
                                                    <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-1">
                                                        {new Date(h.booking_date).toLocaleDateString()} • {h.start_time.slice(0, 5)}
                                                    </p>
                                                </div>
                                                <div className={`text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter ${h.payment_status === 'paid' ? 'bg-green-100 text-green-600' : 'bg-primary/10 text-primary'}`}>
                                                    {h.payment_status === 'paid' ? 'Pagado' : 'Seña'}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="material-symbols-outlined text-sm text-primary">face</span>
                                                <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">{h.staff_name}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style jsx global>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}
