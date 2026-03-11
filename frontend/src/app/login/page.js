'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
            localStorage.setItem('nailflow_token', res.data.token);
            localStorage.setItem('nailflow_user', JSON.stringify(res.data.user));

            if (res.data.user.role === 'superadmin') {
                router.push('/dashboard/super');
            } else {
                router.push('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Credenciales incorrectas');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-bg-light flex items-center justify-center p-6 font-sans antialiased relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-accent/10 blur-[120px] pointer-events-none" />

            <div className="w-full max-w-md z-10">
                <div className="bg-white/70 backdrop-blur-xl rounded-[3rem] p-10 shadow-soft-lg border border-white/50 animate-fade-in">
                    <header className="text-center mb-10">
                        <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-3xl flex items-center justify-center text-3xl mx-auto mb-6 shadow-soft-md">
                            💅
                        </div>
                        <h1 className="font-display italic text-4xl text-stone-900 mb-2">NailFlow</h1>
                        <p className="text-[10px] uppercase tracking-[0.25em] text-stone-400 font-bold">Studio Management</p>
                    </header>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Email</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="tu@email.com"
                                className="w-full bg-white border border-stone-100 rounded-3xl px-6 py-4 text-sm font-display text-stone-700 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:italic placeholder:text-stone-300 shadow-sm"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Contraseña</label>
                            <div className="relative">
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-white border border-stone-100 rounded-3xl px-6 py-4 text-sm font-display text-stone-700 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-stone-300 shadow-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(p => !p)}
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-stone-300 hover:text-stone-500 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[20px]">
                                        {showPass ? 'visibility_off' : 'visibility'}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-3 text-red-400 bg-red-50/50 border border-red-100 p-4 rounded-2xl animate-shake">
                                <span className="material-symbols-outlined text-lg">error</span>
                                <p className="text-xs font-medium">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-white py-5 rounded-full shadow-soft-md hover:shadow-soft-lg active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-8"
                        >
                            {loading ? (
                                <span className="spinner w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                            ) : (
                                <>
                                    <span className="font-display text-lg tracking-wide">Ingresar al Studio</span>
                                    <span className="material-symbols-outlined font-light">arrow_forward</span>
                                </>
                            )}
                        </button>
                    </form>

                    <footer className="mt-12 text-center">
                        <p className="text-[10px] text-stone-300 italic font-medium leading-relaxed">
                            Acceso exclusivo para personal autorizado. <br />
                            &copy; 2024 NailFlow Studio.
                        </p>
                    </footer>
                </div>
            </div>
        </div>
    );
}
