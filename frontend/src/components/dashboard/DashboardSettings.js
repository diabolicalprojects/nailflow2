'use client';

import { useState, useEffect } from 'react';
import { getSettings, updateSettings } from '../../lib/api';

export default function DashboardSettings() {
    const [form, setForm] = useState({
        name: '',
        brand_color_primary: '#F9A8D4',
        brand_color_secondary: '#FBCFE8',
        booking_min_days: 7,
        n8n_webhook_url: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        getSettings().then(({ business, settings }) => {
            setForm({
                name: business?.name || '',
                brand_color_primary: business?.brand_color_primary || '#F9A8D4',
                brand_color_secondary: business?.brand_color_secondary || '#FBCFE8',
                booking_min_days: settings?.booking_min_days || 7,
                n8n_webhook_url: settings?.n8n_webhook_url || '',
            });
        }).catch(console.error).finally(() => setLoading(false));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await updateSettings(form);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            alert('Error al guardar: ' + (err.response?.data?.error || err.message));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Configuración</h1>
                <p className="page-subtitle">Personaliza tu estudio NailFlow</p>
            </div>

            {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: 60 }} />)}
                </div>
            ) : (
                <form onSubmit={handleSubmit} style={{ maxWidth: 640 }}>
                    <div className="card card-body" style={{ marginBottom: 20 }}>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: 20 }}>🏪 Información del Negocio</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div className="form-group">
                                <label className="form-label">Nombre del estudio</label>
                                <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="NailFlow Studio" />
                            </div>
                            <div className="grid-2">
                                <div className="form-group">
                                    <label className="form-label">Color primario (rosa)</label>
                                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                        <input type="color" value={form.brand_color_primary} onChange={e => setForm(f => ({ ...f, brand_color_primary: e.target.value }))} style={{ width: 48, height: 48, borderRadius: 8, border: 'none', cursor: 'pointer', padding: 2 }} />
                                        <input className="form-input" value={form.brand_color_primary} onChange={e => setForm(f => ({ ...f, brand_color_primary: e.target.value }))} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Color secundario</label>
                                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                        <input type="color" value={form.brand_color_secondary} onChange={e => setForm(f => ({ ...f, brand_color_secondary: e.target.value }))} style={{ width: 48, height: 48, borderRadius: 8, border: 'none', cursor: 'pointer', padding: 2 }} />
                                        <input className="form-input" value={form.brand_color_secondary} onChange={e => setForm(f => ({ ...f, brand_color_secondary: e.target.value }))} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card card-body" style={{ marginBottom: 20 }}>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: 20 }}>📅 Reglas de Reservas</h3>
                        <div className="form-group">
                            <label className="form-label">Días mínimos de anticipación: <strong>{form.booking_min_days} días</strong></label>
                            <input type="range" min="1" max="30" value={form.booking_min_days} onChange={e => setForm(f => ({ ...f, booking_min_days: parseInt(e.target.value) }))} style={{ width: '100%', accentColor: 'var(--brand-accent)' }} />
                            <p className="text-xs text-muted">Los clientes deben reservar con al menos {form.booking_min_days} día(s) de anticipación</p>
                        </div>
                    </div>

                    <div className="card card-body" style={{ marginBottom: 20 }}>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: 20 }}>🤖 Automatización (n8n)</h3>
                        <div className="form-group">
                            <label className="form-label">URL del webhook n8n</label>
                            <input className="form-input" value={form.n8n_webhook_url} onChange={e => setForm(f => ({ ...f, n8n_webhook_url: e.target.value }))} placeholder="https://n8n.tudominio.com/webhook/abc123" />
                            <p className="text-xs text-muted">Se enviará una notificación cuando se confirme una reserva</p>
                        </div>
                    </div>

                    {/* CDN Keys Display */}
                    <div className="card card-body" style={{ marginBottom: 24, background: 'var(--color-pink-50)', border: '1px solid var(--color-pink-100)' }}>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: 16 }}>🔑 API Keys CDN</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div>
                                <label className="form-label">Key principal (servicios)</label>
                                <code style={{ display: 'block', background: 'white', padding: '10px 14px', borderRadius: 8, fontSize: '0.8rem', color: 'var(--color-neutral-600)', border: '1px solid var(--color-pink-200)' }}>
                                    dmm_7tpONlAMTNtIMLjpr4gMSNqw9LGbgX6X
                                </code>
                            </div>
                            <div>
                                <label className="form-label">Key referencias (fotos de clientes)</label>
                                <code style={{ display: 'block', background: 'white', padding: '10px 14px', borderRadius: 8, fontSize: '0.8rem', color: 'var(--color-neutral-600)', border: '1px solid var(--color-pink-200)' }}>
                                    dmm_XKnnaMPrgRWaRHQ21deaQ3Krz2B6iBW
                                </code>
                            </div>
                        </div>
                    </div>

                    <button className="btn btn-primary btn-lg" type="submit" disabled={saving}>
                        {saving ? 'Guardando...' : saved ? '✓ ¡Guardado!' : 'Guardar Configuración'}
                    </button>
                </form>
            )}
        </div>
    );
}
