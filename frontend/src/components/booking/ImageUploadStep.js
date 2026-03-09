'use client';

import { useState, useRef } from 'react';
import { uploadReferenceImages } from '../../lib/api';

export default function ImageUploadStep({ bookingId }) {
    const [files, setFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploaded, setUploaded] = useState(false);
    const [error, setError] = useState(null);
    const [dragging, setDragging] = useState(false);
    const inputRef = useRef();

    const handleFiles = (newFiles) => {
        const validFiles = Array.from(newFiles).filter(f => f.type.startsWith('image/'));
        setFiles(prev => [...prev, ...validFiles]);
        const newPreviews = validFiles.map(f => URL.createObjectURL(f));
        setPreviews(prev => [...prev, ...newPreviews]);
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => {
            URL.revokeObjectURL(prev[index]);
            return prev.filter((_, i) => i !== index);
        });
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        handleFiles(e.dataTransfer.files);
    };

    const handleUpload = async () => {
        if (files.length === 0) return;
        setError(null);
        setUploading(true);
        try {
            await uploadReferenceImages(bookingId, files);
            setUploaded(true);
        } catch (err) {
            setError(err.response?.data?.error || 'Error al subir las imágenes. Intenta de nuevo.');
        } finally {
            setUploading(false);
        }
    };

    if (uploaded) {
        return (
            <div className="card card-body text-center animate-slide-up" style={{ padding: '48px 24px' }}>
                <div style={{ fontSize: '4rem', marginBottom: 16 }}>🎉</div>
                <h2 className="display-md text-gradient" style={{ marginBottom: 8 }}>¡Fotos subidas!</h2>
                <p style={{ color: 'var(--color-neutral-600)', marginBottom: 16 }}>
                    Tu especialista tendrá acceso a tus referencias antes de la cita.
                </p>
                <div style={{
                    background: 'var(--color-pink-50)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 16px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: '0.875rem',
                    color: 'var(--brand-deep)',
                    fontWeight: 500,
                }}>
                    🗑️ Las fotos se eliminarán automáticamente en 14 días
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div
                className={`upload-zone ${dragging ? 'dragging' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
            >
                <div style={{ fontSize: '3rem', marginBottom: 12 }}>📸</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: 8, color: 'var(--color-neutral-800)' }}>
                    Sube tus fotos de referencia
                </h3>
                <p style={{ color: 'var(--color-neutral-600)', fontSize: '0.9rem', marginBottom: 16 }}>
                    Arrastra tus fotos aquí o haz clic para seleccionar
                </p>
                <button className="btn btn-secondary" type="button" onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}>
                    Elegir fotos
                </button>
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    style={{ display: 'none' }}
                    onChange={(e) => handleFiles(e.target.files)}
                />
            </div>

            <p className="text-xs text-muted text-center mt-2">
                PNG, JPG, WEBP · Máximo 10MB por foto · Hasta 10 fotos · Se eliminan en 14 días
            </p>

            {/* Previews */}
            {previews.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 20 }}>
                    {previews.map((src, i) => (
                        <div key={i} style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', aspectRatio: '1' }}>
                            <img
                                src={src}
                                alt={`Referencia ${i + 1}`}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <button
                                onClick={() => removeFile(i)}
                                style={{
                                    position: 'absolute', top: 6, right: 6,
                                    width: 24, height: 24, borderRadius: '50%',
                                    background: 'rgba(0,0,0,0.6)', color: 'white',
                                    border: 'none', cursor: 'pointer', fontSize: '0.75rem',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {error && (
                <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '12px 16px', borderRadius: 'var(--radius-md)', marginTop: 16, fontSize: '0.875rem' }}>
                    ❌ {error}
                </div>
            )}

            {files.length > 0 && (
                <button
                    className="btn btn-primary btn-full mt-4"
                    onClick={handleUpload}
                    disabled={uploading}
                >
                    {uploading
                        ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Subiendo {files.length} foto(s)...</>
                        : `Subir ${files.length} foto(s) →`
                    }
                </button>
            )}

            <div style={{ textAlign: 'center', marginTop: 16 }}>
                <button
                    className="btn btn-ghost"
                    onClick={() => window.location.href = '/'}
                    style={{ color: 'var(--color-neutral-500)', fontSize: '0.875rem' }}
                >
                    Omitir por ahora
                </button>
            </div>
        </div>
    );
}
