# PortfolioX — Portfolio & Resume Builder Platform

A full-stack platform for building, publishing, and sharing professional portfolios and resumes — with AI-assisted content generation, a social layer (follows, likes, comments), appointment booking, subscription billing, and a full admin back office.

## 🚀 Features

### Portfolios
- 10 industry-specific templates (Developer, Doctor, Lawyer, Photographer, Graphic Designer, Writer, Musician, Architect, Fitness Trainer, Chef)
- Projects (with a build/progress log per project), skills, work experience, education, photo gallery, and a "books" section for authors
- Appointment booking with visitor-facing availability slots
- Public contact form on published portfolios
- Portfolio scoring (completeness/quality score) and view analytics
- Publish/unpublish with a public shareable slug

### Social
- Explore/discover public portfolios
- Follow / followers
- Likes and threaded comments (with replies and comment likes) on portfolios

### Resumes
- Multi-resume builder with experience, education, and skills sections
- ATS (Applicant Tracking System) scoring

### AI Assistance
- Chat-based assistant for portfolio and resume content
- AI-suggested templates
- AI-generated portfolio and resume content
- Per-user AI credit/usage tracking
- Pluggable providers — Groq and Gemini

### Auth & Account Security
- JWT access + refresh tokens
- Email OTP verification on registration
- New-device login verification via email (trusted-device management)
- Password reset via OTP
- Login audit history
- Profile photo upload, email-change confirmation flow
- Account data export and account deletion
- Logout from all devices

### Billing
- Razorpay integration (create order, verify payment)
- Free / Pro subscription plans, upgrade & downgrade
- Payment history

### Admin Dashboard
- User management: ban/unban, approve, delete, delete-inactive
- Analytics and platform stats
- User complaints and bug report triage
- Subscription plan management and payment refunds
- Email template editor with live preview
- System tools: storage usage, backup, error log viewer
- Site-wide settings (branding, registration/security policy, feature toggles)

## 📋 Tech Stack

### Frontend
- React 18 + React Router v6
- Vite
- Tailwind CSS
- Axios
- Lucide React / react-icons
- Playwright (testing)

### Backend
- .NET 8 Web API
- Entity Framework Core 8 (Pomelo MySQL provider) with **EF Core Migrations**
- JWT Bearer authentication
- BCrypt.Net (password hashing)
- AutoMapper
- Serilog
- Swagger / OpenAPI

### Database
- MySQL 8.0
- Schema is defined entirely in code (EF Core entities) and applied via versioned migrations — no hand-written SQL files

## 🏗️ Architecture

**Backend** — a 4-project .NET solution ([PortfolioX.sln](backend/PortfolioX.sln)):

| Project | Responsibility |
|---|---|
| `PortfolioX.API` | Controllers, `Program.cs` (DI wiring, middleware, startup), Swagger |
| `PortfolioX.Core` | Domain entities and DTOs |
| `PortfolioX.Infrastructure` | `AppDbContext`, EF Core Migrations (schema source of truth) |
| `PortfolioX.Services` | Business logic — auth, email, AI providers, portfolio/resume scoring, Razorpay, notifications |

**Frontend** — a Vite-powered React SPA:

```
frontend/src/
├── pages/            # Route-level pages (Dashboard, Login, Register, AiPortfolioBuilder, AdminDashboard, ...)
│   └── templates/     # One renderer per portfolio template (Developer, Doctor, Lawyer, ...)
├── components/        # Shared UI (Navbar, Sidebar, Footer, modals, charts, ...)
├── context/            # AuthContext, ThemeContext, AppearanceContext, SiteSettingsContext
├── services/           # API client (Axios)
├── hooks/, utils/, styles/
```

## 🔧 Prerequisites

- Node.js 18+
- .NET 8 SDK
- MySQL 8.0
- Git

## ⚡ Quick Start

### 1. Database

Ensure MySQL is running locally. No manual schema setup is needed — EF Core Migrations create the database and every table automatically on first run.

### 2. Backend

```bash
cd backend

# appsettings.json in this repo ships with placeholder values only — no real
# secrets are committed. Create src/PortfolioX.API/appsettings.Development.json
# (gitignored) with your real local values:
# {
#   "ConnectionStrings": { "DefaultConnection": "Server=localhost;Port=3306;Database=portfoliox_db;Uid=root;Pwd=your_password;" },
#   "Jwt": { "Secret": "a-random-32+-character-string" },
#   "Email": { "Smtp": { "Username": "...", "Password": "..." } },
#   "Ai": { "ApiKey": "..." },
#   "Razorpay": { "KeyId": "...", "KeySecret": "..." }
# }
# ASP.NET Core merges this file automatically when running in Development.

dotnet build
dotnet run --project src/PortfolioX.API

# API:     http://localhost:5000
# Swagger: http://localhost:5000/swagger
```

