# MarketMind — Full Stack

## Structure

```
marketmind_backend/   Django REST API
marketmind_frontend/  Next.js frontend (your original design)
```

---

## Backend Setup

```bash
cd marketmind_backend

python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate

pip install -r requirements.txt

python manage.py migrate
python manage.py seed_data        # seeds assets, case studies, leaderboard

# Optional: create your own superuser
python manage.py createsuperuser

python manage.py runserver        # runs at http://localhost:8000
```

Admin panel: http://localhost:8000/admin

---

## Frontend Setup

```bash
cd marketmind_frontend

# make sure .env.local has:
# NEXT_PUBLIC_API_URL=http://localhost:8000/api

pnpm install     # or npm install
pnpm dev         # runs at http://localhost:3000
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/auth/register/ | Register new user |
| POST | /api/auth/login/ | Login |
| POST | /api/auth/logout/ | Logout |
| GET | /api/auth/me/ | Current user + profile |
| GET | /api/assets/ | All assets (optional ?category=Stocks) |
| GET | /api/assets/:id/ | Single asset |
| GET | /api/portfolio/ | Current user portfolio + holdings |
| POST | /api/trade/ | Execute buy/sell trade |
| GET | /api/trades/ | Trade history |
| GET | /api/case-studies/ | All case studies |
| GET | /api/case-studies/:id/ | Single case study |
| GET | /api/leaderboard/ | Top traders |
| GET | /api/analytics/ | User analytics |
| POST | /api/simulation/complete/ | Record simulation completion |

---

## Notes

- Django sessions handle auth (cookie-based). The frontend sends `credentials: 'include'` on every request.
- Each new user starts with $100,000 virtual cash.
- The `seed_data` command populates all static data (assets, case studies, leaderboard demo users).
- For production: set `DEBUG=False`, change `SECRET_KEY`, configure `ALLOWED_HOSTS`, set `FRONTEND_URL`, and use a `DATABASE_URL`.

---

## Deployment

### Render backend

Set these environment variables on the Render service:

- `DEBUG=False`
- `SECRET_KEY=<generate a new secret>`
- `ALLOWED_HOSTS=<your-render-hostname>,.onrender.com`
- `FRONTEND_URL=https://<your-vercel-app>.vercel.app`
- `CORS_ALLOWED_ORIGINS=https://<your-vercel-app>.vercel.app`
- `CSRF_TRUSTED_ORIGINS=https://<your-vercel-app>.vercel.app,https://*.vercel.app`
- `DATABASE_URL=<Render Postgres URL>`

Start command:

```bash
gunicorn marketmind.wsgi:application
```

### Vercel frontend

Set this environment variable in Vercel:

- `NEXT_PUBLIC_API_URL=https://<your-render-app>.onrender.com/api`

