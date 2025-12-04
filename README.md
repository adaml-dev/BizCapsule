# BizCapsule

A Next.js application for managing and serving standalone HTML experiments with user authentication and access control.

## Features

- 🔐 User authentication with password hashing (bcrypt)
- 👥 Two registration flows:
  - **Public registration**: Users sign up and wait for admin approval
  - **Invitation-based**: Admin sends email invitations with auto-approval
- 🎛️ Admin panel for managing users, experiments, and access control
- 📧 Email notifications via Resend
- 🧪 Serve standalone HTML files with access control
- 🔒 Session-based authentication with JWT
- 🚦 Rate limiting for API endpoints
- 🎨 Tailwind CSS for styling

## Tech Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Prisma** (PostgreSQL ORM)
- **Supabase** (PostgreSQL database)
- **Resend** (Email service)
- **bcryptjs** (Password hashing)
- **jsonwebtoken** (JWT tokens)
- **Zod** (Schema validation)

## Getting Started

### 1. Prerequisites

- Node.js 18+ installed
- PostgreSQL database (e.g., Supabase account)
- Resend account for email sending

### 2. Clone and Install

```bash
cd vibe-lab
npm install
```

### 3. Environment Setup

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
# Database (get from Supabase)
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"

# JWT Secret (generate a strong random string)
JWT_SECRET="your-super-secret-jwt-key"

# Resend API Key (get from resend.com)
RESEND_API_KEY="re_xxxxxxxxxxxxx"

# Email Configuration
FROM_EMAIL="noreply@yourdomain.com"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Optional: Open Prisma Studio to view data
npx prisma studio
```

### 5. Create First Admin User

Since the app requires an admin to manage users, you need to create the first admin manually:

```bash
# Open Prisma Studio
npx prisma studio
```

Then:

1. Navigate to the `User` model
2. Click "Add record"
3. Fill in:
   - `email`: your email
   - `passwordHash`: (temporarily use any bcrypt hash, you'll change password via registration)
   - `isApproved`: `true`
   - `isAdmin`: `true`
4. Save

**Better approach**: Register normally, then update via Prisma Studio to set `isApproved: true` and `isAdmin: true`.

### 6. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Project Structure

```
vibe-lab/
├── app/
│   ├── api/                    # API routes
│   │   ├── register/           # User registration
│   │   ├── login/              # User login
│   │   ├── logout/             # User logout
│   │   └── admin/              # Admin endpoints
│   │       ├── invite/         # Send invitations
│   │       ├── users/          # Manage users
│   │       ├── experiments/    # Manage experiments
│   │       └── user-experiments/ # Grant/revoke access
│   ├── experiments/[slug]/     # Serve protected HTML files
│   ├── admin/                  # Admin panel page
│   ├── hub/                    # User hub page
│   └── page.tsx                # Login/register page
├── lib/
│   ├── db.ts                   # Prisma client
│   ├── auth.ts                 # Auth utilities (JWT, bcrypt)
│   ├── session.ts              # Session management
│   ├── email.ts                # Email sending
│   └── rateLimit.ts            # Rate limiting
├── prisma/
│   └── schema.prisma           # Database schema
└── experiments_raw/            # HTML experiments storage
    └── example-dashboard.html  # Example HTML file
```

## Usage

### For Users

1. **Register**: Go to homepage and create an account
   - With invitation: Use the link from admin's email (auto-approved)
   - Without invitation: Wait for admin approval
2. **Login**: Once approved, log in with your credentials
3. **Access Experiments**: View available experiments in your hub

### For Admins

1. **Access Admin Panel**: After logging in as admin, navigate to `/admin`
2. **Invite Users**: Use POST `/api/admin/invite` with user email
3. **Manage Users**: Approve/reject registrations, grant admin access
4. **Create Experiments**: Add experiments via POST `/api/admin/experiments`
5. **Grant Access**: Assign users to specific experiments

## API Endpoints

### Public Endpoints

- `POST /api/register` - Register new user
- `POST /api/login` - Login
- `POST /api/logout` - Logout

### Admin Endpoints (Require Admin Auth)

- `POST /api/admin/invite` - Send invitation email
- `GET /api/admin/invite` - List all invitations
- `GET /api/admin/users` - List all users
- `PATCH /api/admin/users` - Update user (approve, make admin)
- `DELETE /api/admin/users` - Delete user
- `GET /api/admin/experiments` - List all experiments
- `POST /api/admin/experiments` - Create experiment
- `PATCH /api/admin/experiments` - Update experiment
- `DELETE /api/admin/experiments` - Delete experiment
- `POST /api/admin/user-experiments` - Grant user access to experiment
- `DELETE /api/admin/user-experiments` - Revoke user access

### Protected Endpoints

- `GET /experiments/[slug]` - View experiment (requires authentication)

## Creating Experiments

1. Add your HTML file to `experiments_raw/` folder
2. Use admin API to create experiment record:

```bash
curl -X POST http://localhost:3000/api/admin/experiments \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "my-dashboard",
    "title": "My Dashboard",
    "description": "Interactive dashboard",
    "filePath": "experiments_raw/my-dashboard.html",
    "isPublic": false
  }'
```

3. Grant users access via `/api/admin/user-experiments`

## Example API Calls

### Send Invitation

```javascript
const response = await fetch("/api/admin/invite", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "user@example.com",
    maxUses: 1,
    expiresInDays: 7,
  }),
});
```

### Approve User

```javascript
const response = await fetch("/api/admin/users", {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    userId: "user-id",
    isApproved: true,
  }),
});
```

### Grant Experiment Access

```javascript
const response = await fetch("/api/admin/user-experiments", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    userId: "user-id",
    experimentId: "experiment-id",
  }),
});
```

## Security Features

- ✅ Password hashing with bcrypt
- ✅ HTTP-only session cookies
- ✅ JWT token expiration
- ✅ Rate limiting on sensitive endpoints
- ✅ Access control for experiments
- ✅ Admin-only routes protection

## Deployment

### Vercel Deployment

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Database Setup (Supabase)

1. Create project at [supabase.com](https://supabase.com)
2. Copy connection string (pooled connection recommended)
3. Add to `DATABASE_URL` in environment variables
4. Run `npx prisma db push` to create tables

### Email Setup (Resend)

1. Create account at [resend.com](https://resend.com)
2. Verify your domain (or use test mode)
3. Generate API key
4. Add to `RESEND_API_KEY` in environment variables

## Development

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
