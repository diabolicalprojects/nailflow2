'use client';

import { useState, useEffect } from 'react';
import { getAvailability } from '../../lib/api';

export default function DateTimeStep({ selectedDate, selectedTime, staffId, serviceDuration, onSelect, onBack }) {
    const [date, setDate] = useState(selectedDate || new Date().toISOString().split('T')[0]);
    const [times, setTimes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    useEffect(() => {
        if (date && staffId && serviceDuration) {
            async function loadTimes() {
                setLoading(true);
                try {
                    const data = await getAvailability(date, staffId);
                    setTimes(data.available_slots || []);
                } catch (err) {
                    console.error('Error fetching times:', err);
                } finally {
                    setLoading(false);
                }
            }
            loadTimes();
        }
    }, [date, staffId, serviceDuration]);

    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const renderCalendar = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const days = [];
        const numDays = daysInMonth(year, month);
        const startDay = firstDayOfMonth(year, month);

        // Offset for empty days
        const startOffset = startDay === 0 ? 6 : startDay - 1; // Start from Monday

        for (let i = 0; i < startOffset; i++) {
            days.push(<div key={`empty-${i}`} className="h-10 w-10"></div>);
        }

        for (let d = 1; d <= numDays; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const isSelected = date === dateStr;

            const todayObj = new Date();
            const todayStr = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}-${String(todayObj.getDate()).padStart(2, '0')}`;
            const isToday = todayStr === dateStr;
            const isPast = new Date(dateStr + 'T00:00:00') < new Date(todayObj.setHours(0, 0, 0, 0));

            days.push(
                <button
                    key={d}
                    disabled={isPast}
                    onClick={() => setDate(dateStr)}
                    className={`h-10 w-10 flex items-center justify-center text-sm rounded-full transition-all ${isSelected
                        ? 'bg-primary text-white shadow-soft font-bold'
                        : isToday
                            ? 'text-primary font-bold border border-primary/20'
                            : isPast
                                ? 'text-stone-200 cursor-not-allowed'
                                : 'text-stone-600 hover:bg-primary/10'
                        }`}
                >
                    {d}
                </button>
            );
        }
        return days;
    };

    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    return (
        <div className="flex-1 flex flex-col p-6 animate-fade-in">
            <header className="mb-6 flex items-center justify-between">
                <button onClick={onBack} className="w-10 h-10 rounded-full hover:bg-stone-100 flex items-center justify-center transition-colors">
                    <span className="material-symbols-outlined text-stone-400">arrow_back_ios_new</span>
                </button>
                <span className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-40 font-display">Reserva</span>
                <div className="w-10"></div>
            </header>

            <div className="mb-8">
                <h1 className="text-3xl font-light font-display text-stone-800 leading-tight">
                    Selecciona <br />
                    <span className="italic font-medium text-primary/80">fecha y hora</span>
                </h1>
                <p className="text-stone-400 mt-2 text-xs font-medium uppercase tracking-widest">Encuentra el momento perfecto</p>
            </div>

            {/* Calendar Card */}
            <div className="bg-white/60 border border-white shadow-soft p-5 rounded-[2rem] mb-8">
                <div className="flex items-center justify-between mb-6 px-2">
                    <h2 className="font-display text-lg font-semibold text-stone-800">
                        {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                    </h2>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
                            className="material-symbols-outlined text-stone-300 hover:text-stone-600 transition-colors"
                        >
                            chevron_left
                        </button>
                        <button
                            onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
                            className="material-symbols-outlined text-stone-300 hover:text-stone-600 transition-colors"
                        >
                            chevron_right
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center mb-4">
                    {['LU', 'MA', 'MI', 'JU', 'VI', 'SA', 'DO'].map(day => (
                        <span key={day} className="text-[10px] font-bold text-stone-300 uppercase tracking-widest">{day}</span>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-1 text-center">
                    {renderCalendar()}
                </div>
            </div>

            <section className="flex-1 overflow-y-auto">
                <h3 className="font-display text-lg font-medium mb-4 text-stone-800 italic px-2">
                    Horarios para el {new Date(date + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
                </h3>

                {loading ? (
                    <div className="flex justify-center p-8">
                        <div className="spinner w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    </div>
                ) : times.length > 0 ? (
                    <div className="grid grid-cols-3 gap-3">
                        {times.map(time => (
                            <button
                                key={time}
                                onClick={() => onSelect(date, time)}
                                className={`py-3.5 px-4 rounded-[1.2rem] text-xs font-semibold transition-all border ${selectedTime === time
                                    ? 'bg-primary text-white border-primary shadow-soft'
                                    : 'bg-white/40 border-stone-100 text-stone-600 hover:border-primary/40'
                                    }`}
                            >
                                {time}
                            </button>
                        ))}
                    </div>
                ) : (
                    <p className="text-center py-8 text-stone-400 text-sm bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                        No hay horarios disponibles para este día
                    </p>
                )}
            </section>

            <div className="mt-8">
                <button
                    disabled={!date || !selectedTime}
                    onClick={() => onSelect(date, selectedTime)}
                    className="w-full bg-primary disabled:opacity-50 text-white py-5 rounded-2xl shadow-soft-md active:scale-[0.98] transition-all flex items-center justify-center gap-3 font-display text-lg tracking-wide"
                >
                    <span className="font-semibold">Confirmar Cita</span>
                    <span className="material-symbols-outlined font-light text-xl">calendar_today</span>
                </button>
            </div>
        </div>
    );
}
