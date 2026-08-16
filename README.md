# PortfolioX - Professional Portfolio Builder

A complete full-stack application for creating, customizing, and sharing professional portfolios.

## 🚀 Features

- **User Authentication**: JWT-based auth with refresh tokens
- **Portfolio Builder**: Drag-and-drop portfolio customization
- **Multiple Templates**: 6 industry-specific portfolio templates
- **Admin Dashboard**: Manage users and view analytics
- **ATS Optimization**: Resume-optimized layouts
- **Public Portfolios**: Publish and share your work
- **Analytics**: Track portfolio views and engagement
- **Subscriptions**: Free and Pro plans with different features

## 📋 Tech Stack

### Frontend
- React 18
- React Router v6
- Axios (HTTP client)
- Tailwind CSS
- Lucide React (icons)

### Backend
- .NET 8
- Entity Framework Core
- MySQL
- JWT Authentication
- AutoMapper
- BCrypt (password hashing)

### Database
- MySQL 8.0
- Normalized schema
- 17 tables

## 🔧 Prerequisites

- Node.js 18+
- .NET 8 SDK
- MySQL 8.0
- Git

## ⚡ Quick Start

### 1. Database Setup

Ensure MySQL is installed and running locally. No manual schema setup is needed — the schema is managed with EF Core Migrations and applied automatically on startup (see below).

### 2. Backend Setup

```bash
cd backend

# appsettings.json ships with placeholder values only (no real secrets are
# committed to this repo). Create src/PortfolioX.API/appsettings.Development.json
# (gitignored) with your real local values, e.g.:
# {
#   "ConnectionStrings": { "DefaultConnection": "Server=localhost;Port=3306;Database=portfoliox_db;Uid=root;Pwd=your_password;" },
#   "Jwt": { "Secret": "a-random-32+-character-string" },
#   "Email": { "Smtp": { "Username": "...", "Password": "..." } },
#   "Ai": { "ApiKey": "..." },
#   "Razorpay": { "KeyId": "...", "KeySecret": "..." }
# }
# ASP.NET Core merges this file automatically in Development.

# Build and run — EF Core Migrations create the database/schema automatically
# on startup (Program.cs calls context.Database.Migrate()), and demo/seed
# data (templates, plans, email templates, admin/test accounts) is inserted
# in code the first time it runs.
dotnet build
dotnet run --project src/PortfolioX.API

# API runs on http://localhost:5000
# Swagger docs: http://localhost:5000/swagger
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start development server
npm run dev

# Frontend runs on http://localhost:3000
```

## 📊 Database Schema

### Core Tables
- **users**: User accounts & authentication
- **portfolios**: User portfolio instances
- **portfolio_templates**: Portfolio design templates
- **portfolio_projects**: Projects in portfolios
- **portfolio_skills**: Skills list
- **portfolio_experience**: Work experience
- **portfolio_education**: Education history

### Auth & Subscriptions
- **refresh_tokens**: JWT refresh token storage
- **subscription_plans**: Tier definitions (free, pro)
- **user_subscriptions**: Active subscriptions
- **payments**: Payment history

### Analytics
- **portfolio_views**: View tracking
- **feedback**: User feedback & ratings
- **notifications**: User notifications

## 🔑 Test Credentials

### Admin Account
- **Email**: admin@portfoliox.com
- **Password**: Admin@123
- **Access**: Full admin dashboard + user management

### Regular User
- **Email**: user@portfoliox.com
- **Password**: User@123
- **Access**: Create and manage portfolios

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Portfolios
- `GET /api/portfolios/templates` - Get all templates
- `POST /api/portfolios` - Create portfolio
- `GET /api/portfolios/{id}` - Get portfolio (authenticated)
- `GET /api/portfolios/public/{slug}` - Get public portfolio
- `GET /api/portfolios/my-portfolios` - Get user's portfolios
- `PUT /api/portfolios/{id}` - Update portfolio
- `DELETE /api/portfolios/{id}` - Delete portfolio
- `POST /api/portfolios/{id}/projects` - Add project
- `POST /api/portfolios/{id}/skills` - Add skill
- `POST /api/portfolios/{id}/experience` - Add experience
- `POST /api/portfolios/{id}/education` - Add education

### Admin
- `GET /api/admin/users` - Get all users
- `DELETE /api/admin/users/{userId}` - Delete user
- `GET /api/admin/stats` - Get dashboard stats

## 🔐 Security Features

- JWT authentication with expiration
- Refresh token rotation
- Password hashing with BCrypt
- CORS configured
- Input validation
- SQL parameterized queries (EF Core)
- Admin-only endpoints protected

## 📦 Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy dist/ folder
```

### Backend (Azure/Heroku/.NET Host)
```bash
dotnet publish -c Release
# Deploy published files
```

### Database (AWS RDS/Azure Database for MySQL)
- Run schema migrations
- Update connection string in appsettings.json

## 🚨 Important Configuration

Update these before production:

### Backend (appsettings.json)
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "your_production_connection_string"
  },
  "Jwt": {
    "Secret": "your-super-secret-key-at-least-32-chars-long",
    "ExpiryInMinutes": "60"
  }
}
```

### Frontend (.env)
```
VITE_API_BASE_URL=https://your-api-domain.com/api
VITE_APP_NAME=PortfolioX
```

## 🐛 Troubleshooting

### MySQL Connection Error
- Ensure MySQL is running: `docker-compose ps`
- Check connection string in appsettings.Development.json
- The database and schema are created automatically via EF Core Migrations on first run; verify with: `mysql -u root -p -e "SHOW DATABASES;"`

### JWT Token Error
- Ensure JWT:Secret in appsettings.json matches
- Check token expiry in Swagger UI

### CORS Error
- Verify frontend URL in backend CORS policy
- Ensure API_BASE_URL in .env matches backend

### Port Already in Use
- MySQL: `sudo lsof -i :3306`
- Backend: `sudo lsof -i :5000`
- Frontend: `sudo lsof -i :3000`

## 📚 Project Structure

```
portfoliox-complete/
├── backend/
│   └── src/
│       ├── PortfolioX.API/    # API layer
│       ├── PortfolioX.Core/   # Domain & DTOs
│       ├── PortfolioX.Services/ # Business logic
│       └── PortfolioX.Infrastructure/ # Data access + EF Core Migrations
└── frontend/
    └── src/
        ├── pages/             # Route pages
        ├── components/        # React components
        ├── services/          # API client
        ├── context/           # Auth context
        └── styles/            # CSS
```

## 🎯 Next Steps

1. **Customize UI**: Modify CSS in `frontend/src/styles/`
2. **Add AI Integration**: Implement resume generation service
3. **Payment Integration**: Stripe/Razorpay in subscription flow
4. **Email Notifications**: SendGrid integration
5. **CDN**: Setup for image hosting

## 📄 License

MIT License - Feel free to use for personal or commercial projects.

## 💬 Support

For issues, questions, or contributions:
1. Check existing issues
2. Create detailed bug reports
3. Submit pull requests
4. Contact: support@portfoliox.com

---

**Built with ❤️ for creators and professionals worldwide**
