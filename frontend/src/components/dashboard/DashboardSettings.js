'use client';

import { useState, useEffect, useRef } from 'react';
import { getSettings, updateSettings } from '../../lib/api';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const THEMES = [
    {
        key: 'nude-rose',
        label: 'Nude Rose',
        colors: ['#F5E6E8', '#E6A4B4', '#A66C81'],
        primary: '#E6A4B4',
        secondary: '#F3D7CA'
    },
    {
        key: 'minimal-gray',
        label: 'Minimal Gray',
        colors: ['#f2f2f2', '#d1d1d1', '#8c8c8c'],
        primary: '#9ca3af',
        secondary: '#f3f4f6'
    },
    {
        key: 'soft-lavender',
        label: 'Soft Lavender',
        colors: ['#f4effa', '#d6c4e8', '#9b89b3'],
        primary: '#c4b5d4',
        secondary: '#ede8f5'
    },
];

export default function DashboardSettings() {
    const [form, setForm] = useState({
        name: '',
        brand_color_primary: '#E6A4B4',
        brand_color_secondary: '#F3D7CA',
        booking_min_days: 7,
        n8n_webhook_url: '',
    });
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [logoPreview, setLogoPreview] = useState('');
    const [logoFile, setLogoFile] = useState(null);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [activeTheme, setActiveTheme] = useState('nude-rose');
    const logoRef = useRef(null);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('nailflow_user') || '{}');
        setUser(storedUser);

        getSettings().then(({ business, settings }) => {
            setForm({
                name: business?.name || '',
                logo_url: business?.logo_url || '',
                brand_color_primary: business?.brand_color_primary || '#E6A4B4',
                brand_color_secondary: business?.brand_color_secondary || '#F3D7CA',
                booking_min_days: settings?.booking_min_days || 7,
                n8n_webhook_url: settings?.n8n_webhook_url || '',
            });
            setLogoPreview(business?.logo_url || '');
        }).catch(console.error).finally(() => setLoading(false));
    }, []);

    const handleLogoChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setLogoFile(file);
        setLogoPreview(URL.createObjectURL(file));
    };

    const uploadLogo = async (file) => {
        const formData = new FormData();
        formData.append('images', file);
        formData.append('booking_id', 'business-logo');
        const token = localStorage.getItem('nailflow_token');
        const res = await axios.post(`${API_URL}/api/reference-images/upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
        });
        return res.data?.urls?.[0] || res.data?.[0]?.url || '';
    };

    const applyTheme = (theme) => {
        setActiveTheme(theme.key);
        setForm(f => ({ ...f, brand_color_primary: theme.primary, brand_color_secondary: theme.secondary }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            let logo_url = form.logo_url || '';
            if (logoFile) {
                setUploadingLogo(true);
                logo_url = await uploadLogo(logoFile);
                setUploadingLogo(false);
            }
            await updateSettings({ ...form, logo_url });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            setUploadingLogo(false);
            alert('Error al guardar: ' + (err.response?.data?.error || err.message));
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto space-y-8 animate-pulse">
                <div className="h-40 rounded-[3rem] bg-stone-100" />
                <div className="h-80 rounded-[3rem] bg-stone-100" />
            </div>
        );
    }

    return (
        <div className="animate-fade-in max-w-2xl mx-auto">
            {/* Header */}
            <header className="mb-12">
                <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-stone-400 mb-3">Identidad Visual</p>
                <h1 className="text-4xl lg:text-5xl font-display italic text-stone-900 leading-tight">Personalización</h1>
            </header>

            <form onSubmit={handleSubmit} className="space-y-10 pb-20">
                {/* Branding Card */}
                <section className="bg-white/60 backdrop-blur-md rounded-[3rem] p-10 border border-white shadow-soft-lg">
                    <h2 className="text-2xl font-display font-medium text-stone-800 italic mb-1">Identidad de Marca</h2>
                    <p className="text-stone-400 text-xs italic mb-10 leading-relaxed">Personaliza el logo y nombre de tu studio.</p>

                    <div className="flex flex-col sm:flex-row items-center gap-10">
                        <div className="relative group">
                            <div
                                onClick={() => logoRef.current?.click()}
                                className="w-32 h-32 rounded-full border-4 border-white shadow-soft-lg bg-stone-50 flex items-center justify-center overflow-hidden cursor-pointer group-hover:scale-105 transition-all"
                            >
                                {logoPreview ? (
                                    <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="material-symbols-outlined text-stone-200 text-4xl">auto_fix_high</span>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => logoRef.current?.click()}
                                className="absolute bottom-1 right-1 w-10 h-10 rounded-full bg-primary text-white border-4 border-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                            >
                                <span className="material-symbols-outlined text-lg">photo_camera</span>
                            </button>
                            <input ref={logoRef} type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                        </div>

                        <div className="flex-1 space-y-2 w-full">
                            <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Nombre del Estudio</label>
                            <input
                                value={form.name}
                                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                placeholder="Tu marca aquí"
                                className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-6 py-4 text-sm font-display text-stone-700 outline-none focus:border-primary transition-all"
                            />
                        </div>
                    </div>
                </section>

                {/* Themes Card */}
                <section className="bg-white/60 backdrop-blur-md rounded-[3rem] p-10 border border-white shadow-soft-lg">
                    <h2 className="text-2xl font-display font-medium text-stone-800 italic mb-1">Atmósfera</h2>
                    <p className="text-stone-400 text-xs italic mb-10 leading-relaxed">Elige la paleta cromática de tu página pública.</p>

                    <div className="space-y-4">
                        {THEMES.map(theme => (
                            <button
                                key={theme.key}
                                type="button"
                                onClick={() => applyTheme(theme)}
                                className={`w-full flex items-center justify-between p-6 rounded-3xl border transition-all ${activeTheme === theme.key ? 'bg-white border-primary shadow-soft-md' : 'bg-stone-50/50 border-stone-100 hover:bg-white'}`}
                            >
                                <div className="flex items-center gap-6">
                                    <div className="flex -space-x-3">
                                        {theme.colors.map((c, i) => (
                                            <div key={i} className="w-10 h-10 rounded-full border-4 border-white shadow-soft-sm" style={{ backgroundColor: c }} />
                                        ))}
                                    </div>
                                    <span className="font-display italic text-xl text-stone-700">{theme.label}</span>
                                </div>
                                {activeTheme === theme.key && (
                                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white">
                                        <span className="material-symbols-outlined text-[14px] font-bold">check</span>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Booking Rules Card */}
                <section className="bg-white/60 backdrop-blur-md rounded-[3rem] p-10 border border-white shadow-soft-lg">
                    <h2 className="text-2xl font-display font-medium text-stone-800 italic mb-1">Reglas de Reserva</h2>
                    <p className="text-stone-400 text-xs italic mb-10 leading-relaxed">Gestiona los tiempos de antelación para tus clientas.</p>

                    <div className="space-y-6">
                        <div className="flex justify-between items-end mb-2">
                            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Anticipación mínima</label>
                            <span className="text-lg font-display font-bold text-primary italic">{form.booking_min_days} días</span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="30"
                            value={form.booking_min_days}
                            onChange={e => setForm(f => ({ ...f, booking_min_days: parseInt(e.target.value) }))}
                            className="w-full bg-stone-100 h-2 rounded-full appearance-none accent-primary cursor-pointer hover:accent-primary-hover"
                        />
                        <div className="flex justify-between px-1">
                            <span className="text-[9px] font-bold text-stone-300 uppercase">1 día</span>
                            <span className="text-[9px] font-bold text-stone-300 uppercase">30 días</span>
                        </div>
                    </div>
                </section>

                {/* Integration Card */}
                <section className="bg-white/60 backdrop-blur-md rounded-[3rem] p-10 border border-white shadow-soft-lg">
                    <h2 className="text-2xl font-display font-medium text-stone-800 italic mb-1">Automatización</h2>
                    <p className="text-stone-400 text-xs italic mb-10 leading-relaxed">Conecta tu studio con n8n para notificaciones automáticas.</p>

                    <div className="space-y-4">
                        <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">n8n Webhook URL</label>
                        <input
                            value={form.n8n_webhook_url || ''}
                            onChange={e => setForm(f => ({ ...f, n8n_webhook_url: e.target.value }))}
                            placeholder="https://n8n.tudominio.com/..."
                            className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-6 py-4 text-sm font-display text-stone-700 outline-none focus:border-primary transition-all"
                        />
                    </div>
                </section>

                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-md px-6 z-[60]">
                    <button
                        type="submit"
                        disabled={saving || uploadingLogo}
                        className={`w-full py-5 rounded-full shadow-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 font-display text-xl ${saved ? 'bg-green-500 text-white' : 'bg-stone-900 text-white hover:bg-black'}`}
                    >
                        {uploadingLogo ? 'Sincronizando...' : saving ? 'Guardando...' : saved ? '✓ Cambios Guardados' : 'Confirmar Cambios'}
                        <span className="material-symbols-outlined text-2xl">verified_user</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