On startup, `Program.cs` calls `context.Database.Migrate()` to create/update the schema, then seeds portfolio templates, subscription plans, email templates, and the demo accounts below — all in code, idempotently (safe to restart repeatedly).

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev

# Frontend: http://localhost:3000
```

## 🔑 Demo / Test Credentials

Seeded automatically on first backend run:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@portfoliox.com` | `Admin@123` |
| User | `user@portfoliox.com` | `User@123` |

## 📡 API Overview

All routes are under `/api`. Full interactive documentation is available via Swagger at `/swagger` once the backend is running. Main route groups:

| Controller | Base route | Covers |
|---|---|---|
| `AuthController` | `/api/auth` | Register, login, OTP verification, refresh tokens, trusted devices, login history, profile, password/email change, account export/delete |
| `PortfoliosController` | `/api/portfolios` | CRUD, templates, explore, projects, skills, experience, education, gallery, books, appointments, contact messages, likes, scoring |
| `ResumesController` | `/api/resumes` | CRUD, scoring, experience/education/skills |
| `UsersController` | `/api/users` | Public profiles, follow/followers |
| `CommentsController` | `/api` | Portfolio comments, replies, comment likes |
| `AiController` | `/api/ai` | Chat, template suggestions, portfolio/resume generation, usage tracking |
| `BillingController` | `/api/billing` | Razorpay orders/verification, plan changes, payment history |
| `NotificationsController` | `/api/notifications` | Mark-as-read |
| `SupportController` | `/api/support` | Complaints, bug reports |
| `AdminController` | `/api/admin` | User moderation, stats, analytics, complaints, bug reports |
| `AdminSettingsController` | `/api/admin/settings` | Site settings, plans, payments/refunds, email templates, system tools |
| `SettingsController` | `/api/settings` | User account settings |
| `SiteController` | `/api/site-settings` | Public site configuration |

## 🔐 Security Notes

- JWT access + refresh tokens; passwords hashed with BCrypt
- New-device logins require email verification; trusted devices are tracked per user
- All secrets (DB password, JWT secret, SMTP credentials, AI API key, Razorpay keys) live only in the gitignored `appsettings.Development.json` locally, or environment variables in production — never in source control
- EF Core parameterized queries throughout
- Admin-only endpoints are authorization-protected

## 📦 Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# deploy the dist/ folder
```

### Backend (Azure/any .NET host)
```bash
dotnet publish -c Release
```
Provide `ConnectionStrings__DefaultConnection`, `Jwt__Secret`, and the other config values as environment variables (or a production `appsettings.Production.json`) — migrations run automatically on startup, so no manual schema step is needed in production either.

## 🐛 Troubleshooting

**MySQL connection error**
- Confirm MySQL is running and the credentials in `appsettings.Development.json` are correct
- The database is created automatically via EF Core Migrations on first run

**Backend crashes on startup with no port bound**
- Check the console output for the actual exception (commonly a bad DB connection string)
- Confirm `ASPNETCORE_ENVIRONMENT=Development` is being set — this project's `Properties/launchSettings.json` sets it automatically for `dotnet run`

**JWT token errors**
- Ensure `Jwt:Secret` is at least 32 characters and consistent across restarts

**CORS errors**
- Backend CORS policy is currently pinned to `http://localhost:3000` (see `Program.cs`) — update it if your frontend runs elsewhere

**Port already in use**
- MySQL: `3306` · Backend: `5000` · Frontend: `3000`

## 🗄️ Schema Changes

Schema is managed entirely through EF Core Migrations in `backend/src/PortfolioX.Infrastructure/Migrations/`. To change the schema:

```bash
cd backend
# 1. Edit entities in PortfolioX.Core and mappings in PortfolioX.Infrastructure/AppDbContext.cs
# 2. Generate a migration:
dotnet ef migrations add <DescriptiveName> --project src/PortfolioX.Infrastructure --startup-project src/PortfolioX.API
# 3. Restart the API (or run `dotnet ef database update`) — Program.cs applies pending migrations automatically
```

## 📄 License

MIT License — free to use for personal or commercial projects.

---

**Built for creators and professionals to showcase their work.**
