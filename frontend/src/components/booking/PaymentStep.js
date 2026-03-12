'use client';

import { useState } from 'react';
import { processPayment } from '../../lib/api';

const PAYMENT_METHODS = [
    { key: 'credit_card', label: 'TARJETA', icon: 'credit_card', desc: 'Crédito / Débito' },
    { key: 'apple_pay', label: 'APPLE PAY', icon: 'contactless', desc: 'Pago rápido' },
    { key: 'mercadopago', label: 'MERCADO', icon: 'wallet', desc: 'Mercado Pago' },
    { key: 'test', label: 'PRUEBA', icon: 'bug_report', desc: 'Pago de prueba' },
];

export default function PaymentStep({ booking, onUpdate, onSuccess, onBack }) {
    const [method, setMethod] = useState('credit_card');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const depositAmount = booking.depositAmount ||
        ((booking.service?.price || 0) * (booking.service?.deposit_percentage || 30) / 100);

    const handlePay = async () => {
        setError(null);
        setLoading(true);
        try {
            // Include 'test' as a fallback if needed, but the UI shows real methods
            const result = await processPayment({
                booking_id: booking.bookingId,
                payment_method: method === 'mercadopago' ? 'mercadopago' : method === 'test' ? 'test' : 'credit_card',
            });

            if (result.success) {
                onSuccess(booking.bookingId, depositAmount);
            } else {
                setError(result.message || 'El pago no fue aprobado.');
            }
        } catch (err) {
            console.error(err);
            setError('Error al procesar el pago. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col p-6 animate-fade-in">
            <header className="flex items-center justify-between py-4 mb-4">
                <button onClick={onBack} className="text-stone-400 hover:text-stone-600 transition-colors">
                    <span className="material-symbols-outlined text-2xl">arrow_back_ios_new</span>
                </button>
                <h1 className="font-display italic text-xl tracking-tight text-stone-700">Pago Seguro</h1>
                <div className="w-6"></div>
            </header>

            <main className="flex-1 px-4">
                <section className="text-center mt-6 mb-12">
                    <p className="text-stone-400 text-[10px] uppercase tracking-[0.3em] mb-4 font-bold">Reserva de Manicura</p>
                    <h2 className="font-display text-5xl font-light text-stone-800 mb-2">
                        ${Number(depositAmount).toFixed(2)}
                    </h2>
                    <p className="text-primary font-display italic text-sm font-medium">Anticipo del servicio</p>
                </section>

                <section className="mb-10">
                    <h3 className="text-[9px] font-bold text-stone-400 uppercase tracking-[0.2em] mb-5">Método de pago</h3>
                    <div className="grid grid-cols-3 gap-3">
                        {PAYMENT_METHODS.map(pm => (
                            <button
                                key={pm.key}
                                onClick={() => setMethod(pm.key)}
                                className={`flex flex-col items-center justify-center py-5 rounded-2xl border-2 transition-all ${method === pm.key
                                    ? 'border-primary bg-white shadow-soft-md'
                                    : 'border-stone-100 bg-white/40 grayscale opacity-60'
                                    }`}
                            >
                                <span className={`material-symbols-outlined mb-2 ${method === pm.key ? 'text-primary' : 'text-stone-300'}`}>
                                    {pm.icon}
                                </span>
                                <span className={`text-[9px] font-bold tracking-wider ${method === pm.key ? 'text-stone-600' : 'text-stone-400'}`}>
                                    {pm.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </section>

                {method === 'credit_card' && (
                    <section className="space-y-6 animate-fade-in">
                        <div className="relative">
                            <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1 ml-1">Nombre en la tarjeta</label>
                            <input
                                className="w-full bg-transparent border-0 border-b border-stone-200 py-2 px-1 focus:ring-0 focus:border-primary outline-none text-sm font-display text-stone-700 transition-colors placeholder:italic placeholder:text-stone-200"
                                placeholder="Nombre y Apellido"
                                type="text"
                            />
                        </div>
                        <div className="relative">
                            <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1 ml-1">Número de tarjeta</label>
                            <div className="flex items-center border-b border-stone-200 py-2 px-1 focus-within:border-primary transition-colors">
                                <input
                                    className="w-full bg-transparent focus:ring-0 outline-none text-sm font-display tracking-[0.2em] border-none p-0 text-stone-700 placeholder:text-stone-200"
                                    placeholder="0000 0000 0000 0000"
                                    type="text"
                                />
                                <span className="material-symbols-outlined text-stone-200 text-lg">credit_card</span>
                            </div>
                        </div>
                        <div className="flex gap-8">
                            <div className="relative flex-1">
                                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1 ml-1">Vencimiento</label>
                                <input className="w-full bg-transparent border-0 border-b border-stone-200 py-2 px-1 focus:ring-0 focus:border-primary outline-none text-sm font-display text-stone-700 placeholder:text-stone-200" placeholder="MM / AA" type="text" />
                            </div>
                            <div className="relative flex-1">
                                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1 ml-1">CVC</label>
                                <input className="w-full bg-transparent border-0 border-b border-stone-200 py-2 px-1 focus:ring-0 focus:border-primary outline-none text-sm font-display text-stone-700 placeholder:text-stone-200" placeholder="123" type="text" />
                            </div>
                        </div>
                    </section>
                )}

                {error && (
                    <p className="text-red-400 text-xs text-center font-medium mt-6">{error}</p>
                )}

                <button
                    disabled={loading}
                    onClick={handlePay}
                    className="w-full mt-14 bg-primary text-white py-4 rounded-full flex items-center justify-center gap-3 shadow-soft-lg hover:brightness-105 transition-all active:scale-[0.98]"
                >
                    {loading ? (
                        <span className="spinner w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                    ) : (
                        <>
                            <span className="material-symbols-outlined text-base">lock</span>
                            <span className="font-display font-medium tracking-wide text-lg">Confirmar Pago Seguro</span>
                        </>
                    )}
                </button>
            </main>

            <footer className="p-8 flex flex-col items-center">
                <p className="text-[9px] text-stone-300 uppercase tracking-[0.25em] mb-6 font-bold">Protección SSL de Grado Bancario</p>
                <div className="flex items-center gap-6 opacity-20 grayscale">
                    <img alt="Stripe" className="h-4" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCf1RWCKyxeLQbn008dZOXIgg9j6WF2nkl6MVom4Ox8j4aJxumdM2EqFGfSrZdORqQHvP9et_qE2HVGaI4BrCeK27IPpzwAAwbczbA2l8fmNOM0lcHU1h54Eka1zLXjLMv_Lm-PVE7BBEB5a3XsPVWeDaAoREBYmUuGGhQqVQjN6yigMUk8xzcKNCmkukepJk2C87INYxsjbD2O1AnbFDQpe4TbVTZOzhzNGbQGngfQotE8uLHMsIZoyDzmKq5ZumdX6oMUQzg1pjtl" />
                    <img alt="Mercado Pago" className="h-3" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBzrUtwg_DNe35asyvIPSusVe3BaGU7sWBcJuXL6QxZssUw-UcEF2VVLhm-jkDm4t4sjEskb_t10jz0-9O_sosFGDFCYwtcZVY8mK5Gkm4W64PwltrSouEL2q9SUeUVFUbHj-Jws6xxmkXKYwL0llXlDSkhkpefE1iP4bPqSn-TQlNsHJXLWpDT-vBDsLDZu8-bJCvtyXI7dIwyP8Ep3u6ispMi2JuCkO9hgBXp70a5g1qMTpHwXhJqG3-8TW-bzE4WYAx9W61L4adw" />
                </div>
            </footer>
        </div>
    );
}
