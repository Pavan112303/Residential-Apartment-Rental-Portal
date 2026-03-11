# 🏠 Residential Apartment Rental Portal

> A full-stack apartment rental management platform with separate Tenant and Admin portals, built with Angular, Flask, and PostgreSQL.

[![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-3.0-black?logo=flask)](https://flask.palletsprojects.com)
[![Angular](https://img.shields.io/badge/Angular-18-red?logo=angular)](https://angular.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?logo=postgresql)](https://postgresql.org)
[![Railway](https://img.shields.io/badge/Deployed%20on-Railway-0B0D0E?logo=railway)](https://railway.app)

---

## 📋 Project Description

The **Residential Apartment Rental Portal** (KOTS Portal) is a complete apartment management solution connecting tenants and administrators in a unified platform. Tenants can discover available units, submit booking requests, manage leases, raise maintenance tickets, and track payments. Administrators get a full command centre — managing towers, approving bookings, generating leases, tracking financials, and overseeing maintenance workflows.

---

## ✨ Key Features

### 🧑‍💼 Tenant Portal
- **Property Discovery** — Browse towers with real-time unit availability, location filters, and AI-powered recommendations
- **Interactive Map View** — Find properties using a Leaflet.js map with GPS proximity sorting
- **Booking Workflow** — Submit booking requests with move-in date and lease term; track status (Pending → Approved → Booked)
- **Combined Initial Payment** — Pay Security Deposit + First Month's Rent together with a clear fare breakdown
- **Lease Management** — View active leases, download PDF agreements, request vacate
- **Maintenance Requests** — Submit categorized maintenance tickets with priority levels
- **Payment History** — View complete transaction history with upcoming rent dues
- **Real-time Notifications** — In-app alerts for booking approvals, rejections, and maintenance updates
- **Tower Reviews** — Read and submit reviews for properties

### 🔐 Admin Portal
- **Tower Management** — Add/edit towers with images, location, amenities, floor layouts
- **Unit Management** — Configure individual units with pricing, images, and status
- **Booking Approvals** — Review and approve/reject pending booking requests
- **Unit Hold System** — Approved bookings automatically lock the unit for 6 hours preventing duplicates
- **Lease Administration** — Auto-generated PDF leases on payment, manage vacate requests
- **Maintenance Oversight** — Review tickets, assign priority, update resolution status
- **Payments Ledger** — View all payments across tenants with filtering
- **Analytics Dashboard** — Revenue charts, occupancy rates, and lease lifecycle metrics
- **Activity Logs** — Complete audit trail of admin and user actions

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Angular 18 (Standalone Components) |
| Styling | Tailwind CSS v3 |
| Backend | Python 3.11 · Flask 3.0 |
| ORM | SQLAlchemy 2.0 |
| Database | PostgreSQL 15 |
| Authentication | JWT (PyJWT) |
| PDF Generation | ReportLab |
| Maps | Leaflet.js (CDN) |
| WSGI Server | Gunicorn |
| Deployment | Railway |

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────┐
│                Railway                  │
│  ┌─────────────┐   ┌──────────────────┐ │
│  │  Frontend   │   │    Backend API   │ │
│  │  (Angular)  │──▶│    (Flask +      │ │
│  │  Static     │   │    Gunicorn)     │ │
│  │  Hosting    │   │    :8080         │ │
│  └─────────────┘   └────────┬─────────┘ │
│                             │           │
│                   ┌─────────▼─────────┐ │
│                   │    PostgreSQL      │ │
│                   │    (Railway DB)    │ │
│                   └───────────────────┘ │
└─────────────────────────────────────────┘
```

---

## 🗄 Database Design Overview

| Table | Description |
|---|---|
| `users` | Tenant and admin accounts with JWT auth |
| `towers` | Residential complexes with location and amenities |
| `units` | Individual apartments with pricing and status |
| `bookings` | Booking requests with approval workflow |
| `leases` | Active leases with PDF paths and vacate tracking |
| `payments` | Payment records (Deposit, Rent, etc.) |
| `maintenance_requests` | Service tickets with status lifecycle |
| `reviews` | Tower ratings from tenants |
| `activity_logs` | Full audit trail |
| `user_login_audit` | Login activity tracking |
| `amenities` | Tower/unit amenities |

---

## ⚡ Installation Guide

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+

### Clone the Repository
```bash
git clone https://github.com/your-username/residential-apartment-rental-portal.git
cd residential-apartment-rental-portal
```

---

## 🖥 Local Development Setup

### 1. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
.\venv\Scripts\Activate        # Windows
source venv/bin/activate        # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
copy .env.example .env          # Windows
cp .env.example .env            # macOS/Linux
# Edit .env with your local database credentials
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install
```

---

## 🔐 Environment Variables

Create a `.env` file in the `backend/` directory (use `.env.example` as a template):

| Variable | Description | Example |
|---|---|---|
| `SECRET_KEY` | Flask secret key for sessions | `your-random-secret` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/rental_portal` |
| `JWT_SECRET` | JWT signing secret | `your-jwt-secret` |
| `FRONTEND_URL` | Allowed frontend origin for CORS | `http://localhost:4200` |
| `FLASK_ENV` | Environment mode | `development` or `production` |
| `PORT` | Port for the web server | `8080` (set by Railway automatically) |

---

## ▶️ Running the Project Locally

### Start the Backend
```bash
cd backend
# Activate venv first, then:
python app.py
# Backend runs on http://127.0.0.1:5000
```

### Start the Frontend
```bash
cd frontend
node node_modules\@angular\cli\bin\ng.js serve --port 4300
# Or:
npm start
# Frontend runs on http://localhost:4300
```

### Default Admin Credentials
```
Email:    admin@rentalportal.com
Password: Admin@123
```

Tenants can self-register via the portal's sign-up page.

---

## 🚀 Railway Deployment Instructions

### 1. Backend Service

1. Create a new Railway project and **add a PostgreSQL database** plugin.
2. Add a new service from your GitHub repository.
3. Set the **Root Directory** to `backend`.
4. Railway auto-detects the `Procfile` and runs `gunicorn app:app`.
5. Set the following **environment variables** in Railway:

   | Variable | Value |
   |---|---|
   | `SECRET_KEY` | Your random secret key |
   | `DATABASE_URL` | Provided automatically by Railway's PostgreSQL plugin |
   | `FRONTEND_URL` | Your Railway frontend URL (set after deploying frontend) |
   | `FLASK_ENV` | `production` |

### 2. Frontend Service

1. In `frontend/src/environments/environment.prod.ts`, replace the placeholder URLs:
   ```typescript
   export const environment = {
     production: true,
     apiUrl: 'https://YOUR-BACKEND.up.railway.app/api',
     staticUrl: 'https://YOUR-BACKEND.up.railway.app'
   };
   ```
2. Add another Railway service pointing to the `frontend` directory.
3. Set the **build command** to:
   ```bash
   npm install && npm run build
   ```
4. Set the **start command** to serve static files from `dist/frontend/browser`.

> **Tip:** Railway supports static site hosting. Set the Static Site output directory to `dist/frontend/browser`.

---

## 📡 API Overview

All API endpoints are prefixed with `/api`.

### Auth (`/api/auth`)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/login` | User login, returns JWT |
| POST | `/register` | New user registration |

### User (`/api/user`)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/towers` | List all available towers |
| GET | `/units/search` | Search/filter units |
| POST | `/bookings` | Create a booking request |
| GET | `/bookings` | Get my bookings |
| POST | `/bookings/:id/pay-deposit` | Pay deposit + first rent |
| GET | `/leases` | Get my active leases |
| POST | `/maintenance` | Submit maintenance request |
| GET | `/payments/dues` | Get payment dues |

### Admin (`/api/admin`)
| Method | Endpoint | Description |
|---|---|---|
| GET/POST | `/towers` | Manage towers |
| GET/POST | `/units` | Manage units |
| POST | `/bookings/:id/approve` | Approve booking (locks unit) |
| POST | `/bookings/:id/reject` | Reject booking |
| GET | `/analytics` | Dashboard analytics |
| GET | `/payments` | All payment records |

---

## 🔮 Future Improvements

- [ ] **Email Notifications** — Automated emails for booking approvals, payment receipts, and lease expiry reminders
- [ ] **Online Payment Gateway** — Integrate Razorpay or Stripe for actual payment processing
- [ ] **Mobile App** — React Native or Flutter mobile application for tenants
- [ ] **Document Uploads** — Tenant KYC document upload and verification workflow
- [ ] **Multi-currency Support** — Internationalization for global deployments
- [ ] **Advanced Analytics** — Revenue forecasting and occupancy prediction with ML
- [ ] **Push Notifications** — Browser and mobile push notifications via Firebase
- [ ] **Bulk Lease Renewals** — Admin tool for mass lease renewal management

---

## 📄 License

This project is for educational and portfolio purposes.
