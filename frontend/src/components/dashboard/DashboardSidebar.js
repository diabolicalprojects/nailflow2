'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const NAV_ITEMS = [
    { key: 'home', label: 'Inicio', icon: 'grid_view' },
    { key: 'bookings', label: 'Agenda', icon: 'calendar_today' },
    { key: 'services', label: 'Servicios', icon: 'auto_awesome' },
    { key: 'staff', label: 'Equipo', icon: 'group' },
    { key: 'payments', label: 'Pagos', icon: 'payments' },
    { key: 'settings', label: 'Perfil', icon: 'person' },
];

export default function DashboardSidebar({ active, onNavigate, isMobileOpen, onClose }) {
    const [user, setUser] = useState(null);
    const router = useRouter();

    useEffect(() => {
        try {
            const storedUser = JSON.parse(localStorage.getItem('nailflow_user') || '{}');
            setUser(storedUser);
        } catch (_) { }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('nailflow_token');
        localStorage.removeItem('nailflow_user');
        router.push('/login');
    };

    const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'NF';

    return (
        <>
            {/* Desktop Sidebar */}
            <aside style={{
                width: 260,
                background: 'rgba(253, 250, 247, 0.95)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRight: '1px solid rgba(230, 164, 180, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                height: '100vh',
                position: 'fixed',
                left: 0, top: 0,
                zIndex: 100,
                transition: 'transform 0.3s ease'
            }} className="sidebar-desktop">

                {/* Logo */}
                <div style={{ padding: '32px 24px 24px', borderBottom: '1px solid rgba(230, 164, 180, 0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                            width: 42, height: 42,
                            borderRadius: 14,
                            background: 'linear-gradient(135deg, #E6A4B4, #F3D7CA)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(230,164,180,0.25)',
                            fontSize: 20
                        }}>💅</div>
                        <div>
                            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, color: '#3d3434', margin: 0, fontWeight: 500 }}>
                                NailFlow
                            </h2>
                            <span style={{ fontSize: 9, color: '#c4b4b4', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700 }}>
                                Studio Admin
                            </span>
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <nav style={{ flex: 1, padding: '20px 14px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
                    <p style={{ fontSize: 9, color: '#d4c4c4', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700, padding: '4px 14px 12px' }}>
                        Menú Principal
                    </p>

                    {NAV_ITEMS.map(item => (
                        <button
                            key={item.key}
                            onClick={() => { onNavigate(item.key); onClose?.(); }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 12,
                                padding: '12px 16px',
                                borderRadius: 18,
                                border: 'none',
                                background: active === item.key
                                    ? 'rgba(230, 164, 180, 0.12)'
                                    : 'transparent',
                                color: active === item.key ? '#E6A4B4' : '#7a6868',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                textAlign: 'left',
                                fontWeight: active === item.key ? 600 : 400,
                                width: '100%'
                            }}
                        >
                            <span className="material-symbols-outlined" style={{
                                fontSize: 20,
                                fontVariationSettings: active === item.key ? "'FILL' 1" : "'FILL' 0"
                            }}>{item.icon}</span>
                            <span style={{ fontSize: 14, fontFamily: 'Inter, sans-serif' }}>{item.label}</span>
                            {active === item.key && (
                                <div style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: '#E6A4B4' }} />
                            )}
                        </button>
                    ))}

                    {/* Booking Link */}
                    <div style={{ padding: '16px 4px 8px', marginTop: 8 }}>
                        <p style={{ fontSize: 9, color: '#d4c4c4', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700, paddingLeft: 12, marginBottom: 10 }}>
                            Tu Studio
                        </p>
                        <div
                            onClick={() => window.open('/', '_blank')}
                            style={{
                                padding: '14px 16px',
                                borderRadius: 18,
                                background: 'rgba(253, 250, 247, 0.8)',
                                border: '1px solid rgba(230, 164, 180, 0.1)',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                            }}
                        >
                            <p style={{ fontSize: 10, color: '#c4b4b4', margin: 0, marginBottom: 4 }}>Link de Reservas</p>
                            <p style={{ fontSize: 12, color: '#E6A4B4', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, margin: 0 }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>link</span>
                                Ver página pública
                            </p>
                        </div>
                    </div>
                </nav>

                {/* User Profile */}
                <div style={{ padding: '20px 20px 28px', borderTop: '1px solid rgba(230, 164, 180, 0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                        <div style={{
                            width: 40, height: 40, borderRadius: '50%',
                            background: 'linear-gradient(135deg, #F3D7CA, #E6A4B4)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 13, fontWeight: 700, color: 'white',
                            boxShadow: '0 2px 8px rgba(230,164,180,0.2)'
                        }}>
                            {initials}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 13, fontWeight: 600, color: '#3d3434', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {user?.name || 'Administrador'}
                            </p>
                            <p style={{ fontSize: 10, color: '#c4b4b4', margin: 0 }}>
                                {user?.role === 'superadmin' ? 'Superusuaria' : 'Dueña de Negocio'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        style={{
                            width: '100%', padding: '10px',
                            borderRadius: 14,
                            border: '1px solid rgba(219, 168, 168, 0.2)',
                            background: 'transparent',
                            color: '#be8080',
                            fontSize: 12, fontWeight: 600, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                            transition: 'all 0.2s',
                            fontFamily: 'Inter, sans-serif',
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase'
                        }}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>logout</span>
                        Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Mobile Bottom Nav */}
            <nav className="mobile-bottom-nav" style={{
                display: 'none',
                position: 'fixed', bottom: 0, left: 0, right: 0,
                background: 'rgba(253, 250, 247, 0.95)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderTop: '1px solid rgba(230, 164, 180, 0.12)',
                padding: '10px 8px 20px',
                zIndex: 200,
                justifyContent: 'space-around',
                alignItems: 'center'
            }}>
                {NAV_ITEMS.map(item => (
                    <button
                        key={item.key}
                        onClick={() => onNavigate(item.key)}
                        style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: active === item.key ? '#E6A4B4' : '#b4a4a4',
                            padding: '4px 8px',
                            borderRadius: 12,
                            transition: 'all 0.2s'
                        }}
                    >
                        <span className="material-symbols-outlined" style={{
                            fontSize: 24,
                            fontVariationSettings: active === item.key ? "'FILL' 1" : "'FILL' 0"
                        }}>{item.icon}</span>
                        <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            {item.label}
                        </span>
                    </button>
                ))}
            </nav>

            <style>{`
                @media (max-width: 768px) {
                    .sidebar-desktop { transform: translateX(-100%) !important; }
                    .mobile-bottom-nav { display: flex !important; }
                }
            `}</style>
        </>
    );
}
