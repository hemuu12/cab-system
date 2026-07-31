# WonderTravel

![WonderTravel](client-v2/public/branding/wondertravel-social-preview.jpg)

A full-stack, mobile-first cab booking platform for chauffeur-driven intercity
journeys across India, with deeper coverage in its home state of Uttarakhand. WonderTravel combines route discovery, vehicle comparison,
booking management, guest feedback, customer accounts, and an operations
dashboard in one installable web application.

[Live application](https://cab-system-wk9q.vercel.app/) ·
[API health](https://cab-system-puce.vercel.app/api/health)

## Highlights

- One-way, round-trip, and outstation journey planning
- Route-aware vehicle results and transparent fare estimates
- Real fleet galleries with full-screen image previews
- Booking checkout, confirmation, cancellation, and trip history
- Password and email-OTP authentication with refresh-token sessions
- Role-protected customer and administrator areas
- Moderated guest reviews with optional journey-photo uploads
- Admin management for drivers, vehicles, bookings, inquiries, feedback, and routes
- Responsive landing page, account area, and operations dashboard
- Installable PWA experience with standalone shortcuts
- WhatsApp and phone support actions
- Mobile-safe notifications, navigation, forms, and galleries

## Technology

| Layer | Technology |
| --- | --- |
| Frontend | React 19, Vite 7, React Router 7 |
| State and data | Redux Toolkit, RTK Query, Axios |
| UI | CSS, Tailwind CSS 4, Motion, Lucide icons |
| Backend | Node.js, Express 5 |
| Database | MongoDB, Mongoose |
| Authentication | JWT access tokens, rotating refresh sessions, bcrypt |
| Media | Cloudinary, Multer |
| Email | Resend |
| Hosting | Vercel |

## Repository structure

```text
cab-system/
├── client-v2/                 # Active React application
│   ├── public/                # Branding, PWA assets, and static media
│   └── src/
│       ├── api/               # Axios client, token handling, normalized errors
│       ├── components/        # Shared UI and application components
│       ├── hooks/             # Authentication, toast, and menu hooks
│       ├── pages/             # Public, customer, checkout, and admin pages
│       ├── store/             # Redux store, RTK Query APIs, and slices
│       └── styles/            # Global and page-scoped styles
├── server/
│   ├── api/                   # Vercel serverless entry point
│   └── src/
│       ├── data/              # Initial fleet and route catalogue
│       ├── middleware/        # Authentication and authorization
│       ├── models/            # Mongoose models
│       ├── routes/            # REST API routes
│       └── utils/             # Cloudinary and email integrations
├── docs/                      # Supporting technical documentation
└── README.md
```

## Prerequisites

- Node.js **20.19+** or **22.12+**
- npm
- MongoDB, either local or MongoDB Atlas
- Cloudinary account for uploaded vehicle and review images
- Resend account for production OTP and password-reset emails

## Local setup

### 1. Clone the repository

```bash
git clone git@github.com:hemuu12/cab-system.git
cd cab-system
```

### 2. Configure the API

Copy the example environment file:

```bash
cd server
cp .env.example .env
npm install
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

At minimum, set `MONGODB_URI`, `JWT_ACCESS_SECRET`, and `OTP_SECRET`. Use long,
random, different values for both secrets.

### 3. Configure the frontend

```bash
cd ../client-v2
npm install
```

The development server proxies `/api` to `http://localhost:5001`, so no frontend
environment file is required for the default local setup.

To call a separately hosted API, create `client-v2/.env.local`:

```env
VITE_API_BASE_URL=https://your-api.example.com/api
```

### 4. Start both applications

API terminal:

```bash
cd server
npm run dev
```

Frontend terminal:

```bash
cd client-v2
npm run dev
```

Open [http://localhost:5174](http://localhost:5174). The API runs at
[http://localhost:5001](http://localhost:5001), and its health endpoint is
`http://localhost:5001/api/health`.

> The Vite port is intentionally fixed at `5174`. If it changes, the API CORS
> allowlist must be updated and the API restarted.

## Environment variables

### Server

| Variable | Required | Purpose |
| --- | --- | --- |
| `PORT` | No | Local API port; defaults to `5001` |
| `CLIENT_URL` | Production | Comma-separated allowed frontend origins |
| `VERCEL_FRONTEND_PROJECT` | No | Allows matching Vercel preview deployments |
| `VERCEL_FRONTEND_TEAM` | No | Vercel preview team slug |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_ACCESS_SECRET` | Yes | Signs short-lived access tokens |
| `JWT_ACCESS_TTL` | No | Access-token lifetime; defaults to `15m` |
| `JWT_REFRESH_DAYS` | No | Refresh-session lifetime; defaults to `30` days |
| `OTP_SECRET` | Yes | Hashing secret for one-time codes |
| `CLOUDINARY_CLOUD_NAME` | For uploads | Cloudinary account name |
| `CLOUDINARY_API_KEY` | For uploads | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | For uploads | Cloudinary API secret |
| `RESEND_API_KEY` | Production email | Resend API key |
| `RESEND_FROM` | Production email | Verified sender identity |

`CLOUDINARY_URL` may be used instead of the three individual Cloudinary
variables.

### Frontend

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Production | API base URL; defaults to `/api` |

Never commit real `.env` files, database credentials, JWT secrets, API keys, or
administrator passwords.

## Application routes

| Route | Access | Description |
| --- | --- | --- |
| `/` | Public | Landing page and journey planner |
| `/results` | Public | Matching fleet and fare estimates |
| `/checkout/:vehicleId` | Public | Passenger details and booking review |
| `/confirmation/:reference` | Public | Booking confirmation |
| `/login` | Public | Member and administrator authentication |
| `/forgot-password` | Public | OTP password recovery |
| `/account` | Signed in | Profile, preferences, and trips |
| `/admin` | Admin | Operations overview |
| `/admin?section=vehicles` | Admin | Fleet management |
| `/admin?section=bookings` | Admin | Booking operations |
| `/admin?section=drivers` | Admin | Driver management |
| `/admin?section=inquiries` | Admin | Customer inquiries |
| `/admin?section=feedback` | Admin | Review moderation |
| `/admin?section=routes` | Admin | Route catalogue |

The section query parameter preserves the active account or admin view across
refreshes and direct links.

## API overview

All API routes use the `/api` prefix.

| Resource | Base route | Notes |
| --- | --- | --- |
| Health | `/api/health` | Deployment and uptime check |
| Authentication | `/api/auth` | Registration, login, OTP, refresh, logout |
| Vehicles | `/api/vehicles` | Public fleet catalogue and vehicle details |
| Routes | `/api/routes` | Active travel destinations |
| Bookings | `/api/bookings` | Creation, lookup, account history, cancellation |
| Inquiries | `/api/inquiries` | Public inquiry submission |
| Feedback | `/api/feedback` | Approved reviews and review submission |
| Administration | `/api/admin` | Role-protected operational resources |

The frontend request path is:

```text
React component
  → RTK Query endpoint
  → Axios base query
  → authenticated Axios client
  → Express API
  → Mongoose model
```

Access tokens stay in memory. The refresh token is held in an HTTP-only cookie.
Parallel expired requests share one refresh operation before being retried.

## Data initialization

When MongoDB connects, the API:

1. Inserts missing fleet vehicles without overwriting existing records.
2. Inserts missing featured route data, with Uttarakhand destinations first.
Administrator accounts are stored only in MongoDB. Server startup does not
create, promote, or reset administrator credentials from environment variables.

## Feedback workflow

1. A guest submits a star rating.
2. Written feedback and a journey photo are optional.
3. The guest must consent before the review can be published.
4. The review enters the admin dashboard as `pending`.
5. An administrator approves or rejects it.
6. Only approved, consented reviews appear publicly.

The public review wall requests up to 100 approved reviews and presents them in a
bounded, responsive review deck.

## Production builds

Frontend:

```bash
cd client-v2
npm run build
npm run preview
```

Backend:

```bash
cd server
npm start
```

The frontend production output is written to `client-v2/dist`.

## Vercel deployment

### Frontend project

- Root directory: `client-v2`
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable:

```env
VITE_API_BASE_URL=https://your-api-project.vercel.app/api
```

`client-v2/vercel.json` rewrites browser routes to `index.html`, so direct links
such as `/login`, `/account`, and `/admin` do not return Vercel `404 NOT_FOUND`.

### Backend project

- Root directory: `server`
- Entry point: `server/api/index.js`
- Add every required server environment variable in Vercel
- Set `CLIENT_URL` to the exact frontend origin, without a trailing path

Example:

```env
CLIENT_URL=https://your-frontend-project.vercel.app
```

After changing CORS or environment variables, redeploy the backend. Test
`/api/health` before testing authentication from the frontend.

## Review and admin security

- Public feedback is moderated before publication.
- Admin endpoints use role-based access control. Normal administrators can read,
  create, and edit operational records; only the sole super administrator can
  delete records or manage administrator accounts.
- Passwords are hashed with bcrypt.
- Refresh sessions are stored separately and can be revoked.
- Login and feedback routes are rate limited.
- Upload type and size are validated before Cloudinary storage.
- Helmet, credential-aware CORS, and request-size limits are enabled.

## Troubleshooting

### CORS error

- Confirm `CLIENT_URL` contains the exact browser origin.
- Do not include routes such as `/login` in the origin.
- Confirm `VITE_API_BASE_URL` points to the backend `/api`.
- Redeploy or restart the backend after environment changes.

### Direct frontend route returns `404 NOT_FOUND`

Deploy from the `client-v2` directory and keep its `vercel.json` rewrite.

### Image upload fails

Check the Cloudinary variables. Review photos accept JPG, PNG, WebP, or AVIF files
up to 5 MB. Vehicle-image limits are enforced separately in the admin dashboard.

### OTP works locally but fails in production

Local development can print OTP codes to the API terminal. Production requires a
valid `RESEND_API_KEY` and a verified `RESEND_FROM` domain.

### Vite reports an unsupported Node.js version

Upgrade to Node.js 20.19+ or 22.12+, reinstall dependencies, and rebuild.

## Useful commands

| Directory | Command | Purpose |
| --- | --- | --- |
| `client-v2` | `npm run dev` | Start Vite on port 5174 |
| `client-v2` | `npm run build` | Create the production frontend |
| `client-v2` | `npm run preview` | Preview the frontend build |
| `server` | `npm run dev` | Start the API with file watching |
| `server` | `npm start` | Start the API normally |

## Project status

WonderTravel is an actively developed application. Before a production launch,
configure real service credentials, rotate bootstrap secrets, test the complete
booking and password-recovery flows, and verify the CORS allowlist for every
production domain.
