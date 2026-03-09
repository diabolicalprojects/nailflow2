'use client';

import { useState, useEffect } from 'react';
import { getDashboardServices, createService, updateService, deleteService } from '../../lib/api';

const empty = { name: '', description: '', price: '', duration_minutes: 60, deposit_percentage: 30, image_url: '' };

export default function DashboardServices() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(empty);
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);

    const load = () => getDashboardServices().then(setServices).catch(console.error).finally(() => setLoading(false));
    useEffect(() => { load(); }, []);

    const openNew = () => { setForm(empty); setEditing(null); setShowForm(true); };
    const openEdit = (s) => { setForm(s); setEditing(s.id); setShowForm(true); };
    const closeForm = () => { setShowForm(false); setEditing(null); setForm(empty); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editing) {
                await updateService({ ...form, id: editing });
            } else {
                await createService(form);
            }
            closeForm();
            load();
        } catch (err) {
            alert('Error: ' + (err.response?.data?.error || err.message));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Desactivar este servicio?')) return;
        await deleteService(id);
        load();
    };

    return (
        <div>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 className="page-title">Servicios</h1>
                    <p className="page-subtitle">Administra los servicios de tu estudio</p>
                </div>
                <button className="btn btn-primary" onClick={openNew}>+ Nuevo Servicio</button>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
                    <div className="card" style={{ width: '100%', maxWidth: 540, maxHeight: '90vh', overflow: 'auto' }}>
                        <div style={{ background: 'var(--gradient-cta)', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ color: 'white', fontWeight: 700 }}>{editing ? 'Editar Servicio' : 'Nuevo Servicio'}</h3>
                            <button onClick={closeForm} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div className="form-group">
                                <label className="form-label">Nombre *</label>
                                <input className="form-input" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Uñas Acrílicas" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Descripción</label>
                                <textarea className="form-input" rows={2} value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Descripción del servicio..." />
                            </div>
                            <div className="grid-2">
                                <div className="form-group">
                                    <label className="form-label">Precio ($) *</label>
                                    <input className="form-input" type="number" min="0" step="0.01" required value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="45.00" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Duración (min)</label>
                                    <input className="form-input" type="number" min="15" value={form.duration_minutes} onChange={e => setForm(f => ({ ...f, duration_minutes: e.target.value }))} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Depósito (%) - {form.deposit_percentage}%</label>
                                <input className="form-input" type="range" min="10" max="100" step="5" value={form.deposit_percentage} onChange={e => setForm(f => ({ ...f, deposit_percentage: parseInt(e.target.value) }))} style={{ padding: 0, height: 4, accentColor: 'var(--brand-accent)' }} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">URL imagen (CDN)</label>
                                <input className="form-input" value={form.image_url || ''} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} placeholder="https://cdn.diabolicalservices.tech/..." />
                            </div>
                            <div style={{ display: 'flex', gap: 12 }}>
                                <button className="btn btn-outline" type="button" onClick={closeForm}>Cancelar</button>
                                <button className="btn btn-primary" type="submit" disabled={saving} style={{ flex: 1 }}>
                                    {saving ? 'Guardando...' : editing ? 'Actualizar' : 'Crear Servicio'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Services Grid */}
            {loading ? (
                <div className="grid-3">
                    {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 200 }} />)}
                </div>
            ) : (
                <div className="grid-3">
                    {services.map(s => (
                        <div key={s.id} className="card card-elevated" style={{ overflow: 'hidden' }}>
                            <div style={{
                                height: 100,
                                background: 'var(--gradient-rose)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '3rem',
                                position: 'relative',
                            }}>
                                💅
                                {!s.is_active && (
                                    <span className="badge badge-neutral" style={{ position: 'absolute', top: 8, right: 8 }}>Inactivo</span>
                                )}
                            </div>
                            <div className="card-body">
                                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: 4 }}>{s.name}</h3>
                                <p className="text-sm text-muted" style={{ marginBottom: 12, minHeight: 38 }}>{s.description || ''}</p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                    <span style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--brand-deep)' }}>${Number(s.price).toFixed(2)}</span>
                                    <span className="badge badge-pink">{s.deposit_percentage}% depósito</span>
                                </div>
                                <p className="text-xs text-muted" style={{ marginBottom: 16 }}>⏱ {s.duration_minutes} minutos</p>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => openEdit(s)}>✏️ Editar</button>
                                    <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(s.id)} style={{ color: '#b91c1c' }}>🗑</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
