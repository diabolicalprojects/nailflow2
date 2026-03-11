'use client';

export default function ConfirmationStep({ booking, businessName = 'Ana Nails Studio' }) {
    const formattedDate = new Date(booking.date).toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    });

    return (
        <div className="flex-1 flex flex-col items-center justify-between py-12 px-8 bg-bg-light min-h-[90vh] animate-fade-in relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                <span className="material-symbols-outlined text-9xl">spa</span>
            </div>
            <div className="absolute bottom-0 left-0 p-12 opacity-[0.03] pointer-events-none">
                <span className="material-symbols-outlined text-8xl">self_improvement</span>
            </div>

            <div className="flex flex-col items-center mt-8 z-10">
                <div className="relative w-32 h-32 flex items-center justify-center mb-8">
                    <div className="absolute inset-0 bg-primary/20 rounded-full scale-110 animate-pulse"></div>
                    {/* Flower accents */}
                    <span className="material-symbols-outlined absolute -top-2 text-primary/60 text-xl">spa</span>
                    <span className="material-symbols-outlined absolute -right-2 top-1/2 -translate-y-1/2 text-primary/60 text-xl">filter_vintage</span>
                    <span className="material-symbols-outlined absolute -bottom-2 text-primary/60 text-xl">local_florist</span>
                    <span className="material-symbols-outlined absolute -left-2 top-1/2 -translate-y-1/2 text-primary/60 text-xl">celebration</span>

                    <div className="relative bg-white rounded-full p-6 shadow-soft-md ring-8 ring-white/50">
                        <span className="material-symbols-outlined text-primary text-5xl font-light">check_circle</span>
                    </div>
                </div>

                <h1 className="font-display italic text-4xl text-stone-800 text-center leading-tight">
                    ¡Tu cita está <br /> confirmada!
                </h1>
            </div>

            <div className="w-full mt-10 z-10">
                <div className="bg-white/70 backdrop-blur-md rounded-[2.5rem] p-8 shadow-soft-lg border border-white/50">
                    <div className="text-center mb-8">
                        <p className="text-[10px] uppercase tracking-[0.25em] text-stone-400 mb-2 font-bold">Tu cita en</p>
                        <h2 className="font-display text-2xl text-stone-800 font-semibold">{businessName}</h2>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-5 border-b border-stone-100 pb-4">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary text-xl font-light">calendar_today</span>
                            </div>
                            <div>
                                <p className="text-[9px] uppercase tracking-widest text-stone-400 font-bold">Fecha</p>
                                <p className="text-sm font-display text-stone-700 font-medium capitalize">{formattedDate}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-5 border-b border-stone-100 pb-4">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary text-xl font-light">schedule</span>
                            </div>
                            <div>
                                <p className="text-[9px] uppercase tracking-widest text-stone-400 font-bold">Hora</p>
                                <p className="text-sm font-display text-stone-700 font-medium">{booking.time} HS</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-5">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary text-xl font-light">auto_awesome</span>
                            </div>
                            <div>
                                <p className="text-[9px] uppercase tracking-widest text-stone-400 font-bold">Servicio</p>
                                <p className="text-sm font-display text-stone-700 font-medium">{booking.service?.name}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 px-4 text-center z-10">
                <p className="text-stone-400 text-xs font-medium leading-relaxed italic">
                    Te hemos enviado los detalles y el recordatorio a tu WhatsApp
                </p>
            </div>

            <div className="w-full mt-10 space-y-4 z-10">
                <button className="w-full bg-white text-stone-600 py-4 rounded-full flex items-center justify-center gap-3 transition-all active:scale-[0.98] border border-stone-100 shadow-soft">
                    <span className="material-symbols-outlined text-xl text-primary">event_available</span>
                    <span className="font-display tracking-wide font-medium">Añadir a mi Calendario</span>
                </button>

                <div className="text-center pt-4">
                    <button
                        onClick={() => window.location.href = '/'}
                        className="text-[11px] uppercase tracking-[0.2em] text-stone-300 hover:text-primary transition-colors font-bold"
                    >
                        Volver al inicio
                    </button>
                </div>
            </div>
        </div>
    );
}
