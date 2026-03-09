# NailFlow 2 — Booking Platform

A complete nail salon booking platform with Next.js frontend, Express backend, PostgreSQL database, and CDN image management.

## 🌸 Features

- **Booking Flow**: 7-step booking with service selection, date/time picker, client info, payment, and reference image upload
- **Payment System**: MercadoPago, card, Apple Pay, and test payment methods
- **Business Rules**: 7-day minimum booking advance, deposit required before confirmation, reference images auto-delete after 14 days
- **Staff Booking Links**: `domain.com/book/{slug}` — each staff member gets their own URL
- **Admin Dashboard**: Bookings, services, staff, payments, settings managed from one place
- **CDN Integration**: Diabolical Media Manager for service images and reference photos
- **n8n Webhooks**: Auto-notification on booking confirmation
- **WhatsApp Integration**: Via n8n to notify clients and staff

## 🛠 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 14, React 18 |
| Backend | Node.js, Express |
| Database | PostgreSQL 15 |
| CDN | Diabolical Media Manager |
| Payments | MercadoPago, Card (simulated) |
| Automation | n8n |
| Deployment | Dokploy |

## 🚀 Quick Start

### With Docker Compose

```bash
docker-compose up -d
```

Then open:
- **Booking**: http://localhost:3000
- **Dashboard**: http://localhost:3000/dashboard
- **API**: http://localhost:3001

### Local Development

```bash
# Backend
cd backend
cp .env.example .env
npm install
npm run migrate
npm run seed
npm run dev

# Frontend
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

## 📋 Booking Flow

1. Select Service → shows price & deposit %
2. Select Date → min 7 days ahead
3. Select Time → based on staff availability
4. Client Info → name, phone, email
5. Pay Deposit → confirmed booking
6. Confirmation screen
7. Upload Reference Photos → only after payment

## 🔑 Environment Variables

### Backend
```
DATABASE_URL=postgresql://...
CDN_API_KEY=dmm_7tpONlAMTNtIMLjpr4gMSNqw9LGbgX6X
CDN_API_KEY_REFERENCES=dmm_XKnnaMPrgRWaRHQ21deaQ3Krz2B6iBW
MERCADOPAGO_API_KEY=
N8N_WEBHOOK_URL=
PAYMENT_TEST_MODE=true
```

### Frontend
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_CDN_KEY=dmm_7tpONlAMTNtIMLjpr4gMSNqw9LGbgX6X
```

## 📡 API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/services | List services |
| GET | /api/staff/:slug | Get staff by slug |
| GET | /api/booking/availability | Available slots |
| POST | /api/booking/create | Create booking |
| POST | /api/payment/process | Process payment |
| POST | /api/reference-images/upload | Upload images |
| GET | /api/dashboard/bookings | Admin bookings |
| GET | /api/dashboard/stats | Stats |

## 🎨 Design

- Pastel pink design system
- Mobile-first responsive layout
- Playfair Display + Inter typography
- Micro-animations and hover effects
