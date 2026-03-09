
# NailFlow System Architecture

Client Browser
↓
Next.js Frontend
↓
Express Backend API
↓
PostgreSQL Database

External Integrations:
- n8n automation
- Payment providers
- CDN image storage

## Components

Frontend (Next.js)
- Booking UI
- Dashboard UI

Backend (Node.js + Express)
- Booking logic
- Payment verification
- Staff assignment
- Webhook triggers

Database
Stores:
- clients
- services
- staff
- bookings
- payments
- reference images

CDN
Handles image storage and delivery.

n8n
Handles automation workflows.
