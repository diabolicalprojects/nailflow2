'use client';

import { useState, useEffect } from 'react';
import { getPayments } from '../../lib/api';

export default function DashboardPayments() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getPayments().then(setPayments).catch(console.error).finally(() => setLoading(false));
    }, []);

    const total = payments.filter(p => p.payment_status === 'paid').reduce((s, p) => s + Number(p.amount), 0);

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Pagos</h1>
                <p className="page-subtitle">Historial de depósitos recibidos</p>
            </div>

            {/* Quick Stats */}
            <div className="stats-grid" style={{ marginBottom: 24 }}>
                <div className="stat-card">
                    <div className="stat-icon">💰</div>
                    <div className="stat-value">${total.toFixed(2)}</div>
                    <div className="stat-label">Total Recaudado</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">✅</div>
                    <div className="stat-value">{payments.filter(p => p.payment_status === 'paid').length}</div>
                    <div className="stat-label">Pagos Exitosos</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">❌</div>
                    <div className="stat-value">{payments.filter(p => p.payment_status === 'failed').length}</div>
                    <div className="stat-label">Pagos Fallidos</div>
                </div>
            </div>

            <div className="table-container">
                <div className="table-header">
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 600 }}>Historial de Pagos</h2>
                </div>
                {loading ? (
                    <div style={{ padding: 24 }}>
                        {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 56, marginBottom: 8 }} />)}
                    </div>
                ) : payments.length === 0 ? (
                    <div style={{ padding: '48px', textAlign: 'center', color: 'var(--color-neutral-500)' }}>
                        <p style={{ fontSize: '2.5rem', marginBottom: 8 }}>💳</p>
                        <p>No hay pagos registrados</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Cliente</th>
                                    <th>Servicio</th>
                                    <th>Monto</th>
                                    <th>Método</th>
                                    <th>Estado</th>
                                    <th>Fecha</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.map(p => (
                                    <tr key={p.id}>
                                        <td style={{ fontWeight: 500 }}>{p.client_name}</td>
                                        <td>{p.service_name}</td>
                                        <td style={{ fontWeight: 700, color: 'var(--brand-deep)' }}>${Number(p.amount).toFixed(2)}</td>
                                        <td>
                                            <span className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>
                                                {p.payment_method?.replace('_', ' ') || '—'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${p.payment_status === 'paid' ? 'badge-green' : p.payment_status === 'failed' ? 'badge-red' : 'badge-amber'}`}>
                                                {p.payment_status === 'paid' ? '✓ Aprobado' : p.payment_status === 'failed' ? '✗ Fallido' : 'Pendiente'}
                                            </span>
                                        </td>
                                        <td style={{ color: 'var(--color-neutral-500)', fontSize: '0.875rem' }}>
                                            {new Date(p.created_at).toLocaleDateString('es')}
                                        </td>
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
