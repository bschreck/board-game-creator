# BoardCraft — AI-Powered Custom Board Game Creator

Create personalized physical board games with AI. Upload your photos, pick a classic game, customize the rules with wild twists, and get a professionally printed game shipped to your door.

## Features

- **Game Creator Wizard** — Multi-step flow: pick a base game, customize rules, upload photos, set theme, preview
- **Rule Randomizer** — "Shake It Up" button suggests fun rule mutations (accept/reject)
- **AI Board Preview** — Canvas-generated preview of your custom board layout
- **Photo Integration** — Drag-and-drop photo upload for game cards, board spaces, and pieces
- **Gift Mode** — Ship to multiple addresses for holidays and birthdays
- **Stripe Checkout** — Test mode payments with 3 pricing tiers ($29/$49/$79)
- **Dashboard** — View and manage past game orders with status tracking
- **Auth** — Demo credentials + Google OAuth via NextAuth

## Tech Stack

- **Framework**: Next.js 16 (App Router), TypeScript, Tailwind CSS v4
- **UI**: Custom Shadcn-style components, Framer Motion animations
- **Auth**: NextAuth.js with Prisma adapter
- **Database**: Prisma ORM + SQLite (swap to Postgres for production)
- **Payments**: Stripe Checkout (test mode)
- **State**: Zustand for wizard state management

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Push database schema
npm run db:push

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo Login

Use any email (e.g., `demo@boardcraft.com`) with the Demo Account provider — no password needed.

## Environment Variables

See `.env.example` for all required variables:

- `DATABASE_URL` — SQLite connection string (default: `file:./dev.db`)
- `NEXTAUTH_SECRET` — Session encryption key
- `STRIPE_SECRET_KEY` / `STRIPE_PUBLISHABLE_KEY` — Stripe test mode keys
- `OPENAI_API_KEY` — For AI-generated content (optional for demo)
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — Google OAuth (optional)

## Deploy to Vercel

1. Push to GitHub
2. Import to Vercel
3. Add environment variables in Vercel dashboard
4. For production, swap SQLite to a hosted database (Vercel Postgres, PlanetScale, etc.)

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── create/page.tsx       # Game creator wizard
│   ├── checkout/page.tsx     # Checkout with shipping & gift mode
│   ├── dashboard/page.tsx    # User's game orders
│   ├── order/success/        # Order confirmation
│   ├── auth/signin/          # Sign-in page
│   └── api/
│       ├── auth/             # NextAuth
│       ├── game/             # Game CRUD + rule generation
│       └── stripe/           # Checkout sessions + webhooks
├── components/
│   ├── ui/                   # Reusable UI components
│   ├── wizard/               # Wizard step components
│   ├── navbar.tsx
│   └── footer.tsx
└── lib/
    ├── auth.ts               # NextAuth config
    ├── prisma.ts             # Prisma client singleton
    ├── stripe.ts             # Stripe client + pricing config
    ├── game-data.ts          # Base games + rule mutations
    ├── game-store.ts         # Zustand wizard state
    └── utils.ts              # Tailwind cn() helper
```
