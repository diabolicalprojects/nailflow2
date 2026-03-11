'use client';

import { useState, useRef } from 'react';

export default function InspirationStep({ onNext, onUpdate, selectedImages = [] }) {
    const [previews, setPreviews] = useState(selectedImages.map(f => URL.createObjectURL(f)));
    const [files, setFiles] = useState(selectedImages);
    const inputRef = useRef();

    const handleFiles = (newFiles) => {
        const validFiles = Array.from(newFiles).filter(f => f.type.startsWith('image/')).slice(0, 3 - files.length);
        const updatedFiles = [...files, ...validFiles];
        setFiles(updatedFiles);

        const newPreviews = validFiles.map(f => URL.createObjectURL(f));
        const updatedPreviews = [...previews, ...newPreviews];
        setPreviews(updatedPreviews);

        onUpdate({ referenceImages: updatedFiles });
    };

    const removeFile = (index) => {
        const updatedFiles = files.filter((_, i) => i !== index);
        setFiles(updatedFiles);

        const updatedPreviews = previews.filter((_, i) => {
            if (i === index) URL.revokeObjectURL(previews[i]);
            return i !== index;
        });
        setPreviews(updatedPreviews);

        onUpdate({ referenceImages: updatedFiles });
    };

    return (
        <div className="flex-1 flex flex-col p-6 animate-fade-in">
            <header className="mt-4 mb-8">
                <h1 className="text-3xl font-medium font-display text-stone-800 italic">Fotos de referencia</h1>
                <p className="text-stone-400 mt-2 text-xs tracking-widest uppercase font-light">Opciónal: Inspíranos con tu diseño</p>
            </header>

            <section className="mb-10 flex-1">
                <div className="flex items-center justify-between mb-6 px-1">
                    <h3 className="font-display text-xl italic text-stone-700">Tu inspiración</h3>
                    <span className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">
                        {files.length} de 3 seleccionadas
                    </span>
                </div>

                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                    {previews.map((src, i) => (
                        <div key={i} className="relative w-24 h-24 rounded-full border-2 border-white shadow-soft shrink-0 overflow-hidden group">
                            <img alt={`Referencia ${i + 1}`} className="w-full h-full object-cover" src={src} />
                            <button
                                onClick={() => removeFile(i)}
                                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white"
                            >
                                <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                        </div>
                    ))}

                    {files.length < 3 && (
                        <button
                            onClick={() => inputRef.current?.click()}
                            className="w-24 h-24 rounded-full border-2 border-dashed border-primary/40 bg-primary/5 flex items-center justify-center shrink-0 hover:bg-primary/10 transition-colors"
                        >
                            <span className="material-symbols-outlined text-primary/60 text-3xl font-light">add</span>
                        </button>
                    )}
                </div>

                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFiles(e.target.files)}
                />

                <div className="mt-12 bg-primary/5 p-6 rounded-[2rem] border border-primary/10">
                    <p className="text-[11px] leading-relaxed text-stone-500 italic text-center">
                        "Las fotos ayudan a tu especialista a preparar los materiales exactos para tu diseño soñado."
                    </p>
                </div>
            </section>

            <div className="mt-auto space-y-4">
                <button
                    onClick={onNext}
                    className="w-full bg-primary text-white py-5 rounded-full shadow-soft-md hover:shadow-soft-lg active:scale-[0.98] transition-all flex items-center justify-center gap-3 font-display text-xl tracking-wider"
                >
                    Continuar
                    <span className="material-symbols-outlined font-light text-2xl">arrow_forward</span>
                </button>
                <button
                    onClick={onNext}
                    className="w-full text-stone-400 text-[10px] font-bold uppercase tracking-[0.2em] py-2"
                >
                    Omitir este paso
                </button>
            </div>
        </div>
    );
}
