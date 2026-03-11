'use client';

import { useState, useEffect } from 'react';
import SplashStep from './SplashStep';
import WelcomeStep from './WelcomeStep';
import ServiceStep from './ServiceStep';
import DateTimeStep from './DateTimeStep';
import InspirationStep from './InspirationStep';
import SummaryStep from './SummaryStep';
import PaymentStep from './PaymentStep';
import ConfirmationStep from './ConfirmationStep';
import MobileContainer from '../ui/MobileContainer';
import { getStaffBySlug, getServices } from '../../lib/api';

const STEPS = [
    { key: 'splash', label: 'Inicio' },
    { key: 'welcome', label: 'Bienvenida' },
    { key: 'service', label: 'Servicio' },
    { key: 'datetime', label: 'Fecha y Hora' },
    { key: 'inspiration', label: 'Inspiración' },
    { key: 'summary', label: 'Resumen' },
    { key: 'payment', label: 'Pago' },
    { key: 'confirm', label: 'Confirmado' },
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
        referenceImages: [],
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
                } else if (servicesData.length > 0) {
                    // Default to first staff if no slug provided, or fetch all staff
                    // For now, assume staffId is handled by backend or default
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

    if (loading) {
        return (
            <div className="min-h-screen bg-bg-light flex items-center justify-center">
                <div className="text-center">
                    <div className="spinner w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-stone-400 font-display italic">Preparando tu experiencia...</p>
                </div>
            </div>
        );
    }

    return (
        <MobileContainer>
            <div className="flex-1 flex flex-col h-full overflow-y-auto scrollbar-hide">
                {currentStep === 0 && (
                    <SplashStep
                        onComplete={nextStep}
                        businessName="NailFlow"
                    />
                )}

                {currentStep === 1 && (
                    <WelcomeStep
                        staff={staff}
                        booking={booking}
                        onUpdate={updateBooking}
                        onNext={nextStep}
                    />
                )}

                {currentStep === 2 && (
                    <ServiceStep
                        services={services}
                        selected={booking.service}
                        onSelect={(service) => {
                            updateBooking({ service });
                            nextStep();
                        }}
                        onBack={prevStep}
                    />
                )}

                {currentStep === 3 && (
                    <DateTimeStep
                        selectedDate={booking.date}
                        selectedTime={booking.time}
                        staffId={booking.staffId}
                        serviceDuration={booking.service?.duration_minutes}
                        onSelect={(date, time) => {
                            updateBooking({ date, time });
                            nextStep();
                        }}
                        onBack={prevStep}
                    />
                )}

                {currentStep === 4 && (
                    <InspirationStep
                        selectedImages={booking.referenceImages}
                        onUpdate={updateBooking}
                        onNext={nextStep}
                        onBack={prevStep}
                    />
                )}

                {currentStep === 5 && (
                    <SummaryStep
                        booking={booking}
                        staff={staff}
                        onUpdate={updateBooking}
                        onNext={nextStep}
                        onBack={prevStep}
                    />
                )}

                {currentStep === 6 && (
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

                {currentStep === 7 && (
                    <ConfirmationStep
                        booking={booking}
                        businessName="NailFlow Studio"
                    />
                )}
            </div>
        </MobileContainer>
    );
}
