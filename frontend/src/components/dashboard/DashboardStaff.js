'use client';

import { useState, useEffect } from 'react';
import { getDashboardStaff, createStaff, updateStaff, deleteStaff } from '../../lib/api';

const emptyStaff = { name: '', role: 'staff', phone: '', booking_slug: '', profile_image: '' };

export default function DashboardStaff() {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState(emptyStaff);
    const [editing, setEditing] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);

    const load = () => getDashboardStaff().then(setStaff).catch(console.error).finally(() => setLoading(false));
    useEffect(() => { load(); }, []);

    const openNew = () => { setForm(emptyStaff); setEditing(null); setShowForm(true); };
    const openEdit = (s) => { setForm(s); setEditing(s.id); setShowForm(true); };
    const closeForm = () => { setShowForm(false); setEditing(null); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editing) await updateStaff({ ...form, id: editing });
            else await createStaff(form);
            closeForm();
            load();
        } catch (err) {
            alert(err.response?.data?.error || 'Error al guardar');
        } finally {
            setSaving(false);
        }
    };

    const directors = staff.filter(s => s.role === 'director');
    const members = staff.filter(s => s.role !== 'director');

    return (
        <div>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 className="page-title">Equipo</h1>
                    <p className="page-subtitle">Administra tu equipo de especialistas</p>
                </div>
                <button className="btn btn-primary" onClick={openNew}>+ Agregar Miembro</button>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
                    <div className="card" style={{ width: '100%', maxWidth: 480, maxHeight: '90vh', overflow: 'auto' }}>
                        <div style={{ background: 'var(--gradient-cta)', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ color: 'white', fontWeight: 700 }}>{editing ? 'Editar Miembro' : 'Nuevo Miembro'}</h3>
                            <button onClick={closeForm} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div className="form-group">
                                <label className="form-label">Nombre *</label>
                                <input className="form-input" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Lidia Martínez" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Rol</label>
                                <select className="form-input form-select" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                                    <option value="staff">Especialista (Recibe citas)</option>
                                    <option value="director">Directora (Sin link de citas)</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Teléfono / WhatsApp</label>
                                <input className="form-input" value={form.phone || ''} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+1 555 123 4567" />
                            </div>
                            {form.role !== 'director' && (
                                <div className="form-group">
                                    <label className="form-label">Slug de reservas</label>
                                    <input className="form-input" value={form.booking_slug || ''} onChange={e => setForm(f => ({ ...f, booking_slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))} placeholder="lidia" />
                                    <p className="text-xs text-muted">URL: domain.com/book/{form.booking_slug || 'slug'}</p>
                                </div>
                            )}
                            <div style={{ display: 'flex', gap: 12 }}>
                                <button className="btn btn-outline" type="button" onClick={closeForm}>Cancelar</button>
                                <button className="btn btn-primary" type="submit" disabled={saving} style={{ flex: 1 }}>
                                    {saving ? 'Guardando...' : editing ? 'Actualizar' : 'Crear Miembro'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="grid-3">
                    {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 160 }} />)}
                </div>
            ) : (
                <>
                    {directors.length > 0 && (
                        <div style={{ marginBottom: 24 }}>
                            <p style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-neutral-400)', marginBottom: 12 }}>
                                Dirección
                            </p>
                            <div className="grid-3">
                                {directors.map(s => <StaffCard key={s.id} staff={s} onEdit={openEdit} onDelete={async (id) => { await deleteStaff(id); load(); }} />)}
                            </div>
                        </div>
                    )}
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-neutral-400)', marginBottom: 12 }}>
                        Especialistas
                    </p>
                    <div className="grid-3">
                        {members.map(s => <StaffCard key={s.id} staff={s} onEdit={openEdit} onDelete={async (id) => { await deleteStaff(id); load(); }} />)}
                    </div>
                </>
            )}
        </div>
    );
}

function StaffCard({ staff: s, onEdit, onDelete }) {
    return (
        <div className="card card-elevated" style={{ overflow: 'hidden' }}>
            <div style={{ background: 'var(--gradient-rose)', padding: '24px', textAlign: 'center' }}>
                <div className="avatar" style={{ width: 64, height: 64, fontSize: '1.5rem', margin: '0 auto 12px' }}>
                    {s.name.charAt(0)}
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>{s.name}</h3>
                <span className={`badge ${s.role === 'director' ? 'badge-pink' : 'badge-neutral'}`} style={{ marginTop: 6 }}>
                    {s.role === 'director' ? 'Directora' : 'Especialista'}
                </span>
            </div>
            <div className="card-body">
                {s.phone && <p className="text-sm" style={{ marginBottom: 4 }}>📱 {s.phone}</p>}
                {s.booking_slug && (
                    <a
                        href={`/book/${s.booking_slug}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ fontSize: '0.8rem', color: 'var(--brand-deep)', display: 'block', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    >
                        🔗 /book/{s.booking_slug}
                    </a>
                )}
                {!s.booking_slug && s.role !== 'director' && (
                    <p className="text-xs text-muted" style={{ marginBottom: 8 }}>Sin link de reservas asignado</p>
                )}
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => onEdit(s)}>✏️ Editar</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => onDelete(s.id)} style={{ color: '#b91c1c' }}>🗑</button>
                </div>
            </div>
        </div>
    );
}
