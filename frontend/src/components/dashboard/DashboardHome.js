'use client';

import { useState, useEffect } from 'react';
import { getDashboardStats, getDashboardBookings } from '../../lib/api';

function StatCard({ icon, value, label, color }) {
    return (
        <div className="stat-card">
            <div className="stat-icon" style={{ fontSize: '1.5rem' }}>{icon}</div>
            <div className="stat-value" style={{ color: color || 'var(--color-neutral-900)' }}>
                {value}
            </div>
            <div className="stat-label">{label}</div>
        </div>
    );
}

export default function DashboardHome() {
    const [stats, setStats] = useState(null);
    const [recentBookings, setRecentBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([getDashboardStats(), getDashboardBookings({})])
            .then(([s, b]) => {
                setStats(s);
                setRecentBookings(b.slice(0, 5));
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const statusBadge = (status, payStatus) => {
        if (payStatus === 'paid') return <span className="badge badge-green">Confirmada</span>;
        if (status === 'cancelled') return <span className="badge badge-red">Cancelada</span>;
        if (payStatus === 'failed') return <span className="badge badge-red">Pago fallido</span>;
        return <span className="badge badge-amber">Pendiente</span>;
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Dashboard</h1>
                <p className="page-subtitle">Bienvenida, aquí está el resumen de tu estudio 💅</p>
            </div>

            {loading ? (
                <div className="stats-grid">
                    {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: 140 }} />)}
                </div>
            ) : (
                <div className="stats-grid">
                    <StatCard icon="📅" value={stats?.total_bookings ?? 0} label="Total de Citas" />
                    <StatCard icon="✅" value={stats?.paid_bookings ?? 0} label="Citas Confirmadas" color="var(--brand-deep)" />
                    <StatCard icon="💰" value={`$${Number(stats?.total_revenue ?? 0).toFixed(0)}`} label="Ingresos por Depósitos" />
                    <StatCard icon="👤" value={stats?.total_clients ?? 0} label="Clientes Registradas" />
                </div>
            )}

            {/* Recent Bookings */}
            <div className="table-container">
                <div className="table-header">
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 600 }}>
                        Citas Recientes
                    </h2>
                    <button className="btn btn-secondary btn-sm">Ver todas</button>
                </div>

                {loading ? (
                    <div style={{ padding: 24 }}>
                        {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 56, marginBottom: 8 }} />)}
                    </div>
                ) : recentBookings.length === 0 ? (
                    <div style={{ padding: '48px', textAlign: 'center', color: 'var(--color-neutral-500)' }}>
                        <p style={{ fontSize: '2rem', marginBottom: 8 }}>📅</p>
                        <p>No hay citas recientes</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Cliente</th>
                                    <th>Servicio</th>
                                    <th>Fecha</th>
                                    <th>Hora</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentBookings.map(b => (
                                    <tr key={b.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div className="avatar" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>
                                                    {b.client_name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{b.client_name}</p>
                                                    <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>{b.client_phone}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ fontWeight: 500 }}>{b.service_name}</td>
                                        <td>{b.booking_date}</td>
                                        <td>{b.start_time?.slice(0, 5)}</td>
                                        <td>{statusBadge(b.status, b.payment_status)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
