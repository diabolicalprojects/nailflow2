'use client';

export default function ServiceStep({ services, selected, onSelect, onBack }) {
    return (
        <div className="flex-1 flex flex-col p-6 animate-fade-in">
            <header className="mb-10">
                <h1 className="text-4xl font-light font-display text-stone-800 leading-tight">
                    Selecciona tu <br />
                    <span className="italic font-medium">servicio</span>
                </h1>
                <p className="text-stone-400 mt-3 text-[11px] tracking-[0.1em] font-bold uppercase">
                    Elige el tratamiento ideal para ti
                </p>
                <div className="w-12 h-[2px] bg-primary/30 mt-6 rounded-full"></div>
            </header>

            <div className="space-y-4 flex-1">
                {services.map((service) => (
                    <button
                        key={service.id}
                        onClick={() => onSelect(service)}
                        className={`w-full flex items-center p-4 rounded-[28px] border transition-all duration-300 ${selected?.id === service.id
                                ? 'bg-white border-primary shadow-soft-lg ring-1 ring-primary/20'
                                : 'bg-white/40 border-transparent hover:border-primary/30 shadow-sm'
                            }`}
                    >
                        <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-stone-100 bg-stone-50">
                            <img
                                alt={service.name}
                                className="w-full h-full object-cover"
                                src={service.image_url || `https://images.unsplash.com/photo-1604654894610-df490668711d?q=80&w=150&h=150&auto=format&fit=crop`}
                            />
                        </div>
                        <div className="ml-4 flex flex-col items-start text-left flex-1">
                            <span className="text-lg font-display font-semibold text-stone-800 leading-tight">
                                {service.name}
                            </span>
                            <span className="text-[10px] text-stone-400 flex items-center gap-1.5 mt-2 font-bold tracking-widest uppercase">
                                <span className="material-symbols-outlined text-[14px]">schedule</span>
                                {service.duration_minutes} MIN
                            </span>
                        </div>
                        <div className="flex flex-col items-end gap-3 pl-2">
                            <span className="text-sm font-display font-bold text-stone-700">
                                ${service.price}
                            </span>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${selected?.id === service.id
                                    ? 'bg-primary shadow-sm'
                                    : 'border border-stone-200 bg-white/50'
                                }`}>
                                {selected?.id === service.id && (
                                    <span className="material-symbols-outlined text-white text-[16px] font-bold">check</span>
                                )}
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            <div className="mt-auto pt-8 pb-4">
                <button
                    disabled={!selected}
                    onClick={() => onSelect(selected)}
                    className="w-full bg-primary disabled:opacity-50 text-white py-5 rounded-[22px] shadow-soft-md hover:shadow-soft-lg active:scale-[0.98] transition-all flex items-center justify-center gap-3 font-display text-xl tracking-wider"
                >
                    Continuar
                    <span className="material-symbols-outlined font-light text-2xl">arrow_forward</span>
                </button>

                <div className="flex items-center justify-center gap-6 mt-6">
                    <div className="h-[2px] w-8 bg-primary rounded-full"></div>
                    <p className="text-center text-[10px] text-stone-400 uppercase tracking-[0.3em] font-bold">Paso 1 de 4</p>
                    <div className="h-[2px] w-8 bg-stone-200 rounded-full"></div>
                </div>
            </div>
        </div>
    );
}
