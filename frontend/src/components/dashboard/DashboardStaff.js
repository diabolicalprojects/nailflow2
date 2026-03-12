'use client';

import { useState, useEffect, useRef } from 'react';
import { getDashboardStaff, createStaff, updateStaff, deleteStaff } from '../../lib/api';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const emptyStaff = { name: '', role: 'staff', phone: '', booking_slug: '', specialty: '' };

export default function DashboardStaff() {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState(emptyStaff);
    const [editing, setEditing] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [uploadingImage, setUploadingImage] = useState(false);
    const fileRef = useRef(null);

    const load = () => getDashboardStaff()
        .then(setStaff)
        .catch(console.error)
        .finally(() => setLoading(false));

    useEffect(() => { load(); }, []);

    const openNew = () => {
        setForm(emptyStaff);
        setEditing(null);
        setImageFile(null);
        setImagePreview('');
        setShowForm(true);
    };

    const openEdit = (s) => {
        setForm(s);
        setEditing(s.id);
        setImageFile(null);
        setImagePreview(s.profile_image || '');
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditing(null);
        setForm(emptyStaff);
        setImageFile(null);
        setImagePreview('');
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const uploadImageToCDN = async (file) => {
        const formData = new FormData();
        formData.append('images', file);
        formData.append('booking_id', 'staff-profile');
        const token = localStorage.getItem('nailflow_token');
        const res = await axios.post(`${API_URL}/api/reference-images/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                ...(token ? { Authorization: `Bearer ${token}` } : {})
            }
        });
        return res.data?.urls?.[0] || res.data?.[0]?.url || '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            let profileImageUrl = form.profile_image || '';
            if (imageFile) {
                setUploadingImage(true);
                profileImageUrl = await uploadImageToCDN(imageFile);
                setUploadingImage(false);
            }
            const payload = { ...form, profile_image: profileImageUrl };
            if (editing) await updateStaff({ ...payload, id: editing });
            else await createStaff(payload);
            closeForm();
            load();
        } catch (err) {
            setUploadingImage(false);
            alert(err.response?.data?.error || 'Error al guardar');
        } finally {
            setSaving(false);
        }
    };

    const directors = staff.filter(s => s.role === 'director');
    const members = staff.filter(s => s.role !== 'director');

    return (
        <div className="animate-fade-in max-w-6xl mx-auto">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-stone-400 mb-3">Gestión de Equipo</p>
                    <h1 className="text-4xl lg:text-5xl font-display italic text-stone-900 leading-tight">Especialistas</h1>
                </div>
                <button
                    onClick={openNew}
                    className="bg-primary text-white px-8 py-4 rounded-full shadow-soft-md hover:shadow-soft-lg active:scale-[0.98] transition-all flex items-center justify-center gap-3 font-display text-lg"
                >
                    <span className="material-symbols-outlined text-xl">person_add</span>
                    Agregar miembro
                </button>
            </header>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {Array(3).fill(0).map((_, i) => (
                        <div key={i} className="h-80 rounded-[3rem] bg-stone-100 animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="space-y-16">
                    {/* Directors Section */}
                    {directors.length > 0 && (
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-stone-300 mb-8 ml-1">Dirección</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                {directors.map(s => (
                                    <StaffCard key={s.id} member={s} onEdit={openEdit} onDelete={async (id) => { if (confirm('¿Desactivar miembro?')) { await deleteStaff(id); load(); } }} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Team Section */}
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-stone-300 mb-8 ml-1">Especialistas de Staff</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {members.map(s => (
                                <StaffCard key={s.id} member={s} onEdit={openEdit} onDelete={async (id) => { if (confirm('¿Desactivar miembro?')) { await deleteStaff(id); load(); } }} />
                            ))}

                            {/* Add New Placeholder */}
                            <button
                                onClick={openNew}
                                className="h-full min-h-[320px] rounded-[3rem] border-2 border-dashed border-stone-200 bg-stone-50/50 flex flex-col items-center justify-center p-8 group hover:border-primary/40 hover:bg-primary/5 transition-all text-stone-300 hover:text-primary"
                            >
                                <div className="w-16 h-16 rounded-full bg-white shadow-soft-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-3xl">add</span>
                                </div>
                                <span className="font-display italic text-xl">Agregar especialista</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Form */}
            {showForm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 min-h-screen">
                    <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={closeForm} />

                    <div className="bg-white rounded-[3.5rem] w-full max-w-3xl max-h-[90vh] overflow-y-auto z-10 shadow-2xl relative animate-in slide-in-from-bottom-8 duration-500 scrollbar-hide">
                        <header className="sticky top-0 bg-white/80 backdrop-blur-md px-10 py-8 border-b border-stone-100 flex items-center justify-between z-20">
                            <button onClick={closeForm} className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center text-stone-400 hover:text-primary transition-colors">
                                <span className="material-symbols-outlined text-xl">close</span>
                            </button>
                            <h2 className="font-display italic text-2xl text-stone-800">
                                {editing ? 'Editar Perfil' : 'Nuevo Miembro'}
                            </h2>
                            <div className="w-10"></div>
                        </header>

                        <form onSubmit={handleSubmit} className="p-10 space-y-8">
                            {/* Avatar selection */}
                            <div className="flex flex-col items-center gap-4">
                                <div className="relative group">
                                    <div
                                        onClick={() => fileRef.current?.click()}
                                        className="w-32 h-32 rounded-full bg-stone-50 border-4 border-white shadow-soft-lg overflow-hidden relative cursor-pointer group-hover:ring-4 group-hover:ring-primary/20 transition-all"
                                    >
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-200">
                                                <span className="material-symbols-outlined text-4xl">person</span>
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => fileRef.current?.click()}
                                        className="absolute bottom-1 right-1 w-10 h-10 rounded-full bg-primary text-white border-4 border-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                                    >
                                        <span className="material-symbols-outlined text-lg">photo_camera</span>
                                    </button>
                                </div>
                                <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Foto de Perfil</p>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Nombre Completo</label>
                                    <input
                                        required
                                        value={form.name}
                                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                        placeholder="Nombre del miembro"
                                        className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-6 py-4 text-sm font-display text-stone-700 outline-none focus:border-primary transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Especialidad</label>
                                    <input
                                        value={form.specialty || ''}
                                        onChange={e => setForm(f => ({ ...f, specialty: e.target.value }))}
                                        placeholder="ej. Especialista en Nail Art"
                                        className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-6 py-4 text-sm font-display text-stone-700 outline-none focus:border-primary transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">WhatsApp de contacto</label>
                                    <input
                                        value={form.phone || ''}
                                        onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                                        placeholder="+54 9 11 ..."
                                        className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-6 py-4 text-sm font-display text-stone-700 outline-none focus:border-primary transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Rol en el Studio</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { value: 'staff', label: 'Especialista', desc: 'Atiende citas' },
                                            { value: 'director', label: 'Director', desc: 'Admin total' }
                                        ].map(opt => (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() => setForm(f => ({ ...f, role: opt.value }))}
                                                className={`p-4 rounded-2xl border transition-all text-left ${form.role === opt.value ? 'bg-primary/5 border-primary shadow-soft-sm' : 'bg-stone-50 border-stone-100 text-stone-400'}`}
                                            >
                                                <p className={`text-sm font-bold font-display ${form.role === opt.value ? 'text-primary' : ''}`}>{opt.label}</p>
                                                <p className="text-[10px] mt-1 italic">{opt.desc}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {form.role !== 'director' && (
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">ID para Link de Reservas</label>
                                        <div className="relative">
                                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-300 text-sm font-display italic">/book/</span>
                                            <input
                                                value={form.booking_slug || ''}
                                                onChange={e => setForm(f => ({ ...f, booking_slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                                                placeholder="alias"
                                                className="w-full bg-stone-50 border border-stone-100 rounded-2xl pl-16 pr-6 py-4 text-sm font-display text-stone-700 outline-none focus:border-primary transition-all"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={saving || uploadingImage}
                                className="w-full bg-stone-900 text-white py-5 rounded-full shadow-lg hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 font-display text-lg"
                            >
                                {uploadingImage ? 'Actualizando...' : saving ? 'Guardando...' : 'Guardar Perfil'}
                                <span className="material-symbols-outlined text-xl">verified</span>
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function StaffCard({ member: s, onEdit, onDelete }) {
    const initials = s.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

    return (
        <div className="bg-white rounded-[3rem] p-8 border border-stone-100 shadow-soft-md hover:shadow-soft-lg transition-all group relative">
            <div className="absolute top-6 right-6 flex gap-2">
                <button
                    onClick={() => onEdit(s)}
                    className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center text-stone-400 hover:text-primary transition-all"
                >
                    <span className="material-symbols-outlined text-lg">edit</span>
                </button>
                <button
                    onClick={() => onDelete(s.id)}
                    className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center text-red-200 hover:text-red-400 transition-all"
                >
                    <span className="material-symbols-outlined text-lg">delete</span>
                </button>
            </div>

            <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full border-4 border-stone-50 bg-stone-50 shadow-soft-sm overflow-hidden mb-6 group-hover:scale-105 transition-transform flex items-center justify-center">
                    {s.profile_image ? (
                        <img
                            src={s.profile_image}
                            alt={s.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                            }}
                        />
                    ) : null}
                    {(!s.profile_image) ? (
                        <div className="w-full h-full flex items-center justify-center text-stone-300 font-display text-2xl font-bold bg-stone-100 italic">
                            {initials}
                        </div>
                    ) : (
                        <div className="hidden w-full h-full flex items-center justify-center text-stone-300 font-display text-2xl font-bold bg-stone-100 italic">
                            {initials}
                        </div>
                    )}
                </div>

                <div className="mb-2">
                    <h3 className="text-xl font-display font-bold text-stone-800 italic leading-tight">{s.name}</h3>
                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary mt-1">{s.role === 'director' ? 'Directora' : 'Especialista'}</p>
                </div>

                <p className="text-stone-400 text-[13px] italic mb-6 line-clamp-1 h-5">{s.specialty || 'Especialista NailFlow'}</p>

                <div className="w-full space-y-3 pt-6 border-t border-stone-50">
                    {s.phone && (
                        <div className="flex items-center justify-center gap-2 text-stone-400 text-xs font-medium">
                            <span className="material-symbols-outlined text-sm">phone_iphone</span>
                            {s.phone}
                        </div>
                    )}
                    {s.booking_slug && s.role !== 'director' && (
                        <div className="flex items-center justify-center gap-2">
                            <a
                                href={`/book/${s.booking_slug}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] font-bold text-primary bg-primary/5 px-4 py-2 rounded-full hover:bg-primary hover:text-white transition-all flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-sm">link</span>
                                nailflow.app/book/{s.booking_slug}
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
