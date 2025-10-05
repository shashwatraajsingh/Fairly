# Deployment Guide - Fairly

This guide will help you deploy Fairly to production using Vercel and a PostgreSQL database.

## Prerequisites

- GitHub account
- Vercel account (free tier works)
- PostgreSQL database (Vercel Postgres, Supabase, Railway, or Neon)

## Step 1: Prepare Your Repository

1. **Initialize Git** (if not already done)
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Fairly expense-sharing PWA"
   ```

2. **Push to GitHub**
   ```bash
   git remote add origin https://github.com/yourusername/fairly.git
   git branch -M main
   git push -u origin main
   ```

## Step 2: Set Up PostgreSQL Database

### Option A: Vercel Postgres (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to Storage → Create Database → Postgres
3. Copy the `DATABASE_URL` connection string

### Option B: Supabase (Free Tier)

1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string (use "Session pooler" for serverless)
5. Format: `postgresql://postgres:[password]@[host]:6543/postgres?pgbouncer=true`

### Option C: Railway

1. Go to [Railway](https://railway.app)
2. Create new project → Add PostgreSQL
3. Copy the `DATABASE_URL` from variables

### Option D: Neon (Serverless Postgres)

1. Go to [Neon](https://neon.tech)
2. Create a new project
3. Copy the connection string

## Step 3: Deploy to Vercel

1. **Import Project**
   - Go to [Vercel](https://vercel.com/new)
   - Import your GitHub repository
   - Select the `fairly` repository

2. **Configure Build Settings**
   - Framework Preset: **Next.js**
   - Build Command: `prisma generate && next build`
   - Output Directory: `.next`
   - Install Command: `npm install`

3. **Set Environment Variables**
   
   Add the following in Vercel → Settings → Environment Variables:

   ```bash
   # Database
   DATABASE_URL=postgresql://user:password@host:5432/dbname
   
   # NextAuth
   NEXTAUTH_SECRET=your-generated-secret-here
   NEXTAUTH_URL=https://your-app.vercel.app
   
   # App URL
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   ```

   **Generate NEXTAUTH_SECRET:**
   ```bash
   openssl rand -base64 32
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete

## Step 4: Initialize Database

After deployment:

1. **Run Prisma Migration**
   
   Option A - Using Vercel CLI:
   ```bash
   npm i -g vercel
   vercel login
   vercel env pull .env.local
   npx prisma db push
   ```

   Option B - Using your database client:
   - Connect to your PostgreSQL database
   - Run the schema from `prisma/schema.prisma`

2. **Verify Database**
   ```bash
   npx prisma studio
   ```

## Step 5: Configure PWA Icons

1. **Generate Icons**
   - Use [PWA Builder Image Generator](https://www.pwabuilder.com/imageGenerator)
   - Upload a 512x512 logo
   - Download the icon pack
   - Replace files in `public/icons/`

2. **Update Manifest**
   - Verify `public/manifest.json` has correct app name and colors
   - Update theme colors in `tailwind.config.ts` if needed

## Step 6: Test Your Deployment

1. **Visit Your App**
   ```
   https://your-app.vercel.app
   ```

2. **Test PWA Installation**
   - On mobile: Add to Home Screen
   - On desktop: Install app from browser

3. **Test Offline Mode**
   - Open DevTools → Application → Service Workers
   - Check "Offline" mode
   - Navigate the app (cached pages should work)

## Step 7: Custom Domain (Optional)

1. Go to Vercel → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` environment variables

## Continuous Deployment

Vercel automatically deploys when you push to your main branch:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `NEXTAUTH_SECRET` | Secret for NextAuth.js | Generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Your app URL | `https://fairly.vercel.app` |
| `NEXT_PUBLIC_APP_URL` | Public app URL | `https://fairly.vercel.app` |

## Troubleshooting

### Build Fails

**Error: Prisma Client not generated**
```bash
# Solution: Add to build command
prisma generate && next build
```

**Error: Database connection failed**
- Verify `DATABASE_URL` is correct
- Check if database allows connections from Vercel IPs
- For Supabase, use session pooler connection string

### Runtime Errors

**Error: NEXTAUTH_URL not set**
- Add `NEXTAUTH_URL` to environment variables
- Redeploy the application

**Error: Database timeout**
- Use connection pooling (PgBouncer)
- For Supabase, use port 6543 with `?pgbouncer=true`

### PWA Not Installing

- Ensure HTTPS is enabled (Vercel does this automatically)
- Check `manifest.json` is accessible at `/manifest.json`
- Verify service worker is registered in DevTools

## Performance Optimization

1. **Enable Edge Runtime** (Optional)
   - Add to API routes: `export const runtime = 'edge'`
   - Note: Some features may not work with Edge runtime

2. **Database Connection Pooling**
   - Use PgBouncer or Supabase pooler
   - Reduces connection overhead

3. **Image Optimization**
   - Use Next.js Image component
   - Optimize icons before deployment

4. **Caching Strategy**
   - Service worker caches static assets
   - API responses cached for 5 minutes
   - Customize in `next.config.js`

## Monitoring

1. **Vercel Analytics**
   - Enable in Vercel dashboard
   - Track Web Vitals and performance

2. **Error Tracking**
   - Add Sentry: `npm install @sentry/nextjs`
   - Configure in `sentry.client.config.js`

3. **Database Monitoring**
   - Use your database provider's dashboard
   - Monitor query performance
   - Set up alerts for connection issues

## Security Checklist

- [ ] Environment variables are set correctly
- [ ] `NEXTAUTH_SECRET` is strong and unique
- [ ] Database credentials are secure
- [ ] HTTPS is enabled (automatic on Vercel)
- [ ] CORS is configured if needed
- [ ] Rate limiting is implemented (optional)
- [ ] Input validation is in place (Zod schemas)

## Backup Strategy

1. **Database Backups**
   - Most providers offer automatic backups
   - Verify backup schedule in your database dashboard

2. **Code Backups**
   - GitHub serves as version control
   - Tag releases: `git tag v1.0.0 && git push --tags`

## Scaling Considerations

As your app grows:

1. **Database Scaling**
   - Upgrade to higher tier plan
   - Implement read replicas
   - Use Redis for caching

2. **Serverless Functions**
   - Vercel automatically scales
   - Monitor function execution time
   - Optimize cold starts

3. **CDN & Edge**
   - Static assets served via Vercel Edge Network
   - Consider Edge Middleware for auth

## Support

For deployment issues:
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)

---

**Happy Deploying! 🚀**
