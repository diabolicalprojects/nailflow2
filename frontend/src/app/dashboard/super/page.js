'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function SuperDashboard() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [businesses, setBusinesses] = useState([]);
    const [selectedBusinessId, setSelectedBusinessId] = useState('');
    const [message, setMessage] = useState({ text: '', type: '' });
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('nailflow_user') || '{}');
        if (user.role !== 'superadmin') {
            router.push('/login');
            return;
        }

        const fetchBusinesses = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/dashboard/settings`);
                // For simplicity, we just fetch one for now as per current schema/seed
                if (res.data.business) {
                    setBusinesses([res.data.business]);
                    setSelectedBusinessId(res.data.business.id);
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchBusinesses();
    }, [router]);

    const handleCreateOwner = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });
        setLoading(true);
        const token = localStorage.getItem('nailflow_token');

        try {
            await axios.post(`${API_URL}/api/auth/register-owner`, {
                name,
                email,
                password,
                business_id: selectedBusinessId
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            setMessage({ text: 'Dueña creada exitosamente', type: 'success' });
            setName('');
            setEmail('');
            setPassword('');
        } catch (err) {
            setMessage({ text: err.response?.data?.error || 'Error al crear dueña', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#FAF3F0',
            fontFamily: 'Inter, sans-serif'
        }}>
            <header style={{
                padding: '40px 60px',
                backgroundColor: 'white',
                borderBottom: '1px solid rgba(230, 164, 180, 0.2)'
            }}>
                <h1 style={{
                    fontFamily: 'Playfair Display, serif',
                    fontSize: '24px',
                    color: '#4B3F3A',
                    margin: 0
                }}>Panel de Superusuario</h1>
                <p style={{
                    fontSize: '12px',
                    color: '#A0928D',
                    marginTop: '4px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em'
                }}>Gestión de Dueñas de Negocio</p>
                <div style={{ marginTop: '20px' }}>
                    <button
                        onClick={() => {
                            localStorage.removeItem('nailflow_token');
                            localStorage.removeItem('nailflow_user');
                            router.push('/login');
                        }}
                        style={{ border: 'none', background: 'none', color: '#E07A7A', cursor: 'pointer', fontSize: '13px', padding: 0 }}
                    >Cerrar Sesión</button>
                </div>
            </header>

            <main style={{ padding: '60px', maxWidth: '800px', margin: '0 auto' }}>
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '32px',
                    padding: '48px',
                    boxShadow: '0 8px 32px rgba(230, 164, 180, 0.1)',
                    border: '1px solid rgba(230, 164, 180, 0.1)'
                }}>
                    <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '20px', marginBottom: '32px', color: '#4B3F3A' }}>
                        Crear Acceso a Dueña de Negocio
                    </h2>

                    <form onSubmit={handleCreateOwner} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '12px', fontWeight: 600, color: '#6D5D57' }}>Nombre Completo</label>
                            <input
                                className="form-input"
                                required
                                type="text"
                                style={{
                                    padding: '14px 18px',
                                    borderRadius: '16px',
                                    border: '1px solid rgba(230, 164, 180, 0.3)',
                                    fontSize: '14px',
                                    backgroundColor: '#fff'
                                }}
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="p.ej. Lidia Martínez"
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '12px', fontWeight: 600, color: '#6D5D57' }}>Email</label>
                            <input
                                className="form-input"
                                required
                                type="email"
                                style={{
                                    padding: '14px 18px',
                                    borderRadius: '16px',
                                    border: '1px solid rgba(230, 164, 180, 0.3)',
                                    fontSize: '14px',
                                    backgroundColor: '#fff'
                                }}
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="lidia@nailflow.com"
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '12px', fontWeight: 600, color: '#6D5D57' }}>Contraseña</label>
                            <input
                                className="form-input"
                                required
                                type="password"
                                style={{
                                    padding: '14px 18px',
                                    borderRadius: '16px',
                                    border: '1px solid rgba(230, 164, 180, 0.3)',
                                    fontSize: '14px',
                                    backgroundColor: '#fff'
                                }}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '12px', fontWeight: 600, color: '#6D5D57' }}>Negocio Asociado</label>
                            <select
                                style={{
                                    padding: '14px 18px',
                                    borderRadius: '16px',
                                    border: '1px solid rgba(230, 164, 180, 0.3)',
                                    fontSize: '14px',
                                    backgroundColor: '#fff'
                                }}
                                value={selectedBusinessId}
                                onChange={e => setSelectedBusinessId(e.target.value)}
                            >
                                {businesses.map(b => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ gridColumn: 'span 2', marginTop: '12px' }}>
                            {message.text && (
                                <div style={{
                                    padding: '12px',
                                    borderRadius: '16px',
                                    marginBottom: '24px',
                                    backgroundColor: message.type === 'success' ? '#D6F1D8' : '#FCE4E4',
                                    color: message.type === 'success' ? '#27502B' : '#E07A7A',
                                    fontSize: '14px',
                                    textAlign: 'center'
                                }}>
                                    {message.text}
                                </div>
                            )}

                            <button
                                className="btn btn-primary"
                                type="submit"
                                disabled={loading}
                                style={{
                                    width: '100%',
                                    backgroundColor: '#E6A4B4',
                                    color: 'white',
                                    padding: '18px',
                                    borderRadius: '24px',
                                    border: 'none',
                                    fontSize: '15px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    boxShadow: '0 8px 20px rgba(230, 164, 180, 0.3)'
                                }}
                            >
                                {loading ? 'Registrando...' : 'Registrar Dueña'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
