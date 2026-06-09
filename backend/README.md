# ELMS Backend

## Setup

```bash
cp .env.example .env
npm install
npm run setup   # prisma generate + db push + seed
npm run dev
```

## Environment variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret for signing JWT tokens |
| `PORT` | Server port (default 4000) |
| `SEED_ADMIN_PASSWORD` | Admin password for seed script |

## Scripts

- `npm run dev` — start with nodemon
- `npm run setup` — generate client, push schema, seed data
- `npm run seed` — seed demo data only
