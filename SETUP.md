# Quick Setup Guide

## 1. Install Dependencies
```bash
npm install
```

## 2. Set Up Environment
```bash
cp .env.example .env
```

Edit `.env`:
- Set `DATABASE_URL` to your PostgreSQL connection string
- Generate `NEXTAUTH_SECRET`: `openssl rand -base64 32`

## 3. Initialize Database
```bash
npm run db:push
```

## 4. Generate Icons (Placeholder)
```bash
node scripts/generate-icons.js
```

## 5. Run Development Server
```bash
npm run dev
```

Visit: http://localhost:3000

## 6. Create Your First User
- Go to http://localhost:3000/auth/signin
- Enter name and email
- Start creating groups and expenses!

## Next Steps
- Replace placeholder icons in `public/icons/` with real designs
- Configure OAuth providers in `src/server/auth.ts`
- Deploy to Vercel (see DEPLOYMENT.md)
