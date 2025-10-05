# Fairly - Expense Sharing PWA

A production-grade expense-sharing Progressive Web App built with the T3 Stack. Split expenses fairly with friends and groups, with offline support and optimized debt settlement algorithms.

## 🚀 Features

- **Group Management**: Create and manage expense groups with multiple members
- **Smart Expense Splitting**: Add expenses with equal or custom splits
- **Debt Simplification**: Optimized algorithm to minimize the number of transactions needed
- **Settlement Tracking**: Record and track payments between members
- **Progressive Web App**: Install on mobile devices, works offline
- **Real-time Updates**: Instant synchronization across devices
- **Responsive Design**: Beautiful UI that works on all screen sizes

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **API Layer**: tRPC (End-to-end type-safe APIs)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query (React Query)
- **PWA**: next-pwa with Workbox

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd fairly
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
   - `NEXTAUTH_URL`: Your app URL (http://localhost:3000 for dev)

4. **Set up the database**
   ```bash
   npm run db:push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 PWA Installation

### On Mobile (iOS/Android)
1. Open the app in your mobile browser
2. Tap the "Share" button (iOS) or menu (Android)
3. Select "Add to Home Screen"
4. The app will now work like a native app with offline support

### On Desktop
1. Look for the install icon in your browser's address bar
2. Click to install as a desktop app

## 🏗️ Project Structure

```
fairly/
├── prisma/
│   └── schema.prisma          # Database schema
├── public/
│   ├── manifest.json          # PWA manifest
│   └── icons/                 # App icons
├── src/
│   ├── components/            # React components
│   │   ├── CreateGroupModal.tsx
│   │   ├── AddExpenseModal.tsx
│   │   ├── AddMemberModal.tsx
│   │   └── SettleUpModal.tsx
│   ├── pages/
│   │   ├── api/
│   │   │   ├── auth/          # NextAuth endpoints
│   │   │   └── trpc/          # tRPC endpoints
│   │   ├── auth/
│   │   │   └── signin.tsx     # Sign in page
│   │   ├── group/
│   │   │   └── [id].tsx       # Group detail page
│   │   ├── _app.tsx           # App wrapper
│   │   ├── _document.tsx      # HTML document
│   │   └── index.tsx          # Home page
│   ├── server/
│   │   ├── api/
│   │   │   ├── routers/       # tRPC routers
│   │   │   │   ├── group.ts
│   │   │   │   ├── expense.ts
│   │   │   │   └── balance.ts
│   │   │   ├── root.ts        # Root router
│   │   │   └── trpc.ts        # tRPC setup
│   │   ├── utils/
│   │   │   └── debtSimplification.ts  # Debt algorithm
│   │   ├── auth.ts            # NextAuth config
│   │   └── db.ts              # Prisma client
│   ├── styles/
│   │   └── globals.css        # Global styles
│   └── utils/
│       └── api.ts             # tRPC client setup
├── .env.example               # Environment template
├── next.config.js             # Next.js + PWA config
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## 🧮 Debt Simplification Algorithm

The app uses a greedy algorithm to minimize transactions:

**Example**: 
- A owes B $10
- B owes C $10
- **Simplified**: A pays C $10 directly (1 transaction instead of 2)

**Algorithm**: O(n²) time complexity
- Calculates net balances for all users
- Uses min-max heap approach to match largest creditor with largest debtor
- Iteratively settles debts until all balanced

## 🔐 Authentication

For demo purposes, the app uses a simplified credential-based authentication. In production, you should:

1. Add OAuth providers (Google, GitHub, etc.)
2. Implement proper password hashing
3. Add email verification
4. Set up 2FA

## 🚀 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure environment variables
   - Deploy!

3. **Set up PostgreSQL**
   - Use Vercel Postgres, Supabase, or Railway
   - Update `DATABASE_URL` in Vercel environment variables

### Environment Variables on Vercel
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` (your production URL)
- `NEXT_PUBLIC_APP_URL` (your production URL)

## 📊 Database Schema

- **User**: User accounts and profiles
- **Group**: Expense groups
- **GroupMember**: Group membership with roles
- **Expense**: Individual expenses
- **ExpenseSplit**: How expenses are split between users
- **Settlement**: Payment records between users

## 🎨 Customization

### Branding
- Update colors in `tailwind.config.ts`
- Replace icons in `public/icons/`
- Modify `public/manifest.json`

### Features
- Add expense categories
- Implement recurring expenses
- Add expense attachments (receipts)
- Multi-currency support
- Export to CSV/PDF

## 🧪 Testing

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build test
npm run build
```

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler check
- `npm run db:push` - Push Prisma schema to database
- `npm run db:studio` - Open Prisma Studio

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

- Built with [T3 Stack](https://create.t3.gg/)
- Inspired by [Splitwise](https://www.splitwise.com/)
- Icons from [Emoji](https://emojipedia.org/)

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

**Made with ❤️ using the T3 Stack**
