'use client';

import { useState, useEffect } from 'react';
import { getDashboardStats, getDashboardBookings } from '../../lib/api';

function StatCard({ icon, value, label, color, bgColor }) {
    return (
        <div style={{
            backgroundColor: 'white',
            borderRadius: '24px',
            padding: '28px',
            border: '1px solid rgba(230, 164, 180, 0.1)',
            boxShadow: '0 8px 24px rgba(230, 164, 180, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: bgColor || '#FAF3F0',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                color: color || '#E6A4B4'
            }}>
                <span className="material-symbols-outlined">{icon}</span>
            </div>
            <div>
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#4B3F3A', lineHeight: 1 }}>
                    {value}
                </div>
                <div style={{ fontSize: '13px', color: '#A0928D', fontWeight: 500, marginTop: '4px' }}>
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
        const baseStyle = {
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
        };

        if (payStatus === 'paid') return <span style={{ ...baseStyle, backgroundColor: '#D6F1D8', color: '#27502B' }}>Confirmada</span>;
        if (status === 'cancelled') return <span style={{ ...baseStyle, backgroundColor: '#FCE4E4', color: '#E07A7A' }}>Cancelada</span>;
        if (payStatus === 'failed') return <span style={{ ...baseStyle, backgroundColor: '#FCE4E4', color: '#E07A7A' }}>Pago Fallido</span>;
        return <span style={{ ...baseStyle, backgroundColor: '#FEF3C7', color: '#B45309' }}>Pendiente</span>;
    };

    return (
        <div>
            <header style={{ marginBottom: '40px' }}>
                <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '32px', color: '#4B3F3A', marginBottom: '4px' }}>
                    Bienvenida de nuevo 💅
                </h1>
                <p style={{ fontSize: '14px', color: '#A0928D' }}>Aquí tienes lo que está pasando hoy en tu estudio.</p>
            </header>

            {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '40px' }}>
                    {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: 140, borderRadius: '24px' }} />)}
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '40px' }}>
                    <StatCard icon="event" value={stats?.total_bookings ?? 0} label="Total de Citas" />
                    <StatCard icon="verified" value={stats?.paid_bookings ?? 0} label="Confirmadas" color="#27502B" bgColor="#D6F1D8" />
                    <StatCard icon="account_balance_wallet" value={`$${Number(stats?.total_revenue ?? 0).toFixed(0)}`} label="Recaudado (Depósitos)" color="#4B3F3A" bgColor="#F3D7CA" />
                    <StatCard icon="person_celebrate" value={stats?.total_clients ?? 0} label="Clientas Lindas" />
                </div>
            )}

            {/* Recent Bookings */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '32px',
                padding: '32px',
                border: '1px solid rgba(230, 164, 180, 0.1)',
                boxShadow: '0 8px 32px rgba(230, 164, 180, 0.05)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '20px', color: '#4B3F3A' }}>
                        Próximas Citas
                    </h2>
                    <button style={{
                        border: 'none',
                        background: 'transparent',
                        color: '#E6A4B4',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer'
                    }}>Ver todas</button>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 64, borderRadius: '16px' }} />)}
                    </div>
                ) : recentBookings.length === 0 ? (
                    <div style={{ padding: '60px', textAlign: 'center', color: '#A0928D' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '48px', opacity: 0.3, marginBottom: '12px' }}>calendar_month</span>
                        <p style={{ fontSize: '15px' }}>Tu agenda está limpia por ahora.</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '1px solid #FAF3F0' }}>
                                    <th style={{ padding: '12px 16px', fontSize: '11px', color: '#D1C8C5', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Cliente</th>
                                    <th style={{ padding: '12px 16px', fontSize: '11px', color: '#D1C8C5', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Servicio</th>
                                    <th style={{ padding: '12px 16px', fontSize: '11px', color: '#D1C8C5', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Fecha / Hora</th>
                                    <th style={{ padding: '12px 16px', fontSize: '11px', color: '#D1C8C5', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentBookings.map(b => (
                                    <tr key={b.id} style={{ borderBottom: '1px solid #FAF3F0' }}>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{
                                                    width: '36px',
                                                    height: '36px',
                                                    borderRadius: '50%',
                                                    backgroundColor: '#F3D7CA',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '12px',
                                                    fontWeight: 700,
                                                    color: '#4B3F3A'
                                                }}>
                                                    {b.client_name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p style={{ fontWeight: 600, fontSize: '14px', margin: 0 }}>{b.client_name}</p>
                                                    <p style={{ fontSize: '12px', color: '#A0928D', margin: 0 }}>{b.client_phone}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px', fontSize: '14px', fontWeight: 500 }}>{b.service_name}</td>
                                        <td style={{ padding: '16px', fontSize: '14px' }}>
                                            <p style={{ margin: 0, fontWeight: 500 }}>{b.booking_date}</p>
                                            <p style={{ margin: 0, fontSize: '12px', color: '#A0928D' }}>{b.start_time?.slice(0, 5)} hrs</p>
                                        </td>
                                        <td style={{ padding: '16px' }}>{statusBadge(b.status, b.payment_status)}</td>
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
