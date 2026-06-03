# SupportCRM — Premium Ticketing & CRM Platform

A fully modernized, premium Customer Relationship Management (CRM) system designed with a warm professional minimalist layout. Built with a React frontend and a FastAPI backend, this platform provides role-based workspaces for customers and support agents, featuring real-time state updates, inline details editing, and multi-tier routing security.

---

## 🔑 Demo Access Profiles

| Role | Email | Password | Primary Workspace Route |
| :--- | :--- | :--- | :--- |
| **Admin Agent** | `admin@datastraw.in` | `Admin@123` | `/admin/dashboard` |
| **Customer Visitor** | `demo@customer.com` | `Demo@123` | `/my-tickets` |

---

## 🎨 Layout & Design Modernization

We overhauled the legacy layout to meet premium SaaS aesthetics:
* **Sidebar-Free Top Navigation Header:** Authenticated views feature a sticky, container-aligned top nav bar displaying the logo branding (`SupportCRM · Datastraw`), route tabs, user initials avatars, and log-out controls.
* **Two-Column Workspace Dashboard:** The Admin portal uses a responsive two-column grid:
  - **Left Panel:** Sticky filters card to query tickets by Status and Search keywords, or quickly reset filters.
  - **Right Panel:** Interactive tickets queue list displaying status badges, customer emails, and creation logs. Clicking a ticket loads its full details, conversation logs, and note updating inputs inline.
* **Readable Hero Banners:** Light orange hero headers now render text and subtitles in high-contrast dark slate (`#0f172a` and `#334155`) for accessibility.
* **Monogram Favicon:** Custom SVG favicon displaying a crisp monogram `SC` (SupportCRM) inside the brand colors.

---

## 📂 Project Directory Structure

```text
Asserment/
│
├── crm-backend/                 # Python FastAPI Server
│   ├── app/
│   │   ├── database.py          # SQLite connections, SQLAlchemy Tables
│   │   ├── main.py              # FastAPI endpoints, CORS, middlewares
│   │   └── schemas.py           # Pydantic schemas (validations)
│   ├── requirements.txt         # Backend Python packages
│   └── support_crm.db           # SQLite DB file
│
├── crm-frontend/                # React.js SPA Frontend
│   ├── public/
│   │   └── index.html           # Document wrapper (monogram SVG Favicon, custom fonts)
│   └── src/
│       ├── api.js               # Unified Axios requests handler
│       ├── App.js               # Route paths and navigation rules
│       ├── index.css            # Central styles and variable tokens
│       ├── components/
│       │   ├── Header.js        # Persistent role-based top header
│       │   ├── Icons.js         # Inline SVG component icons library
│       │   ├── ProtectedRoute.js# RequireAuth redirect guards
│       │   └── UI.js            # Badges, loaders, small indicators
│       ├── context/
│       │   ├── AuthContext.js   # Global auth session provider
│       │   └── ToastContext.js  # Popup system alerts provider
│       └── pages/
│           ├── auth/            # Sign-In/Register panels
│           ├── public/          # Landing pages and unauthenticated lookups
│           ├── customer/        # Customer private ticket workspaces
│           └── admin/           # Admin inline dashboard queue manager
│
├── README.md                    # Main documentation
└── .gitignore                   # Version control ignore lists
```

---

## 🛠️ Technology Stack

### Frontend Architecture
* **Core Framework:** React.js (v18+)
* **Routing Engine:** React Router (v6+)
* **Session & State Management:** Context Providers (`AuthContext`, `ToastContext`)
* **Styling System:** Vanilla CSS with Global Design Tokens & Variables
* **API Middleware:** Axios

### Backend Services
* **Framework:** FastAPI
* **Database Driver:** SQLAlchemy ORM
* **Engine Database:** SQLite
* **Password Encryption:** Passlib (Bcrypt)
* **Auth Layer:** JWT Bearer Cookies (python-jose)

---

## 🚀 Local Deployment Setup

### 1. Launching the Backend Server

```bash
# Navigate to the backend folder
cd crm-backend

# Create virtual environment
python -m venv venv

# Activate venv (Windows PowerShell)
..\venv\Scripts\Activate.ps1

# Activate venv (Mac/Linux)
source venv/bin/activate

# Install libraries
pip install -r requirements.txt

# Start local server
python -m uvicorn app.main:app --reload --port 8000
```
* Backend starts on: **[http://localhost:8000](http://localhost:8000)**
* Swagger OpenAPI docs: **[http://localhost:8000/docs](http://localhost:8000/docs)**

---

### 2. Launching the Frontend Server

```bash
# Navigate to the frontend folder
cd crm-frontend

# Install dependencies
npm install

# Start the Webpack development server
npm run start
```
* Frontend starts on: **[http://localhost:3000](http://localhost:3000)**

---

## 📡 API Reference Schema

| Method | Endpoint | Description | Guard / Permission |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Registers a new account | Public |
| **POST** | `/api/auth/login` | Authenticates user & issues JWT cookie | Public |
| **GET** | `/api/auth/me` | Fetches active session credentials | Authenticated |
| **POST** | `/api/customer/tickets` | Creates a new customer ticket | Authenticated Customer |
| **GET** | `/api/customer/tickets` | Lists tickets filed by the active user | Authenticated Customer |
| **GET** | `/api/customer/tickets/:id` | View ticket details timeline | Authenticated Customer |
| **GET** | `/api/admin/tickets` | Lists all tickets in the queue | Authenticated Admin |
| **GET** | `/api/admin/tickets/:id` | Fetch specific ticket with notes log | Authenticated Admin |
| **PUT** | `/api/admin/tickets/:id` | Update status or post public/internal notes | Authenticated Admin |
| **DELETE**| `/api/admin/tickets/:id` | Deletes a ticket from the system | Authenticated Admin |

---

## 🗄️ Database Tables

### `users`
* `id` (INTEGER, Primary Key)
* `name` (VARCHAR)
* `email` (VARCHAR, Unique Index)
* `password_hash` (VARCHAR)
* `role` (VARCHAR: `'admin'` or `'customer'`)

### `tickets`
* `id` (INTEGER, Primary Key)
* `ticket_id` (VARCHAR, Unique Index)
* `customer_name` (VARCHAR)
* `customer_email` (VARCHAR)
* `subject` (VARCHAR)
* `description` (TEXT)
* `status` (VARCHAR: `'Open'`, `'In Progress'`, `'Closed'`)
* `priority` (VARCHAR: `'Low'`, `'Medium'`, `'High'`, `'Urgent'`)
* `created_at` (TIMESTAMP)
* `updated_at` (TIMESTAMP)

### `notes`
* `id` (INTEGER, Primary Key)
* `ticket_id` (VARCHAR, Foreign Key -> `tickets.ticket_id`)
* `note_text` (TEXT)
* `author` (VARCHAR)
* `is_internal` (BOOLEAN)
* `created_at` (TIMESTAMP)

---

## 👨‍💻 Author

**Karan**  
*Artificial Intelligence & Data Science Engineer*  
[GitHub Profile](https://github.com/Kakarot35)
