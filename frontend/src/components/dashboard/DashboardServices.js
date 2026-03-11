'use client';

import { useState, useEffect, useRef } from 'react';
import { getDashboardServices, createService, updateService, deleteService } from '../../lib/api';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const emptyForm = {
    name: '',
    description: '',
    price: '',
    duration_minutes: 60,
    deposit_percentage: 30,
    image_url: ''
};

const DURATION_OPTIONS = [30, 45, 60, 90, 120, 150, 180];

export default function DashboardServices() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [uploadingImage, setUploadingImage] = useState(false);
    const fileRef = useRef(null);

    const load = () => getDashboardServices()
        .then(setServices)
        .catch(console.error)
        .finally(() => setLoading(false));

    useEffect(() => { load(); }, []);

    const openNew = () => {
        setForm(emptyForm);
        setEditing(null);
        setImageFile(null);
        setImagePreview('');
        setShowForm(true);
    };

    const openEdit = (s) => {
        setForm(s);
        setEditing(s.id);
        setImageFile(null);
        setImagePreview(s.image_url || '');
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditing(null);
        setForm(emptyForm);
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
        formData.append('booking_id', 'service-thumbnail');
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
            let finalImageUrl = form.image_url;

            if (imageFile) {
                setUploadingImage(true);
                finalImageUrl = await uploadImageToCDN(imageFile);
                setUploadingImage(false);
            }

            const payload = { ...form, image_url: finalImageUrl };

            if (editing) {
                await updateService({ ...payload, id: editing });
            } else {
                await createService(payload);
            }
            closeForm();
            load();
        } catch (err) {
            setUploadingImage(false);
            alert('Error: ' + (err.response?.data?.error || err.message));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Desactivar este servicio?')) return;
        await deleteService(id).catch(console.error);
        load();
    };

    return (
        <div className="animate-fade-in max-w-6xl mx-auto">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-stone-400 mb-3">Gestión de Catálogo</p>
                    <h1 className="text-4xl lg:text-5xl font-display italic text-stone-900 leading-tight">Servicios</h1>
                </div>
                <button
                    onClick={openNew}
                    className="bg-primary text-white px-8 py-4 rounded-full shadow-soft-md hover:shadow-soft-lg active:scale-[0.98] transition-all flex items-center justify-center gap-3 font-display text-lg"
                >
                    <span className="material-symbols-outlined text-xl">add</span>
                    Nuevo Servicio
                </button>
            </header>

            {/* Services Grid */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {Array(3).fill(0).map((_, i) => (
                        <div key={i} className="aspect-[4/5] rounded-[2.5rem] bg-stone-100 animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services.map(s => (
                        <ServiceCard key={s.id} service={s} onEdit={openEdit} onDelete={handleDelete} />
                    ))}

                    {/* Add new placeholder card */}
                    <button
                        onClick={openNew}
                        className="aspect-[4/5] rounded-[2.5rem] border-2 border-dashed border-stone-200 bg-stone-50/50 flex flex-col items-center justify-center p-8 group hover:border-primary/40 hover:bg-primary/5 transition-all text-stone-300 hover:text-primary"
                    >
                        <div className="w-16 h-16 rounded-full bg-white shadow-soft-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-3xl">add</span>
                        </div>
                        <span className="font-display italic text-xl">Agregar servicio</span>
                    </button>
                </div>
            )}

            {/* Modal Form */}
            {showForm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 min-h-screen">
                    <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={closeForm} />

                    <div className="bg-white rounded-[3rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto z-10 shadow-2xl relative animate-in fade-in zoom-in duration-300 scrollbar-hide">
                        <header className="sticky top-0 bg-white/80 backdrop-blur-md px-10 py-8 border-b border-stone-100 flex items-center justify-between z-20">
                            <button onClick={closeForm} className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center text-stone-400 hover:text-primary transition-colors">
                                <span className="material-symbols-outlined text-xl">close</span>
                            </button>
                            <h2 className="font-display italic text-2xl text-stone-800">
                                {editing ? 'Editar Servicio' : 'Nuevo Servicio'}
                            </h2>
                            <div className="w-10"></div>
                        </header>

                        <form onSubmit={handleSubmit} className="p-10 space-y-8">
                            {/* Image Selection */}
                            <div className="flex flex-col items-center gap-4">
                                <div
                                    onClick={() => fileRef.current?.click()}
                                    className="w-full aspect-video rounded-3xl bg-stone-50 border-2 border-dashed border-stone-200 overflow-hidden relative group cursor-pointer"
                                >
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-300 gap-3">
                                            <span className="material-symbols-outlined text-4xl">photo_camera</span>
                                            <span className="text-[10px] font-bold uppercase tracking-wider">Subir imagen comercial</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <span className="text-white text-sm font-medium">Cambiar imagen</span>
                                    </div>
                                </div>
                                <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Nombre</label>
                                    <input
                                        required
                                        value={form.name}
                                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                        placeholder="ej. Esmaltado Semipermanente"
                                        className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-6 py-4 text-sm font-display text-stone-700 outline-none focus:border-primary transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Descripción</label>
                                    <textarea
                                        rows={3}
                                        value={form.description || ''}
                                        onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                        placeholder="Detalla qué incluye el servicio..."
                                        className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-6 py-4 text-sm font-display text-stone-700 outline-none focus:border-primary transition-all resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Precio ($)</label>
                                        <input
                                            required
                                            type="number"
                                            value={form.price}
                                            onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                                            className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-6 py-4 text-sm font-display text-stone-700 outline-none focus:border-primary transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Duración (min)</label>
                                        <select
                                            value={form.duration_minutes}
                                            onChange={e => setForm(f => ({ ...f, duration_minutes: parseInt(e.target.value) }))}
                                            className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-6 py-4 text-sm font-display text-stone-700 outline-none focus:border-primary transition-all appearance-none"
                                        >
                                            {DURATION_OPTIONS.map(d => <option key={d} value={d}>{d} minutos</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center ml-1">
                                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Anticipo</label>
                                        <span className="text-sm font-bold text-primary">{form.deposit_percentage}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        step="10"
                                        value={form.deposit_percentage}
                                        onChange={e => setForm(f => ({ ...f, deposit_percentage: parseInt(e.target.value) }))}
                                        className="w-full bg-stone-100 h-1.5 rounded-full appearance-none accent-primary cursor-pointer"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={saving || uploadingImage}
                                className="w-full bg-stone-900 text-white py-5 rounded-full shadow-lg hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 font-display text-lg"
                            >
                                {uploadingImage ? 'Procesando imagen...' : saving ? 'Guardando...' : 'Guardar Servicio'}
                                <span className="material-symbols-outlined text-xl">save</span>
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function ServiceCard({ service, onEdit, onDelete }) {
    return (
        <div className="group bg-white rounded-[2.5rem] overflow-hidden border border-stone-100 shadow-soft-md hover:shadow-soft-lg transition-all flex flex-col">
            <div className="aspect-video relative overflow-hidden">
                {service.image_url ? (
                    <img src={service.image_url} alt={service.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                ) : (
                    <div className="w-full h-full bg-stone-50 flex items-center justify-center text-stone-200">
                        <span className="material-symbols-outlined text-5xl">auto_awesome</span>
                    </div>
                )}
                <div className="absolute top-4 right-4 flex gap-2">
                    <button
                        onClick={() => onEdit(service)}
                        className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md shadow-soft-sm flex items-center justify-center text-stone-600 hover:text-primary hover:scale-110 transition-all"
                    >
                        <span className="material-symbols-outlined text-lg">edit</span>
                    </button>
                    <button
                        onClick={() => onDelete(service.id)}
                        className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md shadow-soft-sm flex items-center justify-center text-red-300 hover:text-red-500 hover:scale-110 transition-all"
                    >
                        <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                </div>
                {!service.is_active && (
                    <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/30">Inactivo</span>
                    </div>
                )}
            </div>
            <div className="p-8 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="font-display italic text-2xl text-stone-800 leading-tight flex-1">{service.name}</h3>
                    <div className="bg-stone-50 px-3 py-1 rounded-lg">
                        <span className="text-xl font-display font-bold text-stone-900">${Number(service.price).toFixed(0)}</span>
                    </div>
                </div>
                <p className="text-stone-400 text-sm line-clamp-2 mb-6 italic leading-relaxed">{service.description || 'Sin descripción disponible.'}</p>
                <div className="mt-auto flex items-center gap-6 pt-6 border-t border-stone-50">
                    <div className="flex items-center gap-2 text-stone-500">
                        <span className="material-symbols-outlined text-sm text-primary/60">schedule</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider">{service.duration_minutes} min</span>
                    </div>
                    <div className="flex items-center gap-2 text-stone-500">
                        <span className="material-symbols-outlined text-sm text-primary/60">payments</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider">{service.deposit_percentage}% seña</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
