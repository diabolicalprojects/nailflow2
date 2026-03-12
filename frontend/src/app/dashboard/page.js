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
import ClientManagement from '../../components/dashboard/ClientManagement';

const SECTIONS = {
    home: DashboardHome,
    bookings: DashboardBookings,
    services: DashboardServices,
    staff: DashboardStaff,
    payments: DashboardPayments,
    settings: DashboardSettings,
    clients: ClientManagement,
};

export default function DashboardPage() {
    const [activeSection, setActiveSection] = useState('home');
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
        <>
            <div className="dashboard-layout">
                <DashboardSidebar
                    active={activeSection}
                    onNavigate={(section) => setActiveSection(section)}
                    onClose={() => { }}
                />

                <main className="dashboard-main">
                    <Section />
                </main>
            </div>

            <style jsx global>{`
                .dashboard-layout {
                    display: flex;
                    min-height: 100vh;
                    background: linear-gradient(135deg, #FAF3F0 0%, #FDF8F5 50%, #F7F0ED 100%);
                }

                .dashboard-main {
                    flex: 1;
                    margin-left: 260px;
                    padding: 44px 52px 80px;
                    min-height: 100vh;
                    overflow-y: auto;
                    transition: margin-left 0.3s ease;
                }

                @media (max-width: 768px) {
                    .dashboard-main {
                        margin-left: 0 !important;
                        padding: 28px 20px 100px;
                    }
                }

                @media (max-width: 480px) {
                    .dashboard-main {
                        padding: 20px 16px 100px;
                    }
                }

                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.4; }
                }
            `}</style>
        </>
    );
}
