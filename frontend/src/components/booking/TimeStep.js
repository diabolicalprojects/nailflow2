'use client';

import { useState, useEffect } from 'react';
import { getAvailability, getAllStaff } from '../../lib/api';

export default function TimeStep({ date, staffId, serviceDuration, selected, onSelect, onBack }) {
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedStaffId, setSelectedStaffId] = useState(staffId);
    const [allStaff, setAllStaff] = useState([]);
    const [loadingStaff, setLoadingStaff] = useState(!staffId);

    useEffect(() => {
        if (!staffId) {
            getAllStaff().then(setAllStaff).catch(console.error).finally(() => setLoadingStaff(false));
        }
    }, [staffId]);

    useEffect(() => {
        if (!date || !selectedStaffId) return;
        setLoading(true);
        getAvailability(date, selectedStaffId)
            .then(data => setSlots(data.available_slots || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [date, selectedStaffId]);

    return (
        <div className="card card-body animate-fade-in">
            <div style={{ marginBottom: 20 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: 4 }}>Selecciona un horario</h3>
                <p className="text-sm text-muted">Fecha: <strong>{date}</strong></p>
            </div>

            {/* Staff selection if not pre-assigned */}
            {!staffId && (
                <div className="form-group" style={{ marginBottom: 20 }}>
                    <label className="form-label">Especialista</label>
                    {loadingStaff ? (
                        <div className="skeleton" style={{ height: 48 }} />
                    ) : (
                        <select
                            className="form-input form-select"
                            value={selectedStaffId || ''}
                            onChange={e => setSelectedStaffId(e.target.value)}
                        >
                            <option value="">Seleccionar especialista...</option>
                            {allStaff.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    )}
                </div>
            )}

            {loading ? (
                <div>
                    <div className="time-grid">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} className="skeleton" style={{ height: 44, borderRadius: 8 }} />
                        ))}
                    </div>
                </div>
            ) : slots.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-neutral-600)' }}>
                    <p style={{ fontSize: '2rem', marginBottom: 12 }}>😔</p>
                    <p style={{ fontWeight: 600 }}>No hay horarios disponibles</p>
                    <p className="text-sm text-muted">Intenta con otra fecha</p>
                </div>
            ) : (
                <div className="time-grid">
                    {slots.map(slot => (
                        <button
                            key={slot}
                            className={`time-slot ${selected === slot ? 'selected' : ''}`}
                            onClick={() => onSelect(slot)}
                        >
                            {slot}
                        </button>
                    ))}
                </div>
            )}

            {serviceDuration && (
                <p className="text-xs text-muted text-center mt-4">
                    ⏱ Duración: {serviceDuration} minutos
                </p>
            )}

            <button className="btn btn-outline mt-4" onClick={onBack}>← Atrás</button>
        </div>
    );
}
