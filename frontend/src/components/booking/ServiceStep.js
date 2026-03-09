'use client';

const CDN_KEY = process.env.NEXT_PUBLIC_CDN_KEY;

function ServiceImage({ imageUrl, name }) {
    const [imgSrc, setImgSrc] = useState(null);

    useEffect(() => {
        if (!imageUrl) return;
        const url = imageUrl.includes('?')
            ? `${imageUrl}&api_key=${CDN_KEY}`
            : `${imageUrl}?api_key=${CDN_KEY}`;
        setImgSrc(url);
    }, [imageUrl]);

    if (!imgSrc) {
        return (
            <div className="service-image" style={{
                background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '3rem',
            }}>
                💅
            </div>
        );
    }

    return (
        <img
            className="service-image"
            src={imgSrc}
            alt={name}
            loading="lazy"
            onError={() => setImgSrc(null)}
        />
    );
}

import { useState, useEffect } from 'react';

export default function ServiceStep({ services, selected, onSelect }) {
    return (
        <div>
            <div className="grid-2" style={{ gap: 16 }}>
                {services.map((service) => (
                    <div
                        key={service.id}
                        className={`service-card ${selected?.id === service.id ? 'selected' : ''}`}
                        onClick={() => onSelect(service)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && onSelect(service)}
                    >
                        <ServiceImage imageUrl={service.image_url} name={service.name} />

                        <div>
                            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.0625rem', marginBottom: 4, color: 'var(--color-neutral-900)' }}>
                                {service.name}
                            </h3>
                            {service.description && (
                                <p className="text-sm text-muted" style={{ marginBottom: 8 }}>{service.description}</p>
                            )}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                                <span className="service-price">${service.price}</span>
                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                    <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                                        ⏱ {service.duration_minutes}min
                                    </span>
                                    <span className="deposit-badge">
                                        💰 {service.deposit_percentage}% depósito
                                    </span>
                                </div>
                            </div>
                        </div>

                        {selected?.id === service.id && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--brand-deep)', fontWeight: 600, fontSize: '0.875rem' }}>
                                <span>✓</span> Seleccionado
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {services.length === 0 && (
                <div className="card card-body text-center" style={{ padding: '48px 24px', color: 'var(--color-neutral-600)' }}>
                    <p style={{ fontSize: '3rem', marginBottom: 12 }}>💅</p>
                    <p>No hay servicios disponibles por el momento.</p>
                </div>
            )}
        </div>
    );
}
