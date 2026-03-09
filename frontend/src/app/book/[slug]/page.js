'use client';

import { use } from 'react';
import BookingFlow from '../../../components/booking/BookingFlow';

export default function StaffBookingPage({ params }) {
    const { slug } = use(params);
    return <BookingFlow staffSlug={slug} />;
}
