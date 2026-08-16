<div align="center">

# ✨ PortfolioX

### The all-in-one platform to build, publish, and grow your professional portfolio

*AI-assisted content · social discovery · appointment booking · subscription billing · a full admin back office*

[![.NET](https://img.shields.io/badge/.NET-8.0-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](#-license)

</div>

---

## 📖 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#️-architecture)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Demo Credentials](#-demo--test-credentials)
- [API Overview](#-api-overview)
- [Security Notes](#-security-notes)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)
- [Schema Changes](#️-schema-changes)
- [License](#-license)

---

## 🚀 Features

<table>
<tr>
<td width="50%" valign="top">

### 🖼️ Portfolios
- 10 industry-specific templates — Developer, Doctor, Lawyer, Photographer, Graphic Designer, Writer, Musician, Architect, Fitness Trainer, Chef
- Projects with a build/progress log, skills, experience, education, photo gallery, and a "books" section for authors
- Appointment booking with visitor-facing availability slots
- Public contact form on published portfolios
- Portfolio scoring and view analytics
- Publish/unpublish with a shareable public slug

### 🌐 Social
- Explore & discover public portfolios
- Follow / followers
- Likes and threaded comments (with replies) on portfolios

### 📄 Resumes
- Multi-resume builder — experience, education, skills
- ATS (Applicant Tracking System) scoring

</td>
<td width="50%" valign="top">

### 🤖 AI Assistance
- Chat-based assistant for portfolio and resume content
- AI-suggested templates
- AI-generated portfolio and resume content
- Per-user AI credit/usage tracking
- Pluggable providers — Groq & Gemini

### 🔐 Auth & Account Security
- JWT access + refresh tokens
- Email OTP verification on registration
- New-device login verification via email
- Password reset via OTP · login audit history
- Data export & account deletion · logout-all-devices

### 💳 Billing
- Razorpay integration (create order, verify payment)
- Free / Pro plans, upgrade & downgrade
- Payment history

### 🛠️ Admin Dashboard
- User moderation, analytics, complaints & bug triage
- Plan management, refunds, email template editor
- Storage/backup/error-log tools, site-wide settings

</td>
</tr>
</table>

## 📋 Tech Stack

<div align="center">

**Frontend**

![React](https://img.shields.io/badge/React_18-20232A?style=flat-square&logo=react&logoColor=61DAFB) ![React Router](https://img.shields.io/badge/React_Router_v6-CA4245?style=flat-square&logo=reactrouter&logoColor=white) ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white) ![Tailwind](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white) ![Axios](https://img.shields.io/badge/Axios-5A29E4?style=flat-square&logo=axios&logoColor=white) ![Playwright](https://img.shields.io/badge/Playwright-2EAD33?style=flat-square&logo=playwright&logoColor=white)

**Backend**

![.NET 8](https://img.shields.io/badge/.NET_8_Web_API-512BD4?style=flat-square&logo=dotnet&logoColor=white) ![EF Core](https://img.shields.io/badge/EF_Core_8_+_Migrations-512BD4?style=flat-square&logo=dotnet&logoColor=white) ![JWT](https://img.shields.io/badge/JWT_Auth-000000?style=flat-square&logo=jsonwebtokens&logoColor=white) ![BCrypt](https://img.shields.io/badge/BCrypt.Net-2E2E2E?style=flat-square) ![AutoMapper](https://img.shields.io/badge/AutoMapper-C71A36?style=flat-square) ![Serilog](https://img.shields.io/badge/Serilog-1E1E1E?style=flat-square) ![Swagger](https://img.shields.io/badge/Swagger_%2F_OpenAPI-85EA2D?style=flat-square&logo=swagger&logoColor=black)

**Database**

![MySQL](https://img.shields.io/badge/MySQL_8.0-4479A1?style=flat-square&logo=mysql&logoColor=white) — schema defined entirely in code and applied via versioned EF Core Migrations, no hand-written SQL files

</div>

## 🏗️ Architecture

**Backend** — a 4-project .NET solution ([`PortfolioX.sln`](backend/PortfolioX.sln)):

| Project | Responsibility |
|---|---|
| `PortfolioX.API` | Controllers, `Program.cs` (DI wiring, middleware, startup), Swagger |
| `PortfolioX.Core` | Domain entities and DTOs |
| `PortfolioX.Infrastructure` | `AppDbContext`, EF Core Migrations (schema source of truth) |
| `PortfolioX.Services` | Business logic — auth, email, AI providers, portfolio/resume scoring, Razorpay, notifications |

**Frontend** — a Vite-powered React SPA:

```
frontend/src/
├── pages/              # Route-level pages (Dashboard, Login, Register, AiPortfolioBuilder, AdminDashboard, ...)
│   └── templates/      # One renderer per portfolio template (Developer, Doctor, Lawyer, ...)
├── components/         # Shared UI (Navbar, Sidebar, Footer, modals, charts, ...)
├── context/             # AuthContext, ThemeContext, AppearanceContext, SiteSettingsContext
├── services/            # API client (Axios)
├── hooks/, utils/, styles/
```

## 🔧 Prerequisites

| Requirement | Version |
|---|---|
| Node.js | 18+ |
| .NET SDK | 8.0 |
| MySQL | 8.0 |
| Git | any recent version |

## ⚡ Quick Start

### 1️⃣ Database

Just make sure MySQL is running locally — no manual schema setup needed. EF Core Migrations create the database and every table automatically on first run.

### 2️⃣ Backend

```bash
cd backend
dotnet build
dotnet run --project src/PortfolioX.API

# API:     http://localhost:5000
# Swagger: http://localhost:5000/swagger
```

> [!IMPORTANT]
> `appsettings.json` in this repo ships with **placeholder values only** — no real secrets are committed. Before running, create `src/PortfolioX.API/appsettings.Development.json` (already gitignored) with your real local values:
> ```json
> {
>   "ConnectionStrings": { "DefaultConnection": "Server=localhost;Port=3306;Database=portfoliox_db;Uid=root;Pwd=your_password;" },
>   "Jwt": { "Secret": "a-random-32+-character-string" },
>   "Email": { "Smtp": { "Username": "...", "Password": "..." } },
>   "Ai": { "ApiKey": "..." },
>   "Razorpay": { "KeyId": "...", "KeySecret": "..." }
> }
> ```
> ASP.NET Core merges this file automatically when running in Development.

> [!TIP]
> On startup, `Program.cs` calls `context.Database.Migrate()` to create/update the schema, then seeds portfolio templates, subscription plans, email templates, and the demo accounts below — all in code, idempotently (safe to restart repeatedly).

### 3️⃣ Frontend

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
| 👑 Admin | `admin@portfoliox.com` | `Admin@123` |
| 👤 User | `user@portfoliox.com` | `User@123` |

## 📡 API Overview

All routes are under `/api`. Full interactive documentation is available via **Swagger** at `/swagger` once the backend is running.

<details>
<summary><strong>Click to expand full controller/route map</strong></summary>

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

</details>

## 🔐 Security Notes

- 🔑 JWT access + refresh tokens; passwords hashed with BCrypt
- 📱 New-device logins require email verification; trusted devices tracked per user
- 🙈 All secrets (DB password, JWT secret, SMTP credentials, AI API key, Razorpay keys) live only in the gitignored `appsettings.Development.json` locally, or environment variables in production — **never in source control**
- 🛡️ EF Core parameterized queries throughout
- 🔒 Admin-only endpoints are authorization-protected

## 📦 Deployment

<table>
<tr>
<td valign="top">

**Frontend** (Vercel/Netlify)
```bash
npm run build
# deploy the dist/ folder
```

</td>
<td valign="top">

**Backend** (Azure/any .NET host)
```bash
dotnet publish -c Release
```
Provide `ConnectionStrings__DefaultConnection`, `Jwt__Secret`, etc. as environment variables. Migrations run automatically on startup — no manual schema step needed.

</td>
</tr>
</table>

## 🐛 Troubleshooting

<details>
<summary><strong>MySQL connection error</strong></summary>

- Confirm MySQL is running and the credentials in `appsettings.Development.json` are correct
- The database is created automatically via EF Core Migrations on first run
</details>

<details>
<summary><strong>Backend crashes on startup with no port bound</strong></summary>

- Check the console output for the actual exception (commonly a bad DB connection string)
- Confirm `ASPNETCORE_ENVIRONMENT=Development` is being set — this project's `Properties/launchSettings.json` sets it automatically for `dotnet run`
</details>

<details>
<summary><strong>JWT token errors</strong></summary>

- Ensure `Jwt:Secret` is at least 32 characters and consistent across restarts
</details>

<details>
<summary><strong>CORS errors</strong></summary>

- Backend CORS policy is currently pinned to `http://localhost:3000` (see `Program.cs`) — update it if your frontend runs elsewhere
</details>

<details>
<summary><strong>Port already in use</strong></summary>

- MySQL: `3306` · Backend: `5000` · Frontend: `3000`
</details>

## 🗄️ Schema Changes

Schema is managed entirely through EF Core Migrations in `backend/src/PortfolioX.Infrastructure/Migrations/`.

```bash
cd backend
# 1. Edit entities in PortfolioX.Core and mappings in PortfolioX.Infrastructure/AppDbContext.cs
# 2. Generate a migration:
dotnet ef migrations add <DescriptiveName> --project src/PortfolioX.Infrastructure --startup-project src/PortfolioX.API
# 3. Restart the API (or run `dotnet ef database update`) — Program.cs applies pending migrations automatically
```

## 📄 License

Licensed under the **MIT License** — free to use for personal or commercial projects.

---

<div align="center">

**Built for creators and professionals to showcase their work.** 🚀

</div>
