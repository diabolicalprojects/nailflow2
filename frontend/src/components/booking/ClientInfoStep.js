'use client';

import { useState } from 'react';
import { createBooking } from '../../lib/api';

export default function ClientInfoStep({ booking, staff, onUpdate, onNext, onBack }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!booking.clientName.trim() || !booking.clientPhone.trim()) {
            setError('Nombre y teléfono son requeridos');
            return;
        }

        setLoading(true);
        try {
            const result = await createBooking({
                service_id: booking.service.id,
                staff_id: booking.staffId,
                booking_date: booking.date,
                start_time: booking.time,
                client_name: booking.clientName,
                client_phone: booking.clientPhone,
                client_email: booking.clientEmail,
                notes: booking.notes,
            });

            onUpdate({ bookingId: result.booking_id, depositAmount: result.deposit_amount });
            onNext();
        } catch (err) {
            const msg = err.response?.data?.error || 'Error al crear la reserva. Intenta de nuevo.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card card-body animate-fade-in">
            {/* Summary */}
            <div style={{
                background: 'var(--color-pink-50)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                marginBottom: 24,
                border: '1px solid var(--color-pink-100)',
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span className="text-sm text-muted">Servicio</span>
                    <span className="font-semibold text-sm">{booking.service?.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span className="text-sm text-muted">Fecha</span>
                    <span className="font-semibold text-sm">{booking.date}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span className="text-sm text-muted">Hora</span>
                    <span className="font-semibold text-sm">{booking.time}</span>
                </div>
                {staff && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span className="text-sm text-muted">Especialista</span>
                        <span className="font-semibold text-sm">{staff.name}</span>
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                    <label className="form-label">Nombre completo *</label>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="María García"
                        value={booking.clientName}
                        onChange={e => onUpdate({ clientName: e.target.value })}
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">WhatsApp / Teléfono *</label>
                    <input
                        type="tel"
                        className="form-input"
                        placeholder="+1 555 123 4567"
                        value={booking.clientPhone}
                        onChange={e => onUpdate({ clientPhone: e.target.value })}
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Email (opcional)</label>
                    <input
                        type="email"
                        className="form-input"
                        placeholder="maria@gmail.com"
                        value={booking.clientEmail}
                        onChange={e => onUpdate({ clientEmail: e.target.value })}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Notas (opcional)</label>
                    <textarea
                        className="form-input"
                        placeholder="¿Alguna alergia, diseño preferido?"
                        value={booking.notes}
                        onChange={e => onUpdate({ notes: e.target.value })}
                        rows={3}
                    />
                </div>

                {error && (
                    <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '12px 16px', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}>
                        ⚠️ {error}
                    </div>
                )}

                <div style={{ display: 'flex', gap: 12 }}>
                    <button className="btn btn-outline" type="button" onClick={onBack}>← Atrás</button>
                    <button className="btn btn-primary" type="submit" disabled={loading} style={{ flex: 1 }}>
                        {loading ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Guardando...</> : 'Continuar al pago →'}
                    </button>
                </div>
            </form>
        </div>
    );
}
