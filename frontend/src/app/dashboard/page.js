'use client';

import { useState } from 'react';
import DashboardSidebar from '../../components/dashboard/DashboardSidebar';
import DashboardHome from '../../components/dashboard/DashboardHome';
import DashboardServices from '../../components/dashboard/DashboardServices';
import DashboardStaff from '../../components/dashboard/DashboardStaff';
import DashboardBookings from '../../components/dashboard/DashboardBookings';
import DashboardPayments from '../../components/dashboard/DashboardPayments';
import DashboardSettings from '../../components/dashboard/DashboardSettings';

const SECTIONS = {
    home: DashboardHome,
    bookings: DashboardBookings,
    services: DashboardServices,
    staff: DashboardStaff,
    payments: DashboardPayments,
    settings: DashboardSettings,
};

export default function DashboardPage() {
    const [activeSection, setActiveSection] = useState('home');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const Section = SECTIONS[activeSection] || DashboardHome;

    return (
        <div className="dashboard-layout">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 150 }}
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <DashboardSidebar
                active={activeSection}
                onNavigate={(section) => { setActiveSection(section); setSidebarOpen(false); }}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <main className="main-content">
                {/* Mobile Header */}
                <div style={{
                    display: 'none',
                    alignItems: 'center',
                    gap: 16,
                    marginBottom: 24,
                    '@media (max-width: 768px)': { display: 'flex' },
                }}>
                    <button
                        className="btn btn-ghost btn-icon"
                        onClick={() => setSidebarOpen(true)}
                        style={{ display: 'block' }}
                    >
                        ☰
                    </button>
                </div>

                <Section />
            </main>
        </div>
    );
}
