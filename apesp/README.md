# APESP - AI-Powered Expense Sharing Platform

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![PostgreSQL](https://img.shields.io/badge/database-PostgreSQL-336791.svg)

> **Smart expense splitting with AI-powered automation. Track, split, and settle group expenses effortlessly.**

## 🌟 Project Overview

APESP is a modern, full-stack expense sharing platform designed for managing shared costs efficiently. Whether you're splitting rent, organizing a group trip, or managing shared household expenses, APESP uses artificial intelligence to automate categorization, receipt scanning, and expense splitting while providing rich analytics and insights.

### Key Features

- 🤖 **AI-Powered Automation**

  - Receipt scanning with OCR
  - Voice-to-expense conversion
  - Smart expense categorization
  - Natural language chatbot for expense queries

- 💰 **Intelligent Expense Tracking**

  - Multiple split types (equal, exact, percentage, shares)
  - Multi-payer expense support
  - Receipt image storage and management
  - Category-based organization

- 👥 **Social & Group Management**

  - Create and manage groups
  - Role-based access control (Admin/Member)
  - Friend connections and requests
  - User blocking/unblocking

- 📊 **Advanced Analytics**

  - Spending trends and patterns
  - Category-wise breakdowns
  - Budget tracking with alerts
  - Monthly summaries and insights

- 💳 **Settlement Management**

  - Automatic balance calculation
  - Manual payment tracking
  - Debt simplification algorithm
  - Multi-currency support

- 🔐 **Enterprise-Grade Security**
  - JWT-based authentication
  - Session management with device tracking
  - Password hashing (bcrypt)
  - Secure token refresh mechanism

---

## 📋 Table of Contents

- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation & Setup](#-installation--setup)
- [Configuration](#-configuration)
- [Database](#-database)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Environment Variables](#-environment-variables)
- [Development Guide](#-development-guide)
- [Production Deployment](#-production-deployment)
- [Contributing](#-contributing)
- [Support & Contact](#-support--contact)
- [License](#-license)

---

## 🏗️ System Architecture

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                   Client Layer (Next.js)                │
│              React Components + TypeScript              │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│               API Layer (Next.js Route Handlers)        │
│  ┌─────────────┬──────────────┬─────────────────────┐   │
│  │  Auth APIs  │  Group APIs  │  Expense APIs       │   │
│  │ Analytics   │  Friends API │  Settlement APIs    │   │
│  │ AI Features │  Dashboard   │  Balance APIs       │   │
│  └─────────────┴──────────────┴─────────────────────┘   │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│        Business Logic Layer (Services & Utilities)      │
│  ┌───────────────────────────────────────────────────┐  │
│  │ Auth Service │ Expense Service │ Analytics       │  │
│  │ Settlement   │ Group Service   │ Budget Service  │  │
│  └───────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│         Data Access Layer (Prisma ORM)                 │
│              Database Client & Migrations              │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│              PostgreSQL Database                        │
│  ┌─────────────────────────────────────────────────┐  │
│  │ Users │ Groups │ Expenses │ Settlements         │  │
│  │ Balances │ Friends │ Sessions │ Budgets       │  │
│  └─────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Core Data Flow

1. **User Authentication**: JWT tokens + Session management
2. **Expense Creation**: Multi-payer, multi-split calculation
3. **Balance Calculation**: Real-time bilateral debt tracking
4. **Settlement Recording**: Payment tracking and reconciliation
5. **Analytics**: Aggregated spending trends and summaries

---

## 🛠️ Tech Stack

### Frontend

- **Next.js 15+** - React framework with server-side rendering
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **React Hooks** - State management
- **Lucide React** - Icon library

### Backend

- **Next.js API Routes** - Serverless API handlers
- **Node.js 18+** - JavaScript runtime
- **TypeScript** - Type definitions and interfaces

### Database

- **PostgreSQL 14+** - Relational database
- **Prisma ORM** - Database abstraction and migrations
- **Decimal.js** - Precise financial calculations

### Authentication & Security

- **bcryptjs** - Password hashing
- **jsonwebtoken (JWT)** - Token-based authentication
- **zod** - Schema validation

### Development Tools

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **PostCSS** - CSS processing

### AI & External Services

- **OpenAI API** - Receipt scanning, voice transcription, chatbot
- **Cloud Storage** - Receipt image hosting (configurable)

---

## 📁 Project Structure

```
apesp/
├── app/                              # Next.js App Router
│   ├── api/                          # API Route Handlers
│   │   ├── auth/                     # Authentication endpoints
│   │   │   ├── login/route.ts
│   │   │   ├── register/route.ts
│   │   │   ├── logout/route.ts
│   │   │   ├── refresh/route.ts
│   │   │   ├── otp/route.ts
│   │   │   └── password/route.ts
│   │   ├── users/                    # User management
│   │   │   ├── me/route.ts           # Current user profile
│   │   │   ├── [userId]/route.ts     # User by ID
│   │   │   ├── search/route.ts       # User search
│   │   │   └── [userId]/block|unblock/route.ts
│   │   ├── groups/                   # Group management
│   │   │   ├── route.ts              # Create group
│   │   │   ├── [groupId]/route.ts    # Group CRUD
│   │   │   ├── [groupId]/members/    # Member management
│   │   │   ├── [groupId]/expenses/   # Group expenses
│   │   │   ├── [groupId]/simplify/   # Debt simplification
│   │   │   └── [groupId]/leave/      # Leave group
│   │   ├── expenses/                 # Expense management
│   │   │   ├── route.ts              # Create expense
│   │   │   └── [expenseId]/route.ts  # Expense CRUD
│   │   ├── settlements/              # Settlement tracking
│   │   │   └── route.ts
│   │   ├── balances/                 # Balance queries
│   │   │   ├── route.ts
│   │   │   ├── groups/[groupId]/     # Group balances
│   │   │   └── friends/[userId]/     # Friend balances
│   │   ├── friends/                  # Friend management
│   │   │   ├── route.ts
│   │   │   ├── requests/             # Friend requests
│   │   │   └── [userId]/
│   │   ├── analytics/                # Analytics endpoints
│   │   │   ├── summary/
│   │   │   └── trends/
│   │   ├── dashboard/                # Dashboard data
│   │   ├── subscriptions/            # Subscription management
│   │   ├── health/route.ts           # Health check
│   │   └── ai/                       # AI Features
│   │       ├── scan-reciept/
│   │       ├── voice-expense/
│   │       └── query/
│   ├── auth/                         # Auth pages
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── dashboard/                    # Main app pages
│   │   ├── layout.tsx
│   │   ├── page.tsx                  # Dashboard home
│   │   ├── analytics/
│   │   ├── budgets/
│   │   ├── expenses/
│   │   ├── groups/
│   │   ├── settings/
│   │   ├── settle-up/
│   │   ├── subscriptions/
│   │   └── chatbot/
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Landing page
│   ├── globals.css                   # Global styles
│   └── api/                          # (as described above)
├── src/
│   ├── components/                   # React components
│   │   ├── ui/                       # UI primitives
│   │   │   ├── Button.tsx
│   │   │   └── ...
│   │   ├── forms/                    # Form components
│   │   ├── charts/                   # Chart components
│   │   ├── layout/                   # Layout components
│   │   ├── common/                   # Shared components
│   │   ├── dashboard/                # Dashboard components
│   │   ├── providers/                # Context providers
│   │   └── tables/                   # Table components
│   ├── services/                     # Business logic
│   │   ├── authService.ts
│   │   ├── expenseService.ts
│   │   ├── groupService.ts
│   │   ├── settlementServices.ts
│   │   ├── budgetService.ts
│   │   ├── analyticsService.ts
│   │   └── cateogoryService.ts
│   ├── lib/                          # Utilities & helpers
│   │   ├── api.ts                    # API client
│   │   ├── auth.ts                   # Auth utilities
│   │   ├── db.ts                     # Database connection
│   │   ├── types.ts                  # Global types
│   │   ├── utils.ts                  # Helper functions
│   │   ├── validators.ts             # Validation schemas
│   │   └── constants.ts              # Application constants
│   ├── hooks/                        # React hooks
│   │   ├── useAuth.ts
│   │   ├── useDashboard.ts
│   │   └── useExpenses.ts
│   ├── middleware/                   # Middleware
│   │   └── auth.ts                   # Authentication middleware
│   ├── store/                        # State management (Zustand)
│   │   ├── authStore.ts
│   │   ├── expenseStore.ts
│   │   ├── notificationStore.ts
│   │   ├── uiStore.ts
│   │   └── index.ts
│   ├── types/                        # TypeScript interfaces
│   │   ├── api.ts
│   │   ├── expense.ts
│   │   ├── budget.ts
│   │   ├── subscription.ts
│   │   ├── user.ts
│   │   └── index.ts
│   ├── config/                       # Configuration
│   │   └── site.ts
│   ├── styles/                       # CSS modules
│   └── generated/                    # Generated files (Prisma)
├── prisma/
│   ├── schema.prisma                 # Database schema
│   └── migrations/                   # Database migrations
├── public/                           # Static assets
│   ├── images/
│   ├── icons/
│   └── favicons/
├── package.json                      # Dependencies
├── tsconfig.json                     # TypeScript config
├── next.config.ts                    # Next.js config
├── tailwind.config.ts                # Tailwind config
├── postcss.config.js                 # PostCSS config
├── eslint.config.mjs                 # ESLint config
└── README.md                         # This file
```

---

## 💻 Installation & Setup

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 or **yarn** >= 3.0.0
- **PostgreSQL** >= 14.0
- **Git**
- **OpenAI API Key** (for AI features)

### Step 1: Clone Repository

```bash
git clone https://github.com/atiujjwal/AI-Powered-Expense-Sharing-Platoform.git
cd APESP/apesp
```

### Step 2: Install Dependencies

```bash
npm install
# or
yarn install
```

### Step 3: Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/APESP"

# JWT
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_EXPIRATION="7d"
JWT_REFRESH_SECRET="your-refresh-secret-min-32-chars"
JWT_REFRESH_EXPIRATION="30d"

# Next.js
NEXT_PUBLIC_API_BASE_URL="http://localhost:3000"
NODE_ENV="development"

# OpenAI API (for AI features)
OPENAI_API_KEY="sk-..."

# Optional: File Storage
NEXT_PUBLIC_STORAGE_BUCKET="your-bucket-name"
STORAGE_REGION="your-region"
```

### Step 4: Setup Database

```bash
# Run migrations
npx prisma migrate dev

# Generate Prisma Client
npx prisma generate

# (Optional) View database GUI
npx prisma studio
```

### Step 5: Start Development Server

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`

---

## ⚙️ Configuration

### Database Configuration

Edit `src/lib/db.ts` to configure your database connection:

```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["query", "error", "warn"],
});

export { prisma };
```

### Authentication Configuration

Configure in `src/lib/auth.ts`:

```typescript
// Token expiration times
export const TOKEN_EXPIRY = {
  ACCESS: "7d",
  REFRESH: "30d",
};

// Password requirements
export const PASSWORD_REQUIREMENTS = {
  MIN_LENGTH: 6,
  REQUIRE_UPPERCASE: false,
  REQUIRE_NUMBERS: false,
  REQUIRE_SPECIAL: false,
};
```

### API Configuration

Update base URL in `src/lib/api.ts`:

```typescript
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";
```

---

## 🗄️ Database

### Schema Overview

#### Users & Authentication

- **User** - Core user identity
- **Session** - Active user sessions
- **UserToken** - Refresh tokens for JWT

#### Social Features

- **Friendship** - Friend connections and requests

#### Groups & Membership

- **Group** - Expense sharing groups
- **GroupMember** - User membership in groups

#### Expenses & Transactions

- **Expense** - Core expense records
- **ExpensePayer** - Who paid for an expense
- **ExpenseSplit** - Who owes what

#### Balances & Settlements

- **Balance** - Cached bilateral debts
- **Settlement** - Payment records

#### Personal Finance

- **Budget** - Spending limits by category
- **Subscription** - Recurring expenses
- **SavingsGoal** - Financial goals
- **ExpenseSummary** - Aggregated spending data
- **ExpenseTrend** - Spending trends over time

### Key Relationships

```
User (1) ──→ (M) Session
User (1) ──→ (M) Expense (as creator)
User (1) ──→ (M) ExpensePayer
User (1) ──→ (M) ExpenseSplit
User (M) ←──→ (M) Group (via GroupMember)

Group (1) ──→ (M) Expense
Group (1) ──→ (M) Balance
Group (1) ──→ (M) Settlement

Expense (1) ──→ (M) ExpensePayer
Expense (1) ──→ (M) ExpenseSplit
```

### Database Migrations

View all migrations:

```bash
npx prisma migrate status
```

Create a new migration:

```bash
npx prisma migrate dev --name migration_name
```

---

## 🚀 Running the Application

### Development Mode

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm run start
```

### Lint Code

```bash
npm run lint
```

### Format Code

```bash
npm run format
```

### Database Studio

View and manage database:

```bash
npx prisma studio
```

---

## 📚 API Documentation

### Authentication Endpoints

#### Register

```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "dob": "1990-01-15",
  "phone": "+91-9999999999",
  "country": "India",
  "currency": "INR",
  "timezone": "Asia/Kolkata"
}
```

#### Login

```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

Response:

```json
{
  "data": {
    "id": "user_id",
    "email": "john@example.com",
    "access_token": "eyJhbGc...",
    "refresh_token": "eyJhbGc..."
  },
  "message": "Login successful"
}
```

### Expense Endpoints

#### Create Expense

```
POST /api/expenses
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "group_id": "group_id",
  "description": "Dinner",
  "amount": 1500,
  "category": "FOOD",
  "date": "2025-11-16",
  "payers": [
    { "user_id": "user1", "amount": 1500 }
  ],
  "splits": [
    { "user_id": "user1", "amount_owed": 750 },
    { "user_id": "user2", "amount_owed": 750 }
  ]
}
```

#### Get Group Balances

```
GET /api/balances/groups/{groupId}
Authorization: Bearer <access_token>
```

### Complete API Postman Collection

A complete Postman collection is available: `APESP_Postman_Collection.json`

**Import Steps:**

1. Open Postman
2. Click Import
3. Select `APESP_Postman_Collection.json`
4. Update variables (base_url, access_token, etc.)

---

## 🔐 Environment Variables

### Required Variables

```env
# Database Connection
DATABASE_URL=postgresql://user:password@localhost:5432/APESP

# JWT Configuration
JWT_SECRET=your-secret-key-minimum-32-characters
JWT_EXPIRATION=7d
JWT_REFRESH_SECRET=your-refresh-secret-minimum-32-chars
JWT_REFRESH_EXPIRATION=30d

# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
NODE_ENV=development|production

# OpenAI
OPENAI_API_KEY=sk-xxxxx
```

### Optional Variables

```env
# File Storage (AWS S3, Google Cloud, etc.)
STORAGE_PROVIDER=s3|gcs|local
STORAGE_BUCKET=bucket-name
STORAGE_REGION=us-east-1

# Email Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Analytics
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx

# Rate Limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=15m
```

---

## 👨‍💻 Development Guide

### Adding a New API Endpoint

1. **Create Route Handler**

```typescript
// app/api/path/route.ts
import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/middleware/auth";

export const POST = withAuth(async (request: NextRequest, payload) => {
  try {
    const { userId } = payload;
    const body = await request.json();

    // Your logic here

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
});
```

2. **Create Service**

```typescript
// src/services/yourService.ts
export const yourService = {
  async performAction(data: any) {
    // Business logic
  },
};
```

3. **Add TypeScript Types**

```typescript
// src/types/your.ts
export interface YourInterface {
  id: string;
  // fields
}
```

### Code Standards

- Use TypeScript for type safety
- Follow Next.js naming conventions
- Use Zod for input validation
- Implement error handling with custom response utilities
- Add JSDoc comments for functions
- Write unit tests for services

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/feature-name

# Make changes and commit
git add .
git commit -m "feat: description"

# Push to remote
git push origin feature/feature-name

# Create Pull Request
```

---

## 🚀 Production Deployment

### Pre-Deployment Checklist

- [ ] All tests passing
- [ ] ESLint passes without warnings
- [ ] Environment variables configured
- [ ] Database migrated
- [ ] API keys secured
- [ ] CORS configured
- [ ] SSL/TLS enabled
- [ ] Rate limiting enabled
- [ ] Logging configured

### Deployment Options

#### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Configure environment variables in Vercel dashboard
```

#### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t apesp .
docker run -p 3000:3000 --env-file .env apesp
```

#### Self-Hosted (AWS EC2, DigitalOcean, etc.)

1. **SSH into server**

```bash
ssh user@server-ip
```

2. **Install Node.js and PostgreSQL**

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs postgresql
```

3. **Clone and setup**

```bash
git clone repository-url
cd apesp
npm install
npm run build
```

4. **Configure PM2 (Process Manager)**

```bash
npm install -g pm2
pm2 start "npm start" --name "apesp"
pm2 startup
pm2 save
```

5. **Setup Nginx (Reverse Proxy)**

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Environment Variables (Production)

```env
NODE_ENV=production
DATABASE_URL=postgresql://prod-user:secure-pass@prod-host:5432/APESP
JWT_SECRET=your-production-secret-key
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
```

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/your-feature`
3. **Make changes** and commit: `git commit -am 'Add your feature'`
4. **Push to branch**: `git push origin feature/your-feature`
5. **Submit a Pull Request**

### Contribution Guidelines

- Follow the existing code style
- Write meaningful commit messages
- Update documentation as needed
- Add tests for new features
- Ensure all tests pass before submitting PR

---

## 📞 Support & Contact

### Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

### Troubleshooting

**Port 3000 already in use:**

```bash
# On Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# On macOS/Linux
lsof -i :3000
kill -9 <PID>
```

**Database connection error:**

- Verify PostgreSQL is running
- Check DATABASE_URL is correct
- Ensure database exists

**Migration issues:**

```bash
# Reset database (development only!)
npx prisma migrate reset

# Resolve migration conflicts
npx prisma migrate resolve --rolled-back <migration-name>
```

### Contact

- **GitHub Issues**: [Report bugs here](https://github.com/atiujjwal/AI-Powered-Expense-Sharing-Platoform/issues)
- **Email**: [contact@example.com](mailto:contact@example.com)
- **Discussion Forum**: [GitHub Discussions](https://github.com/atiujjwal/AI-Powered-Expense-Sharing-Platoform/discussions)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### Third-Party Licenses

- Next.js - MIT
- Prisma - Apache 2.0
- Tailwind CSS - MIT
- Lucide React - ISC

---

## 🙌 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Prisma](https://www.prisma.io/) - Database ORM
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [PostgreSQL](https://www.postgresql.org/) - Database
- [OpenAI](https://openai.com/) - AI capabilities

---

## 📊 Project Statistics

- **Total API Endpoints**: 38+
- **Database Tables**: 16+
- **UI Components**: 50+
- **Lines of Code**: 10,000+
- **Type Coverage**: 100%

---

## 🔄 Version History

### v1.0.0 (November 2025)

- Initial release
- Core expense sharing functionality
- AI-powered receipt scanning
- Group management
- Settlement tracking
- Analytics dashboard

---

<div align="center">

**Made with ❤️ by the APESP Team**

[⬆ back to top](#apesp---ai-powered-expense-sharing-platform)

</div>
