'use client';

import { useState } from 'react';
import { processPayment } from '../../lib/api';

const PAYMENT_METHODS = [
    { key: 'test', label: 'Pago de prueba', icon: '🧪', desc: 'Demo - siempre aprueba' },
    { key: 'mercadopago', label: 'MercadoPago', icon: '💙', desc: 'Pago con MercadoPago' },
    { key: 'credit_card', label: 'Tarjeta', icon: '💳', desc: 'Crédito / Débito' },
    { key: 'apple_pay', label: 'Apple Pay', icon: '🍎', desc: 'Pago rápido con Apple' },
];

export default function PaymentStep({ booking, onUpdate, onSuccess, onBack }) {
    const [method, setMethod] = useState('test');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const depositAmount = booking.depositAmount ||
        ((booking.service?.price || 0) * (booking.service?.deposit_percentage || 30) / 100);

    const handlePay = async () => {
        setError(null);
        setLoading(true);
        try {
            const result = await processPayment({
                booking_id: booking.bookingId,
                payment_method: method,
            });

            if (result.success) {
                onSuccess(booking.bookingId, depositAmount);
            } else {
                setError(result.message || 'El pago no fue aprobado.');
            }
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data?.error || 'Error al procesar el pago.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card card-body animate-fade-in">
            {/* Amount Display */}
            <div style={{
                textAlign: 'center',
                background: 'var(--gradient-rose)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
                marginBottom: 24,
            }}>
                <p className="text-sm" style={{ color: 'var(--brand-deep)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Depósito a pagar
                </p>
                <p style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--brand-deep)', lineHeight: 1.1 }}>
                    ${Number(depositAmount).toFixed(2)}
                </p>
                <p className="text-sm" style={{ color: 'var(--brand-deep)', opacity: 0.8, marginTop: 4 }}>
                    de ${Number(booking.service?.price || 0).toFixed(2)} total · {booking.service?.deposit_percentage || 30}% de depósito
                </p>
            </div>

            {/* Payment Methods */}
            <div style={{ marginBottom: 24 }}>
                <p className="form-label" style={{ marginBottom: 12 }}>¿Cómo quieres pagar?</p>
                <div className="payment-methods">
                    {PAYMENT_METHODS.map(pm => (
                        <div
                            key={pm.key}
                            className={`payment-method-card ${method === pm.key ? 'selected' : ''}`}
                            onClick={() => setMethod(pm.key)}
                            role="button"
                            tabIndex={0}
                        >
                            <span style={{ fontSize: '1.5rem' }}>{pm.icon}</span>
                            <div>
                                <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-neutral-800)' }}>{pm.label}</p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>{pm.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Policy note */}
            <div style={{
                background: 'var(--color-pink-50)',
                border: '1px solid var(--color-pink-100)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                marginBottom: 20,
                fontSize: '0.8125rem',
                color: 'var(--color-neutral-600)',
            }}>
                <p>📌 <strong>Política de depósito:</strong> El depósito confirma tu cita. El saldo restante se paga el día de la cita. Las fotos de referencia se pueden subir después del pago.</p>
            </div>

            {error && (
                <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: 16, fontSize: '0.875rem' }}>
                    ❌ {error}
                </div>
            )}

            <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn btn-outline" onClick={onBack} disabled={loading}>← Atrás</button>
                <button
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                    onClick={handlePay}
                    disabled={loading}
                >
                    {loading
                        ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Procesando...</>
                        : `Pagar $${Number(depositAmount).toFixed(2)} →`
                    }
                </button>
            </div>
        </div>
    );
}
