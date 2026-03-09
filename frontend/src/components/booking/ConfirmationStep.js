'use client';

export default function ConfirmationStep({ booking, onUploadImages }) {
    return (
        <div className="animate-slide-up">
            <div className="confetti-line" />

            <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <div className="confirmation-icon">✅</div>
                <h2 className="display-md text-gradient" style={{ marginBottom: 8 }}>
                    ¡Cita Confirmada!
                </h2>
                <p style={{ color: 'var(--color-neutral-600)', fontSize: '1.0625rem' }}>
                    Tu depósito fue procesado exitosamente
                </p>
            </div>

            {/* Booking Summary Card */}
            <div className="card card-elevated" style={{ marginBottom: 24 }}>
                <div style={{ background: 'var(--gradient-cta)', padding: '16px 24px', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0' }}>
                    <p style={{ color: 'white', fontWeight: 700, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Detalles de tu cita
                    </p>
                </div>
                <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[
                        { label: '💅 Servicio', value: booking.service?.name },
                        { label: '📅 Fecha', value: booking.date },
                        { label: '🕐 Hora', value: booking.time },
                        { label: '💰 Depósito pagado', value: `$${Number(booking.depositAmount).toFixed(2)}` },
                        { label: '📱 Confirmación enviada a', value: booking.clientPhone },
                    ].map(item => item.value && (
                        <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: 'var(--color-neutral-500)', fontSize: '0.9rem' }}>{item.label}</span>
                            <span style={{ fontWeight: 600, color: 'var(--color-neutral-800)', fontSize: '0.9375rem' }}>{item.value}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Upload CTA */}
            <div className="card" style={{
                background: 'var(--gradient-rose)',
                border: '1px solid var(--color-pink-200)',
                padding: 24,
                textAlign: 'center',
                marginBottom: 24,
            }}>
                <p style={{ fontSize: '2rem', marginBottom: 8 }}>🖼️</p>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: 8, color: 'var(--color-neutral-900)' }}>
                    Sube tus fotos de referencia
                </h3>
                <p style={{ color: 'var(--color-neutral-600)', fontSize: '0.9rem', marginBottom: 16 }}>
                    Comparte el diseño que tienes en mente. Las fotos se eliminan automáticamente después de 14 días.
                </p>
                <button className="btn btn-primary" onClick={onUploadImages}>
                    Subir fotos →
                </button>
            </div>

            <div style={{ textAlign: 'center' }}>
                <p className="text-sm text-muted">
                    ¿Preguntas? Contáctanos por WhatsApp
                </p>
            </div>
        </div>
    );
}
