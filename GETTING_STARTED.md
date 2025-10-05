# 🚀 Getting Started with Fairly

## Prerequisites Checklist

- ✅ Node.js 18+ installed
- ✅ PostgreSQL database (local or cloud)
- ✅ Git installed
- ✅ Code editor (VS Code recommended)

## Quick Start (5 minutes)

### Step 1: Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit .env file and set:
# - DATABASE_URL=postgresql://user:password@localhost:5432/fairly
# - NEXTAUTH_SECRET=$(openssl rand -base64 32)
# - NEXTAUTH_URL=http://localhost:3000
```

### Step 2: Database Setup
```bash
# Push schema to database
npm run db:push

# (Optional) Open Prisma Studio to view database
npm run db:studio
```

### Step 3: Run Development Server
```bash
npm run dev
```

Visit **http://localhost:3000** 🎉

## First Time User Flow

1. **Sign In** → Go to http://localhost:3000/auth/signin
2. **Create Account** → Enter your name and email
3. **Create Group** → Click "Create Group" button
4. **Add Members** → Invite others by email (they need accounts)
5. **Add Expense** → Click "Add Expense" in your group
6. **View Balances** → See who owes whom
7. **Settle Up** → Record payments between members

## Project Structure Overview

```
fairly/
├── src/
│   ├── pages/          # Next.js pages & API routes
│   ├── components/     # React components
│   ├── server/         # Backend logic (tRPC, Prisma)
│   └── styles/         # CSS styles
├── prisma/             # Database schema
├── public/             # Static assets & PWA files
└── scripts/            # Utility scripts
```

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
npm run db:push      # Update database schema
npm run db:studio    # Open Prisma Studio
```

## Testing the PWA

### On Desktop
1. Open Chrome/Edge
2. Look for install icon in address bar
3. Click to install as desktop app

### On Mobile
1. Open in mobile browser
2. Tap "Share" → "Add to Home Screen"
3. App works offline!

## Common Issues & Solutions

### Issue: Database connection failed
**Solution**: Check DATABASE_URL in .env file

### Issue: Module not found errors
**Solution**: Run `npm install` again

### Issue: Prisma Client errors
**Solution**: Run `npm run db:generate`

### Issue: Port 3000 already in use
**Solution**: Kill the process or use different port:
```bash
PORT=3001 npm run dev
```

## Next Steps

1. ✅ **Replace Icons**: Use real icons in `public/icons/`
2. ✅ **Add OAuth**: Configure Google/GitHub login
3. ✅ **Deploy**: Follow DEPLOYMENT.md guide
4. ✅ **Customize**: Update colors in tailwind.config.ts

## Documentation

- 📖 **README.md** - Full documentation
- 🏗️ **ARCHITECTURE.md** - System architecture
- 🚀 **DEPLOYMENT.md** - Deployment guide
- 📊 **PROJECT_SUMMARY.md** - Project overview

## Support

- Check documentation files
- Review code comments
- Explore Prisma Studio for database

---

**Happy coding! Built with ❤️ using T3 Stack**
