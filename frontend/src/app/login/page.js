'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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
            setError(err.response?.data?.error || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#FAF3F0',
            padding: '24px'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '400px',
                backgroundColor: 'rgba(255, 255, 255, 0.45)',
                backdropFilter: 'blur(16px)',
                borderRadius: '32px',
                padding: '40px',
                boxShadow: '0 12px 32px rgba(230, 164, 180, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.5)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        fontSize: '32px',
                        marginBottom: '12px',
                        color: '#E6A4B4'
                    }}>💅</div>
                    <h1 style={{
                        fontFamily: 'Playfair Display, serif',
                        fontSize: '28px',
                        color: '#4B3F3A',
                        margin: 0
                    }}>NailFlow Admin</h1>
                    <p style={{
                        fontSize: '12px',
                        color: '#A0928D',
                        marginTop: '8px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em'
                    }}>Ingreso al sistema</p>
                </div>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#6D5D57' }}>Email</label>
                        <input
                            type="email"
                            required
                            style={{
                                padding: '14px 18px',
                                borderRadius: '16px',
                                border: '1px solid rgba(230, 164, 180, 0.3)',
                                fontSize: '14px',
                                outline: 'none',
                                transition: 'all 0.2s',
                                backgroundColor: 'rgba(255, 255, 255, 0.6)'
                            }}
                            placeholder="admin@nailflow.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#6D5D57' }}>Contraseña</label>
                        <input
                            type="password"
                            required
                            style={{
                                padding: '14px 18px',
                                borderRadius: '16px',
                                border: '1px solid rgba(230, 164, 180, 0.3)',
                                fontSize: '14px',
                                outline: 'none',
                                transition: 'all 0.2s',
                                backgroundColor: 'rgba(255, 255, 255, 0.6)'
                            }}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {error && (
                        <div style={{
                            color: '#E07A7A',
                            fontSize: '13px',
                            textAlign: 'center',
                            backgroundColor: 'rgba(224, 122, 122, 0.1)',
                            padding: '10px',
                            borderRadius: '12px'
                        }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            marginTop: '10px',
                            backgroundColor: '#E6A4B4',
                            color: 'white',
                            padding: '16px',
                            borderRadius: '20px',
                            border: 'none',
                            fontSize: '15px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            boxShadow: '0 8px 20px rgba(230, 164, 180, 0.3)',
                            transition: 'transform 0.2s, opacity 0.2s'
                        }}
                    >
                        {loading ? 'Iniciando...' : 'Entrar'}
                    </button>
                </form>
            </div>
        </div>
    );
}
