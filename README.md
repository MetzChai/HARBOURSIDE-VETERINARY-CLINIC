# Harbourside Veterinary Clinic

Next.js clinic management app backed by [Neon](https://neon.tech) PostgreSQL.

## Stack

- **Next.js 15** (App Router)
- **Neon** PostgreSQL via `@neondatabase/serverless`
- **TanStack Query** + **shadcn/ui** (unchanged UI)

## Setup

1. Copy environment variables:

```bash
cp .env.example .env
```

2. Add your Neon connection string and auth secret to `.env`:

```
DATABASE_URL=postgresql://...
AUTH_SECRET=your-random-secret
```

3. Install dependencies and apply the database schema:

```bash
npm install
npm run db:push
```

4. Add your clinic logo at `public/logo.png`.

5. Start the dev server:

```bash
npm run dev
```

## Accounts

- **Staff (admin):** sign up with an `@harbourside.com` email
- **Pet owners:** sign up with any other email

## Optional

- `LOVABLE_API_KEY` — enables PawBot AI chat in the owner portal
