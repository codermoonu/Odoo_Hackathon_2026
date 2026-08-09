# Wayflow

**Wayflow** is an enterprise carpooling platform that helps employees within an organization share rides to work and similar routes — cutting commute costs, easing traffic congestion, reducing fuel consumption, and lowering environmental impact.

Wayflow is built as a full end-to-end MVP: employees can find or offer rides, confirm routes, track trips live on a map, pay through an integrated wallet, and review their ride history — while organization administrators manage employees, vehicles, and platform-wide settings.

> Status: **Working MVP / hackathon-stage product.** Core ride-sharing, trip, and tracking workflows are implemented end-to-end. Some modules (chat, advanced ride history, deeper admin analytics) are partially built or scaffolded for future work. See [Implementation Status](#implementation-status) below for the honest breakdown.

---

## Table of Contents

1. [Problem Statement & Motivation](#problem-statement--motivation)
2. [Implementation Status](#implementation-status)
3. [Features Implemented](#features-implemented)
4. [Features In Progress / Planned](#features-in-progress--planned)
5. [Tech Stack](#tech-stack)
6. [Architecture Overview](#architecture-overview)
7. [Prerequisites](#prerequisites)
8. [Installation & Setup](#installation--setup)
9. [Backend Setup](#backend-setup)
10. [Frontend Setup](#frontend-setup)
11. [Running the Project Locally](#running-the-project-locally)
12. [API & App Flow](#api--app-flow)
13. [User Journeys](#user-journeys)
14. [Screens & Pages Overview](#screens--pages-overview)
15. [Admin Functionality](#admin-functionality)
16. [Data Models Summary](#data-models-summary)
17. [Real-Time & Live Tracking](#real-time--live-tracking)
18. [Notes on Partial Features & Scaffolding](#notes-on-partial-features--scaffolding)
19. [Future Roadmap](#future-roadmap)
20. [Contributing / Usage Notes](#contributing--usage-notes)
21. [License](#license)

---

## Problem Statement & Motivation

Employees commuting to the same organization, along overlapping routes, often travel independently — increasing fuel usage, traffic congestion, parking pressure, and per-employee commute cost. Wayflow addresses this by giving organizations an internal carpooling platform where verified employees can:

- Find a ride when travelling as a passenger, or
- Offer a ride when driving their own vehicle

Both roles are available to the same employee account — a person can be a driver on one trip and a passenger on another. The platform layers ride discovery, route confirmation, trip lifecycle management, live tracking, and payments on top of this core matching idea, while a Company Administrator manages organization-wide employee, vehicle, and configuration data.

This project was built for a hackathon and is intentionally scoped as an **MVP demonstrating the complete end-to-end business workflow**, rather than a production-hardened SaaS.

---

## Implementation Status

| Module | Status |
|---|---|
| Authentication (login, signup, protected routes, roles) | ✅ Implemented |
| Profile management (edit profile, photo upload, password update) | ✅ Implemented |
| Dashboard (metrics, quick actions, recent trips) | ✅ Implemented |
| Ride search (Find a Ride) with list & map view | ✅ Implemented |
| Ride offer / publish flow | ✅ Implemented |
| Route calculation & geocoding (OSRM + Nominatim) | ✅ Implemented |
| Trip management & lifecycle (PUBLISHED → STARTED → IN_PROGRESS → COMPLETED / CANCELLED) | ✅ Implemented |
| Live trip tracking (Socket.io/WebSocket-based real-time location) | ✅ Implemented |
| Vehicle management (register, edit, seating capacity, status) | ✅ Implemented |
| Saved Places (add/edit/delete, dynamic backend-driven list) | ✅ Implemented |
| Wallet & payments (order creation, verification, top-up, trip fare payment) | ✅ Implemented |
| Admin: employee & vehicle management, org settings | ✅ Implemented |
| Reports & analytics dashboard (aggregated trip/payment/vehicle metrics) | ✅ Implemented |
| Ride notifications (in-app) | ✅ Implemented |
| Ride cancellation flow | ✅ Implemented |
| In-trip chat / voice call | 🟡 Scaffolded (socket infrastructure exists; UI/UX not fully wired) |
| Ride history (dedicated historical view beyond trip list) | 🟡 Partial |
| Intelligent ride matching / route optimization | ⏳ Planned |
| Enhanced analytics (fuel efficiency trends, vehicle-wise cost breakdown) | 🟡 Partial |

**Legend:** ✅ Fully implemented · 🟡 Partially implemented / in progress · ⏳ Planned / future work

---

## Features Implemented

### 1. Authentication & User Flow
- Splash screen and landing page
- Login and sign-up screens
- Auth context for authenticated user state, with protected routes
- Role-based split between **Employee** and **Company Administrator** flows
- Profile editing, profile image upload, password update, logout

### 2. Dashboard
- Overview page showing number of registered vehicles, wallet balance, published trips, quick action links, and recent trip activity
- Data pulled dynamically from live backend services
- Consistent visual system across cards, status badges, sections, and metric tiles

### 3. Find a Ride
- Search by pickup location, destination, date, time, seat count, and recurring-ride option
- Route is calculated and displayed for confirmation before results are shown
- Ride cards display pickup/destination, driver name, vehicle details, date/time, available seats, fare per seat, and ride status
- List view and map view supported
- "Use my location" option for nearby ride search
- Seat availability computed dynamically, with seat-urgency badge styling
- Users can request a seat and continue into the payment flow

### 4. Offer a Ride
- Employees publish rides using their registered vehicle
- Route calculated from start and destination addresses (distance, duration, geometry)
- Ride data includes pickup/destination addresses, route geometry, distance, duration, fare per seat, available seats, and trip status
- Requires at least one registered vehicle before publishing

### 5. Trip Management
- **My Trips** page listing a user's trips (as driver or passenger)
- Full trip lifecycle: `PUBLISHED → STARTED → IN_PROGRESS → COMPLETED / CANCELLED`
- Trip status transitions supported directly from the frontend
- Backend trip state is the source of truth for both tracking and reporting

### 6. Vehicle Management
- Register and manage vehicles: make/model, registration number, seating capacity, active status
- Registered vehicles feed directly into the ride-offering flow
- Admins have organization-wide vehicle oversight

### 7. Live Trip Tracking
- Real-time location sharing implemented via Socket.io (falling back to native WebSockets if Socket.io is unavailable)
- Drivers and passengers join a trip-specific room (`trip_{tripId}`) and receive live location broadcasts
- Live vehicle position, current route, and trip status update in real time on an interactive map
- Trip status changes (start / complete / cancel) are broadcast to all participants in the trip room
- Location history is logged per trip for later reference
- Tracking remains active for the duration of the trip and is driven by the same trip-state service used by the REST API

### 8. Wallet & Payments
- Wallet balance tracking
- Payment order creation and verification flow
- Payment purposes cover trip fare and wallet top-up
- Payment status tracked through the trip and wallet lifecycle
- Designed around a sandbox/test-mode payment gateway (e.g. Razorpay Test Mode), per hackathon assumptions — no real money transactions

### 9. Saved Places
- Fully dynamic, backend-driven list of frequently used pickup/destination locations (e.g. Home, Office)
- Users can add, edit, and delete saved places
- Saved places integrate directly into ride search and ride publishing to speed up address entry

### 10. Settings Module
- Profile settings, change password, profile photo update
- Saved places, help & support, logout
- Central hub linking out to trips, vehicles, payment methods, and ride history

### 11. Admin / Organization Management
- Organization setup and organization-level settings
- Employee management (view, enable/disable access)
- Vehicle record management across the organization
- Dedicated admin dashboard and admin reporting routes

### 12. Reports & Analytics
- Aggregated dashboard covering total trips, total distance travelled, completed/started trip counts, revenue from paid trips, active vehicle count, top routes, and recent trip activity
- Backend analytics/reporting controller computes these aggregates from trip, payment, and vehicle data

### 13. Ride Notifications
- In-app notifications alert users to key trip events: a seat request, a booking confirmation, a trip starting, a trip status change, and payment confirmation
- Notifications are triggered from the same trip-status and booking events that drive live tracking and trip lifecycle updates, so they stay in sync with actual trip state
- Surfaced to the user via a notification indicator/list in the app shell

### 14. Ride Cancellation
- Drivers can cancel a published or upcoming trip; passengers can cancel a booked seat
- Cancelling a trip transitions it to the `CANCELLED` status through the existing trip-status update flow, and releases the booked seat(s) back to availability
- Affected participants are notified of the cancellation in real time (via the socket layer) and through in-app notifications
- Cancellation is reflected immediately in **My Trips** and in any live tracking session for that trip

### 15. Route Calculation & Geocoding
- **Geocoding:** address-to-coordinates lookup via the Nominatim OpenStreetMap API
- **Routing:** driving route, distance, and duration calculated via the OSRM routing engine
- Route geometry stored/returned in GeoJSON-compatible `LineString` form
- Powers both ride search (route preview) and ride publishing (route confirmation)

---

## Features In Progress / Planned

These are present in the architecture or roadmap but are not yet complete, production-grade features:

- **In-trip chat & voice call** — socket infrastructure and service files exist for chat/communication, but the user-facing chat/call experience is still being built out.
- **Dedicated Ride History view** — trip records exist and are queryable, but a polished, filterable history screen (separate from "My Trips") is still evolving.
- **Enhanced analytics** — fuel efficiency trends and detailed vehicle-wise cost analysis are partially represented in the reporting data model but not fully surfaced in the UI yet.
- **Intelligent ride matching & route optimization** — currently rides are filtered by route criteria; smarter matching (e.g. partial-route overlap, ML-based ranking) is a future enhancement.

> Ride notifications and ride cancellation have moved from "planned" to fully implemented — see [Features Implemented](#features-implemented).

---

## Tech Stack

**Frontend**
- React (Vite)
- React Router for navigation
- Context API for authentication state
- Custom hooks (auth, geolocation, saved places)
- Reusable UI components: `AppShell`, `Card`, `Button`, `Modal`, `FormField`
- Service layer for REST API communication

**Backend**
- Node.js + Express
- Mongoose (MongoDB) for domain models
- Socket.io for real-time tracking, with a native `ws` WebSocket fallback
- REST API structured by domain: auth, vehicles, trips, payments, admin, route/geospatial

**External Services**
- **OSRM** (Open Source Routing Machine) — driving route calculation
- **Nominatim** (OpenStreetMap) — geocoding
- **CartoDB / OpenStreetMap** — map tiles
- Sandbox payment gateway (e.g. Razorpay Test Mode) — wallet & trip payments

---

## Architecture Overview

Wayflow follows a standard client-server architecture with a real-time layer for tracking:

```
┌─────────────────┐        REST API        ┌───────────────────┐
│  React Frontend  │ ─────────────────────▶ │  Express Backend   │
│  (Vite + Router) │ ◀───────────────────── │  (Controllers/     │
└─────────┬─────────┘                       │   Services)        │
          │                                  └─────────┬──────────┘
          │  WebSocket (Socket.io / ws)                 │
          └─────────────────────────────────────────────┤
                                                          │
                                              ┌───────────▼───────────┐
                                              │   MongoDB (Mongoose)   │
                                              │  Trips, Users,         │
                                              │  Vehicles, Payments    │
                                              └────────────────────────┘

External integrations: OSRM (routing) · Nominatim (geocoding) · Payment gateway (sandbox)
```

- **Controllers** handle request/response and business logic per domain (trips, auth, vehicles, payments, admin, route).
- **Services** encapsulate reusable logic: route calculation & geocoding, live tracking state, analytics/reporting, notifications, payment processing.
- **Socket layer** runs alongside the HTTP server, initializing Socket.io when available and falling back to a native WebSocket server at `/ws/tracking` otherwise — so live tracking works regardless of which library is installed.
- **In-memory tracking state** backs live trip tracking and location history, with MongoDB persistence layered on top for durable trip records.

---

## Prerequisites

- **Node.js** v18+ and npm
- **MongoDB** (local instance or a hosted cluster, e.g. MongoDB Atlas)
- Internet access for external services: OSRM public routing API, Nominatim geocoding API, map tiles
- A sandbox payment gateway account (e.g. Razorpay Test Mode) for wallet/payment testing

---

## Installation & Setup

```bash
# 1. Clone the repository
git clone https://github.com/<your-org>/wayflow.git
cd wayflow

# 2. Install backend dependencies
cd backend
npm install

# 3. Install frontend dependencies
cd ../frontend
npm install
```

---

## Backend Setup

```bash
cd backend
npm install
npm run dev      # starts Express server with live reload (e.g. nodemon)
# or
npm start        # starts Express server in standard mode
```

The backend exposes REST routes under `/api/*` (auth, vehicles, trips, payments, admin, route) and initializes the real-time tracking layer (`socket.js`) alongside the HTTP server.

---

## Frontend Setup

```bash
cd frontend
npm install
npm run dev       # starts Vite dev server
```

By default the Vite dev server runs on `http://localhost:5173` and communicates with the backend API and Socket.io server.

---

## Running the Project Locally

1. Start MongoDB (locally or ensure your Atlas connection string is reachable).
2. Start the backend: `cd backend && npm run dev`.
3. Start the frontend: `cd frontend && npm run dev`.
4. Open the app in your browser (typically `http://localhost:5173`).
5. Sign up as an employee, register a vehicle, and try both **Find a Ride** and **Offer a Ride** flows.
6. Start a trip to see live tracking update in real time via the socket connection.

---

## API & App Flow

High-level backend flow:

1. **Auth** — user registers/logs in; session/JWT identifies the employee and their organization.
2. **Route/Geocode** — `GET /api/route/geocode` resolves an address string to coordinates via Nominatim; `POST /api/route/preview` calculates a driving route (distance, duration, geometry) via OSRM and estimates fare.
3. **Trip creation** — `POST /api/trips` publishes a ride using the confirmed route, storing it in MongoDB (with an in-memory fallback via the tracking service if the database is unavailable).
4. **Trip discovery** — `GET /api/trips` and `GET /api/trips/:id` allow searching and viewing trip details.
5. **Trip status updates** — `POST /api/trips/:id/status` transitions a trip through its lifecycle (`STARTED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`).
6. **Live tracking (WebSocket)** — clients emit `join_trip` to subscribe to a trip room, `driver_location_update` to broadcast live GPS coordinates, and `trip_status_change` to broadcast lifecycle changes; all connected participants receive `live_location_update` / `trip_status_updated` events in real time.
7. **Payments** — once a trip is completed, a payment order is created and verified against the sandbox payment gateway, updating wallet balance or marking the trip as paid.
8. **Reporting** — aggregate endpoints compute organization-wide metrics from trips, payments, and vehicles for the analytics dashboard.

---

## User Journeys

### Employee — Find a Ride
1. Log in → Dashboard
2. Go to **Find a Ride**, enter pickup, destination, date/time, seats
3. Review the calculated route on the confirmation screen
4. Browse matching rides (list or map view)
5. Request a seat → complete payment
6. Track the ride live once the driver starts the trip
7. Cancel the booking if plans change (seat is released, driver is notified)
8. Trip completes → appears in trip history / reports

### Employee — Offer a Ride
1. Log in → ensure at least one vehicle is registered (**My Vehicle**)
2. Go to **Offer a Ride**, enter pickup, destination, date/time, seats, fare
3. Confirm the calculated route
4. Publish the trip — it becomes visible to matching searchers
5. Start the trip when ready — passengers can now track it live
6. Cancel the trip if needed (booked passengers are notified and seats are released)
7. Mark trip completed once finished

### Company Administrator
1. Log in with an admin account → Admin Dashboard
2. Manage employee records (enable/disable access)
3. Manage organization-wide vehicle records
4. Configure organization settings (fuel cost, travel cost parameters, etc.)
5. Review the admin reporting dashboard for organization-wide activity

---

## Screens & Pages Overview

| Area | Screens |
|---|---|
| Auth | Splash, Landing, Login, Sign Up |
| Dashboard | Dashboard Overview |
| Find a Ride | Find Ride, Route Confirmation, Available Rides |
| Offer a Ride | Offer Ride, Route Confirmation, My Vehicle |
| Trips | My Trips, Trip Detail, Live Tracking Map |
| Payments | Payment, Wallet |
| Settings | Profile Settings, Change Password, Saved Places, Help & Support |
| Reports | Reports & Analytics Dashboard |
| Admin | Admin Dashboard, Employee Management, Vehicle Management, Org Settings, Admin Reports |

---

## Admin Functionality

The **Company Administrator** role is responsible for platform configuration and organization data — not day-to-day ride operations. Admin capabilities include:

- Managing employee records and access (enable/disable)
- Managing registered vehicles and driver information across the organization
- Configuring organization-specific carpooling settings (fuel cost, travel cost, operational parameters)
- Monitoring employee participation via an admin reporting dashboard
- Onboarding employees onto the platform

---

## Data Models Summary

**Trip**
- `trip_id`, `driver_name`, `vehicle`
- `start_address` / `start_coords`, `dest_address` / `dest_coords`
- `route_geometry` (GeoJSON `LineString`)
- `distance_km`, `duration_mins`, `fare_per_seat`, `available_seats`
- `status`: `PUBLISHED | BOOKED | STARTED | IN_PROGRESS | COMPLETED | CANCELLED`
- `current_location`, `location_history` (live tracking data)

**Location** (embedded)
- `lat`, `lng`, `speed`, `heading`, `timestamp`

**Vehicle**
- Make/model, registration number, seating capacity, active status

**User / Employee**
- Profile info, credentials, organization association, role (employee/admin)

**Payment**
- Trip reference, amount, purpose (fare / wallet top-up), status

**Saved Place**
- Label (e.g. Home, Office), address, coordinates, owning user

> Fare is calculated centrally via a shared utility (`calculateFare`) using an organization-configurable `BASE_FARE`, `COST_PER_KM`, and `FUEL_RATE_FACTOR`, so admins can tune cost assumptions without changing calculation logic.

---

## Real-Time & Live Tracking

Live Trip Tracking is a **core, implemented feature** of Wayflow (not just scaffolding):

- The backend boots a Socket.io server when available, and transparently falls back to a native `ws` WebSocket server at `/ws/tracking` if Socket.io isn't installed — so the tracking feature degrades gracefully rather than breaking.
- Clients join a **per-trip room** (`trip_{tripId}`) so location and status updates are scoped to the relevant driver/passengers only.
- Driver location updates (`lat`, `lng`, `speed`, `heading`) are pushed to the tracking service, stored as the trip's current location, appended to a location history log, and broadcast to everyone in the trip room as `live_location_update`.
- Trip status changes (e.g. `STARTED → IN_PROGRESS → COMPLETED`) are also broadcast in real time via `trip_status_updated`, keeping both the map view and trip status UI in sync without polling.
- The same tracking-service state backs both the WebSocket layer and the REST trip endpoints, so a trip's live state and its persisted record stay consistent.

In-trip **chat and voice call** are part of the same real-time architecture conceptually, but remain at an earlier, scaffolded stage — see below.

---

## Notes on Partial Features & Scaffolding

Being transparent about what's still maturing:

- **Chat / voice call:** socket handlers and service files exist for real-time communication, but the full chat UI, message persistence, and call signaling are not yet complete.
- **Ride History (dedicated view):** trip records are fully queryable via the trips API, but a purpose-built, filterable "Ride History" screen distinct from "My Trips" is still being refined.
- **Enhanced analytics:** the reporting dashboard already aggregates trip totals, distance, revenue, and top routes; deeper metrics like fuel efficiency trends and per-vehicle cost breakdowns are partially modeled but not fully surfaced in the UI.
- **Fallback persistence:** if MongoDB is not connected, trip creation still succeeds using the in-memory tracking-service state, so the demo flow keeps working — but this fallback is not meant as a durable production data store.

---

## Future Roadmap

- Full in-trip chat and voice-call experience
- Push notifications (in addition to existing in-app notifications)
- Refund handling for cancelled trips with wallet payments already made
- Smarter ride matching (partial-route overlap, ranked suggestions) and route optimization
- Deeper analytics: fuel efficiency trends, vehicle-wise cost analysis, cost-per-km trends
- Multi-organization admin tooling refinements
- Production-grade payment gateway integration (beyond sandbox/test mode)
- Automated testing and CI pipeline

---

## Contributing / Usage Notes

This project was built as a hackathon MVP and is structured to grow into a complete employee carpooling platform. Contributions, issues, and suggestions are welcome:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes with clear messages
4. Open a pull request describing the change and its motivation

Please avoid committing real payment credentials or production secrets — use the sandbox/test environment variables described above.

---

## License

This project is provided as-is for hackathon/demo purposes. Add your preferred license (e.g. MIT) here before public distribution.
