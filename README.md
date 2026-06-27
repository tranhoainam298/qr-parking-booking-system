# QR Parking Booking System

A multi-role parking dashboard built with React, Vite, Tailwind CSS, and React Router. The application demonstrates QR-based parking reservations, handler operations, wallet recharge flows, admin management, and live GPS parking discovery with OpenStreetMap.

## Features

### User

- Search nearby parking with browser GPS and OpenStreetMap.
- Filter sites by area, postal code, distance, and availability.
- Select a parking slot and create a reservation.
- Manage bookings by status, date, site, or vehicle.
- View, download, and share QR parking tickets.
- Recharge the wallet through a simulated payment gateway.
- Review parking/recharge history and submit feedback.

### Handler

- Scan QR tickets for vehicle entry and exit.
- Create onsite bookings.
- Process cash wallet recharges.
- Monitor active parking sessions.
- Review handler-specific parking and recharge history.

### Admin

- View operational KPIs and charts.
- Manage users and parking slots.
- Review parking and recharge history.
- Manage customer feedback.

## Technology

- React 19
- Vite 6
- Tailwind CSS 3
- React Router 6
- Recharts
- Leaflet and React Leaflet
- `qrcode.react`
- OpenStreetMap tiles and Nominatim reverse geocoding

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm

### Installation

```bash
git clone https://github.com/tranhoainam298/qr-parking-booking-system.git
cd qr-parking-booking-system
npm install
npm run dev
```

Open the URL printed by Vite, normally `http://localhost:5173`.

### Production Build

```bash
npm run build
npm run preview
```

## Demo Login

The current project is a frontend prototype and does not call an authentication API. On the login page:

1. Enter any valid email address.
2. Enter a password containing at least six characters.
3. Select `Admin`, `Handler`, or `User`.

The selected role determines the dashboard and navigation menu.

## Main Routes

| Role | Route | Purpose |
| --- | --- | --- |
| Public | `/login` | Login and role selection |
| Public | `/register` | User registration prototype |
| Admin | `/admin` | Admin dashboard |
| Admin | `/admin/users` | User management |
| Admin | `/admin/parking-slots` | Parking slot management |
| Handler | `/handler` | Handler dashboard |
| Handler | `/handler/scan-qr` | Entry/exit QR workflow |
| Handler | `/handler/onsite-booking` | Onsite booking workflow |
| User | `/user` | User dashboard |
| User | `/user/search` | GPS parking search |
| User | `/user/slots` | Slot selection |
| User | `/user/book` | Booking confirmation |
| User | `/user/bookings` | Booking management |
| User | `/user/qr-ticket` | QR parking ticket |
| User | `/user/wallet` | Wallet and recharge |

## GPS and Map Notes

- The browser requests location permission when the parking search page opens.
- GPS distance calculations use the Haversine formula in `src/utils/geoUtils.js`.
- Map tiles are provided by OpenStreetMap.
- Reverse geocoding uses the public Nominatim service.
- GPS, map tiles, and reverse geocoding require an internet connection.
- If location permission is denied, parking sites remain available without distance sorting.

## Project Structure

```text
src/
├── components/shared/   Reusable UI, QR, table, modal, and map components
├── context/             Authentication and role state
├── data/                Mock users, sites, slots, bookings, and transactions
├── layouts/             Role-aware dashboard layout
├── pages/
│   ├── admin/           Admin dashboards and management screens
│   ├── auth/            Login, registration, and profile screens
│   ├── handler/         QR scanning and parking operation screens
│   └── user/            Search, booking, wallet, ticket, and history screens
└── utils/               GPS and geolocation helpers
```

## Data and Persistence

- Application data is currently sourced from `src/data/mockData.js`.
- Most mutations are held in local React state.
- User bookings created during the current browser session are stored in `sessionStorage`.
- Payment gateway, exports, scanner, and backend operations are simulated for UI demonstration.

## Privacy

The repository contains sample data only. Do not commit real user information, payment card data, API keys, or production credentials.
