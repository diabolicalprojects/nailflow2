'use client';

import { useState, useEffect } from 'react';
import ServiceStep from './ServiceStep';
import DateStep from './DateStep';
import TimeStep from './TimeStep';
import ClientInfoStep from './ClientInfoStep';
import PaymentStep from './PaymentStep';
import ConfirmationStep from './ConfirmationStep';
import ImageUploadStep from './ImageUploadStep';
import { getStaffBySlug, getServices } from '../../lib/api';

const STEPS = [
    { key: 'service', label: 'Servicio', icon: '💅' },
    { key: 'date', label: 'Fecha', icon: '📅' },
    { key: 'time', label: 'Hora', icon: '🕐' },
    { key: 'info', label: 'Datos', icon: '👤' },
    { key: 'payment', label: 'Pago', icon: '💳' },
    { key: 'confirm', label: 'Confirmado', icon: '✅' },
    { key: 'images', label: 'Fotos', icon: '🖼️' },
];

export default function BookingFlow({ staffSlug }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [staff, setStaff] = useState(null);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Booking state
    const [booking, setBooking] = useState({
        service: null,
        date: null,
        time: null,
        staffId: null,
        clientName: '',
        clientPhone: '',
        clientEmail: '',
        notes: '',
        bookingId: null,
        depositAmount: 0,
        paymentMethod: 'test',
    });

    useEffect(() => {
        async function load() {
            try {
                setLoading(true);
                const servicesData = await getServices();
                setServices(servicesData);

                if (staffSlug) {
                    const staffData = await getStaffBySlug(staffSlug);
                    setStaff(staffData);
                    setBooking(prev => ({ ...prev, staffId: staffData.id }));
                }
            } catch (err) {
                setError('Failed to load booking data. Please try again.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [staffSlug]);

    const updateBooking = (data) => setBooking(prev => ({ ...prev, ...data }));

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

    const visibleSteps = STEPS.slice(0, -1); // Don't show 'images' in progress indicator

    if (loading) {
        return (
            <div className="booking-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="spinner" style={{ margin: '0 auto 16px' }} />
                    <p style={{ color: 'var(--color-neutral-600)' }}>Cargando...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="booking-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
                <div className="card card-body text-center" style={{ maxWidth: 400 }}>
                    <div style={{ fontSize: '3rem', marginBottom: 16 }}>😔</div>
                    <h2 className="display-md" style={{ marginBottom: 8 }}>Error</h2>
                    <p style={{ color: 'var(--color-neutral-600)', marginBottom: 24 }}>{error}</p>
                    <button className="btn btn-primary btn-full" onClick={() => window.location.reload()}>
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="booking-page">
            <div className="container container-sm">
                {/* Header */}
                <div className="booking-header">
                    <div className="booking-logo">💅</div>
                    <h1 className="display-lg text-gradient">NailFlow</h1>
                    {staff && (
                        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                            <div className="avatar">{staff.name.charAt(0)}</div>
                            <div>
                                <p className="font-semibold" style={{ color: 'var(--color-neutral-800)' }}>{staff.name}</p>
                                <p className="text-sm text-muted">Tu especialista</p>
                            </div>
                        </div>
                    )}
                    <p className="text-muted mt-2" style={{ fontSize: '0.9375rem' }}>
                        {currentStep < 5 ? 'Reserva tu cita de belleza' : 'Tu reserva está lista 🎉'}
                    </p>
                </div>

                {/* Step Indicator */}
                {currentStep < 5 && (
                    <div className="step-indicator">
                        {visibleSteps.map((step, index) => (
                            <div key={step.key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div
                                    className={`step-dot ${index === currentStep ? 'active' : index < currentStep ? 'completed' : ''}`}
                                    title={step.label}
                                />
                                {index < visibleSteps.length - 1 && <div className="step-connector" />}
                            </div>
                        ))}
                    </div>
                )}

                {/* Current Step Label */}
                {currentStep < 5 && (
                    <p style={{ textAlign: 'center', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--brand-deep)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 24 }}>
                        {STEPS[currentStep]?.icon} {STEPS[currentStep]?.label}
                    </p>
                )}

                {/* Step Content */}
                <div className="animate-fade-in" key={currentStep}>
                    {currentStep === 0 && (
                        <ServiceStep
                            services={services}
                            selected={booking.service}
                            onSelect={(service) => {
                                updateBooking({ service });
                                nextStep();
                            }}
                        />
                    )}

                    {currentStep === 1 && (
                        <DateStep
                            selected={booking.date}
                            staffId={booking.staffId}
                            onSelect={(date) => {
                                updateBooking({ date });
                                nextStep();
                            }}
                            onBack={prevStep}
                        />
                    )}

                    {currentStep === 2 && (
                        <TimeStep
                            date={booking.date}
                            staffId={booking.staffId}
                            serviceDuration={booking.service?.duration_minutes}
                            selected={booking.time}
                            onSelect={(time) => {
                                updateBooking({ time });
                                nextStep();
                            }}
                            onBack={prevStep}
                        />
                    )}

                    {currentStep === 3 && (
                        <ClientInfoStep
                            booking={booking}
                            staff={staff}
                            onUpdate={updateBooking}
                            onNext={nextStep}
                            onBack={prevStep}
                        />
                    )}

                    {currentStep === 4 && (
                        <PaymentStep
                            booking={booking}
                            onUpdate={updateBooking}
                            onSuccess={(bookingId, depositAmount) => {
                                updateBooking({ bookingId, depositAmount });
                                nextStep();
                            }}
                            onBack={prevStep}
                        />
                    )}

                    {currentStep === 5 && (
                        <ConfirmationStep
                            booking={booking}
                            onUploadImages={nextStep}
                        />
                    )}

                    {currentStep === 6 && (
                        <ImageUploadStep
                            bookingId={booking.bookingId}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
