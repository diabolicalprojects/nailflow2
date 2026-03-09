
# NailFlow — Implementation Plan

## Objective
Build a booking platform for nailtech businesses allowing clients to book services, pay deposits, upload reference images, and receive WhatsApp notifications.

Each business runs its own instance (not multi‑tenant).

## Core Modules
Client Booking Interface
Business Dashboard
Staff Management
Service Management
Payment + Deposit System
WhatsApp Automation (n8n)
CDN Image Management

## Booking Flow
1. Select Service
2. Select Date
3. Select Time
4. Enter Client Information
5. Pay Deposit
6. Booking Confirmed
7. Upload Reference Photos

Reference images upload only after payment confirmation.

## Booking Restrictions
Minimum booking: 7 days in advance.

## Deposit Rules
Deposit required before booking confirmation.
Deposit percentage defined per service.

## Payment Methods (Demo)
- MercadoPago
- Apple Pay
- Credit / Debit Card
- Test Payment Method

## Automation
n8n handles:
- Booking confirmation
- Staff notification
- 24h reminder

## Media Handling
Reference photos auto delete after 14 days.

## Booking Links
Root: domain.com
Staff: domain.com/book/{staff}
Example: nailsmaria.com/book/lidia
