'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('nailflow_token');
        const user = JSON.parse(localStorage.getItem('nailflow_user') || '{}');

        if (!token) {
            router.push('/login');
        } else if (user.role === 'superadmin') {
            router.push('/dashboard/super');
        } else {
            setLoading(false);
        }
    }, [router]);

    if (loading) return null;

    const Section = SECTIONS[activeSection] || DashboardHome;

    return (
        <div className="dashboard-layout" style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#FAF3F0' }}>
            <DashboardSidebar
                active={activeSection}
                onNavigate={(section) => { setActiveSection(section); setSidebarOpen(false); }}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <main className="main-content" style={{
                flex: 1,
                marginLeft: '280px',
                padding: '40px 60px',
                height: '100vh',
                overflowY: 'auto'
            }}>
                <Section />
            </main>
        </div>
    );
}
