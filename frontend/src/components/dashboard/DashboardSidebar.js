'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const NAV_ITEMS = [
    { key: 'home', label: 'Inicio', icon: 'grid_view' },
    { key: 'bookings', label: 'Agenda', icon: 'calendar_today' },
    { key: 'services', label: 'Servicios', icon: '💅' },
    { key: 'staff', label: 'Equipo', icon: 'group' },
    { key: 'payments', label: 'Pagos', icon: 'payments' },
    { key: 'settings', label: 'Perfil', icon: 'person' },
];

export default function DashboardSidebar({ active, onNavigate, isOpen, onClose }) {
    const [user, setUser] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('nailflow_user') || '{}');
        setUser(storedUser);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('nailflow_token');
        localStorage.removeItem('nailflow_user');
        router.push('/login');
    };

    return (
        <aside className={`sidebar ${isOpen ? 'open' : ''}`} style={{
            width: '280px',
            backgroundColor: 'white',
            borderRight: '1px solid rgba(230, 164, 180, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            zIndex: 100
        }}>
            {/* Logo Section */}
            <div style={{ padding: '32px 24px', borderBottom: '1px solid rgba(230, 164, 180, 0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        backgroundColor: '#E6A4B4',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                        color: 'white',
                        boxShadow: '0 4px 12px rgba(230, 164, 180, 0.3)'
                    }}>💅</div>
                    <div>
                        <h2 style={{
                            fontFamily: 'Playfair Display, serif',
                            fontSize: '18px',
                            color: '#4B3F3A',
                            margin: 0
                        }}>NailFlow</h2>
                        <span style={{
                            fontSize: '10px',
                            color: '#A0928D',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            fontWeight: 600
                        }}>Studio Admin</span>
                    </div>
                </div>
            </div>

            {/* Navigation Section */}
            <nav style={{ flex: 1, padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <p style={{
                    fontSize: '10px',
                    color: '#D1C8C5',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    fontWeight: 700,
                    padding: '0 12px 8px'
                }}>Menú Principal</p>

                {NAV_ITEMS.map(item => (
                    <button
                        key={item.key}
                        onClick={() => onNavigate(item.key)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 16px',
                            borderRadius: '16px',
                            border: 'none',
                            background: active === item.key ? 'rgba(230, 164, 180, 0.1)' : 'transparent',
                            color: active === item.key ? '#E6A4B4' : '#6D5D57',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            textAlign: 'left',
                            fontWeight: active === item.key ? 600 : 500
                        }}
                    >
                        {item.icon.length > 2 ? (
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{item.icon}</span>
                        ) : (
                            <span style={{ fontSize: '18px' }}>{item.icon}</span>
                        )}
                        <span style={{ fontSize: '14px' }}>{item.label}</span>
                    </button>
                ))}

                <div style={{ padding: '24px 12px 8px' }}>
                    <p style={{
                        fontSize: '10px',
                        color: '#D1C8C5',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        fontWeight: 700,
                        marginBottom: '12px'
                    }}>Tu Studio</p>
                    <div
                        onClick={() => window.open('/', '_blank')}
                        style={{
                            padding: '14px',
                            backgroundColor: '#FAF3F0',
                            borderRadius: '16px',
                            cursor: 'pointer',
                            border: '1px solid rgba(230, 164, 180, 0.1)',
                            transition: 'all 0.2s'
                        }}
                    >
                        <p style={{ fontSize: '11px', color: '#A0928D', marginBottom: '4px' }}>Link de Reservas</p>
                        <p style={{ fontSize: '13px', color: '#E6A4B4', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>link</span>
                            Ver página pública
                        </p>
                    </div>
                </div>
            </nav>

            {/* User Profile Section */}
            <div style={{ padding: '24px', borderTop: '1px solid rgba(230, 164, 180, 0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: '#F3D7CA',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#4B3F3A',
                        fontWeight: 700,
                        fontSize: '14px'
                    }}>
                        {user?.name?.[0] || 'A'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                            fontSize: '14px',
                            fontWeight: 600,
                            color: '#4B3F3A',
                            margin: 0,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }}>{user?.name || 'Administrador'}</p>
                        <p style={{ fontSize: '11px', color: '#A0928D', margin: 0 }}>
                            {user?.role === 'superadmin' ? 'Superusuario' : 'Dueña de Negocio'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '12px',
                        border: '1px solid rgba(224, 122, 122, 0.2)',
                        backgroundColor: 'transparent',
                        color: '#E07A7A',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                    }}
                >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>logout</span>
                    Cerrar Sesión
                </button>
            </div>
        </aside>
    );
}
