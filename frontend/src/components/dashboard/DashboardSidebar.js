'use client';

const NAV_ITEMS = [
    { key: 'home', label: 'Dashboard', icon: '🏠' },
    { key: 'bookings', label: 'Reservas', icon: '📅' },
    { key: 'services', label: 'Servicios', icon: '💅' },
    { key: 'staff', label: 'Equipo', icon: '👥' },
    { key: 'payments', label: 'Pagos', icon: '💳' },
    { key: 'settings', label: 'Configuración', icon: '⚙️' },
];

export default function DashboardSidebar({ active, onNavigate, isOpen, onClose }) {
    return (
        <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
            {/* Logo */}
            <div className="sidebar-logo">
                <div className="sidebar-logo-icon">💅</div>
                <div>
                    <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-neutral-900)', lineHeight: 1.2 }}>
                        NailFlow
                    </p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--color-neutral-400)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Studio Admin
                    </p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav">
                <p className="nav-section-title">Principal</p>
                {NAV_ITEMS.map(item => (
                    <button
                        key={item.key}
                        className={`nav-item ${active === item.key ? 'active' : ''}`}
                        onClick={() => onNavigate(item.key)}
                    >
                        <span className="nav-item-icon">{item.icon}</span>
                        {item.label}
                    </button>
                ))}

                <div style={{ borderTop: '1px solid var(--color-pink-100)', margin: '24px 0 12px' }} />

                {/* Booking link */}
                <div style={{ padding: '0 12px' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-neutral-400)', marginBottom: 8, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                        Link de reservas
                    </p>
                    <div style={{
                        background: 'var(--color-pink-50)',
                        borderRadius: 'var(--radius-md)',
                        padding: '10px 12px',
                        fontSize: '0.8rem',
                        color: 'var(--brand-deep)',
                        fontWeight: 500,
                        cursor: 'pointer',
                    }}
                        onClick={() => window.open('/', '_blank')}
                    >
                        🔗 domain.com <span style={{ opacity: 0.6 }}>/book/slug</span>
                    </div>
                </div>
            </nav>

            {/* Bottom */}
            <div style={{ padding: '16px', borderTop: '1px solid var(--color-pink-100)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="avatar" style={{ width: 36, height: 36, fontSize: '0.8rem' }}>A</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-neutral-800)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            Admin
                        </p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>Studio Manager</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
