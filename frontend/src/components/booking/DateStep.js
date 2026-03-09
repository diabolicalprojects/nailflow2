'use client';

import { useState } from 'react';

const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MIN_DAYS_AHEAD = 7;

function formatDate(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export default function DateStep({ selected, onSelect, onBack }) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const minDate = new Date(today);
    minDate.setDate(minDate.getDate() + MIN_DAYS_AHEAD);

    const [viewDate, setViewDate] = useState(() => {
        const d = new Date(minDate);
        return { year: d.getFullYear(), month: d.getMonth() };
    });

    const getDaysInMonth = (year, month) => {
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const cells = [];

        for (let i = 0; i < firstDay; i++) cells.push(null);
        for (let d = 1; d <= daysInMonth; d++) cells.push(d);

        return cells;
    };

    const cells = getDaysInMonth(viewDate.year, viewDate.month);

    const isDisabled = (day) => {
        if (!day) return true;
        const d = new Date(viewDate.year, viewDate.month, day);
        return d < minDate || d.getDay() === 0; // Sundays closed
    };

    const isSelected = (day) => {
        if (!day || !selected) return false;
        const d = new Date(viewDate.year, viewDate.month, day);
        return formatDate(d) === selected;
    };

    const isToday = (day) => {
        if (!day) return false;
        const d = new Date(viewDate.year, viewDate.month, day);
        return formatDate(d) === formatDate(today);
    };

    const prevMonth = () => {
        setViewDate(prev => {
            if (prev.month === 0) return { year: prev.year - 1, month: 11 };
            return { ...prev, month: prev.month - 1 };
        });
    };

    const nextMonth = () => {
        setViewDate(prev => {
            if (prev.month === 11) return { year: prev.year + 1, month: 0 };
            return { ...prev, month: prev.month + 1 };
        });
    };

    const handleDayClick = (day) => {
        if (isDisabled(day)) return;
        const d = new Date(viewDate.year, viewDate.month, day);
        onSelect(formatDate(d));
    };

    // Prevent going before min month
    const canGoPrev = () => {
        const minMonth = minDate.getMonth();
        const minYear = minDate.getFullYear();
        return viewDate.year > minYear || (viewDate.year === minYear && viewDate.month > minMonth);
    };

    return (
        <div className="card card-body animate-fade-in">
            {/* Month Navigator */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <button
                    className="btn btn-ghost btn-icon"
                    onClick={prevMonth}
                    disabled={!canGoPrev()}
                    style={{ opacity: canGoPrev() ? 1 : 0.3 }}
                >
                    ‹
                </button>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.125rem' }}>
                    {MONTH_NAMES[viewDate.month]} {viewDate.year}
                </h3>
                <button className="btn btn-ghost btn-icon" onClick={nextMonth}>›</button>
            </div>

            {/* Day Headers */}
            <div className="date-grid" style={{ marginBottom: 8 }}>
                {DAY_NAMES.map(day => (
                    <div key={day} style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-neutral-400)', padding: '4px 0' }}>
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="date-grid">
                {cells.map((day, index) => (
                    <button
                        key={index}
                        className={`date-cell ${!day ? 'disabled' : ''} ${isDisabled(day) ? 'disabled' : ''} ${isSelected(day) ? 'selected' : ''} ${isToday(day) ? 'today' : ''}`}
                        onClick={() => handleDayClick(day)}
                        disabled={isDisabled(day)}
                    >
                        {day && (
                            <>
                                <span style={{ lineHeight: 1 }}>{day}</span>
                                {isToday(day) && <span style={{ width: 4, height: 4, borderRadius: '50%', background: isSelected(day) ? 'white' : 'var(--brand-accent)', marginTop: 2 }} />}
                            </>
                        )}
                    </button>
                ))}
            </div>

            <p className="text-xs text-muted text-center mt-4">
                📌 Mínimo {MIN_DAYS_AHEAD} días de anticipación · Domingos cerrado
            </p>

            {selected && (
                <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--color-pink-50)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                    <p style={{ fontWeight: 600, color: 'var(--brand-deep)' }}>Fecha seleccionada: {selected}</p>
                </div>
            )}

            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                <button className="btn btn-outline" onClick={onBack}>← Atrás</button>
            </div>
        </div>
    );
}
