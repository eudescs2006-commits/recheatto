# Recheatto Backend - Ready for Deploy (Railway / Render)

This package contains a ready-to-deploy Express + Prisma backend for **Recheatto**.

## Quick overview
- Node.js + Express
- Prisma + PostgreSQL
- Mercado Pago integration (preferences + webhook) — configure MP_ACCESS_TOKEN
- Socket.IO for real-time order updates
- JWT auth for admin routes (simple stub for demo)
- Regions table for fixed freight; supports "free shipping" (fee = 0)

## Setup (Railway / Render - recommended for non-developers)
1. Create a project on Railway (https://railway.app) or Render/Render.com.
2. Add a PostgreSQL addon (Railway does it automatically) and copy the `DATABASE_URL`.
3. In project settings, add the environment variables (see `.env.example`):
   - DATABASE_URL
   - MP_ACCESS_TOKEN
   - JWT_SECRET
   - BACK_URL (ex: https://your-frontend-url.com)
   - PORT (optional)
4. Deploy the repo (upload zip or connect GitHub). Railway/Render will run `npm install`.
5. After deploy, run Prisma migrations:
   - Open the Railway shell or use `Deploy -> Run Command`:
     ```
     npx prisma generate
     npx prisma migrate deploy
     ```
   - Or run `npx prisma migrate dev --name init` in a local dev environment.

6. Seed initial regions & products (optional): use SQL or create HTTP calls to admin endpoints after login.

## Local development
- Install Node.js (LTS) and PostgreSQL.
- Copy `.env.example` to `.env` and fill values.
- Run:
  ```
  npm install
  npx prisma generate
  npx prisma migrate dev --name init
  npm run dev
  ```

## Endpoints (examples)
- `POST /api/checkout` - create order & create MP preference
- `POST /api/webhook/mercadopago` - webhook for MP notifications
- `POST /api/admin/login` - returns JWT (demo credentials: admin / senha123)
- `GET /api/admin/orders` - list orders (requires JWT)

## Notes
- Replace the demo admin login with a proper admin table before production.
- Configure Mercado Pago webhooks to point to `/api/webhook/mercadopago`.
- For PIX flows, Mercado Pago returns QR data via payment endpoints; adapt frontend to consume it.

