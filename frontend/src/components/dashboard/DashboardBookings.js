'use client';

import { useState, useEffect } from 'react';
import { getDashboardBookings } from '../../lib/api';

const STATUS_COLORS = {
    confirmed: 'badge-green',
    pending: 'badge-amber',
    cancelled: 'badge-red',
};

const PAY_COLORS = {
    paid: 'badge-green',
    pending: 'badge-amber',
    failed: 'badge-red',
};

export default function DashboardBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const params = filter !== 'all' ? { status: filter } : {};
        getDashboardBookings(params)
            .then(setBookings)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [filter]);

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Reservas</h1>
                <p className="page-subtitle">Gestiona todas las citas de tu estudio</p>
            </div>

            <div className="table-container">
                <div className="table-header">
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {['all', 'pending', 'confirmed', 'cancelled'].map(s => (
                            <button
                                key={s}
                                className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-outline'}`}
                                onClick={() => { setFilter(s); setLoading(true); }}
                            >
                                {s === 'all' ? 'Todas' : s === 'pending' ? 'Pendientes' : s === 'confirmed' ? 'Confirmadas' : 'Canceladas'}
                            </button>
                        ))}
                    </div>
                    <span className="badge badge-neutral">{bookings.length} citas</span>
                </div>

                {loading ? (
                    <div style={{ padding: 24 }}>
                        {[1, 2, 3, 4, 5].map(i => <div key={i} className="skeleton" style={{ height: 60, marginBottom: 8 }} />)}
                    </div>
                ) : bookings.length === 0 ? (
                    <div style={{ padding: '60px', textAlign: 'center', color: 'var(--color-neutral-500)' }}>
                        <p style={{ fontSize: '3rem', marginBottom: 12 }}>📅</p>
                        <p style={{ fontWeight: 600 }}>No hay citas</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Cliente</th>
                                    <th>Servicio</th>
                                    <th>Especialista</th>
                                    <th>Fecha / Hora</th>
                                    <th>Depósito</th>
                                    <th>Estado</th>
                                    <th>Pago</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map(b => (
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
                                        <td style={{ color: 'var(--color-neutral-600)' }}>{b.staff_name || '—'}</td>
                                        <td>
                                            <p style={{ fontWeight: 500 }}>{b.booking_date}</p>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--color-neutral-400)' }}>{b.start_time?.slice(0, 5)}</p>
                                        </td>
                                        <td style={{ fontWeight: 600, color: 'var(--brand-deep)' }}>
                                            ${Number(b.deposit_amount || 0).toFixed(2)}
                                        </td>
                                        <td><span className={`badge ${STATUS_COLORS[b.status] || 'badge-neutral'}`}>{b.status}</span></td>
                                        <td><span className={`badge ${PAY_COLORS[b.payment_status] || 'badge-neutral'}`}>{b.payment_status}</span></td>
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
