# HealthCare+ — Hospital Management System (Full Stack)

A full hospital management platform with role-based access for
**Admin, Doctor, Nurse, Receptionist, and Patient** users. Patients can
browse doctors/departments, book appointments, and manage their own
health records. Staff get a dashboard for patient records, prescriptions,
lab reports, billing, bed management, and audit logs.

```
hospital-management/
  backend/     ← Express API + MongoDB + JWT auth + RBAC
  frontend/    ← React app (Vite) + React Router dashboards
```

## What's included

- **Role-based access control** — Admin, Doctor, Nurse, Receptionist, Patient,
  each with their own permissions and dashboard views
- **Patient profiles** — medical history, allergies, blood group, emergency
  contact, prescriptions, lab reports, billing, appointment history
- **Doctor/Nurse tools** — daily queue, consultation notes, vitals,
  prescriptions, lab test orders
- **Admin tools** — staff account management, billing overview, bed
  management, audit logs
- **Dashboard analytics** — total patients, today's appointments, available
  beds, pending bills, emergency cases today
- **Security** — bcrypt password hashing, JWT auth, account lockout after
  repeated failed logins, rate limiting, helmet, NoSQL-injection sanitization,
  HTTP parameter pollution protection, centralized error handling, audit
  logging of sensitive actions

---

## 1. MongoDB database

Reuse your existing Atlas cluster — database name: `hospital-management`.

If your ISP blocks the standard `mongodb+srv://` connection string, use
the standard (non-SRV) connection string format instead.

---

## 2. Run the backend

```bash
cd backend
npm install
copy .env.example .env
```

Edit `.env`:
```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/hospital-management?retryWrites=true&w=majority
JWT_SECRET=any_long_random_string_you_want
CORS_ORIGIN=http://localhost:5173
```

`JWT_SECRET` can be literally anything — it's just used to sign login
sessions. `CORS_ORIGIN` should list every frontend URL allowed to call
this API (comma-separated for more than one, e.g. your Vercel URL +
localhost during development).

```bash
npm run dev
```

### Seed the database (do this once)

```bash
npm run seed
```

This creates departments, doctors (with logins), nurses, a receptionist,
an admin, and a set of hospital beds. Safe to re-run — it clears and
re-inserts staff/demo data each time (existing patient signups are left
untouched).

**Demo logins created by the seed script** (password for all: `Passw0rd!`):

| Role         | Email                                  |
|--------------|-----------------------------------------|
| Admin        | admin@healthcareplus.demo               |
| Doctor       | imran.qureshi@healthcareplus.demo       |
| Nurse        | aliya.baig@healthcareplus.demo          |
| Receptionist | reception@healthcareplus.demo           |
| Patient      | (register yourself from the homepage)   |

Run `npm run seed` and check the terminal output for the full list of
doctor emails it created.

---

## 3. Run the frontend

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

- Patients register/log in and book from the homepage.
- Staff (and patients) can also log in directly at `/login`, which
  redirects to `/dashboard`.

---

## 4. Deploying

**Frontend → Vercel.** Root Directory: `frontend`. Set `VITE_API_URL` to
your backend's live URL.

**Backend → Vercel (serverless).** Root Directory: `backend`. This repo
includes a `vercel.json` so the Express app runs as a Vercel serverless
function — no code changes needed beyond what's already here. Set these
Environment Variables on the backend Vercel project: `MONGO_URI`,
`JWT_SECRET`, `CORS_ORIGIN`.

(Railway or Render also work for the backend if you prefer a traditional
always-on server — same environment variables, Root Directory `backend`,
start command `npm start`.)

**Important:** after both are deployed, update the backend's `CORS_ORIGIN`
variable to include your live frontend URL (e.g.
`https://your-frontend.vercel.app`), and update the frontend's
`VITE_API_URL` to point at the live backend URL — then redeploy the
frontend so the new value is baked into the build.

Once both are connected to GitHub, future updates are just:
```bash
git add .
git commit -m "your message"
git push
```
Vercel will pick up the push and redeploy automatically.
