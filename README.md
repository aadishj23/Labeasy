<div align="center">

# 🧪 Labeasy

### Compare diagnostic labs, book tests, and *understand* your results with AI.

Labeasy is a full-stack diagnostics marketplace built for Tier‑2/3 India — connecting patients with accredited labs, and turning raw lab reports into plain‑language insight, health trends, and the right next step.

🌐 **Live:** [labeasy.aadishjain.dev](https://labeasy.aadishjain.dev/)

![Home Page](./public/Readme%20Photos/Home%20Page.png)

</div>

---

## 📑 Table of Contents

- [What is Labeasy?](#-what-is-labeasy)
- [Feature Highlights](#-feature-highlights)
- [Screenshots](#-screenshots)
  - [Patient Experience](#patient-experience)
  - [AI & Health Intelligence](#ai--health-intelligence)
  - [Lab Console](#lab-console)
  - [Admin Console](#admin-console)
  - [Authentication](#authentication)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Data Model](#-data-model)
- [Revenue Model](#-revenue-model)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
- [Future Scope](#-future-scope)

---

## 🩺 What is Labeasy?

Most diagnostic discovery in smaller Indian cities is offline, opaque, and fragmented. Patients can't easily compare prices, labs lack an online presence, and reports are PDFs that few people can actually read.

Labeasy solves this end‑to‑end:

- **For patients** — compare accredited labs by price/rating/location, book online (home collection or lab visit), pay securely, and get every report **explained by AI**, tracked over time, and paired with the right specialist.
- **For labs** — a complete storefront and operations console: list tests & packages, manage bookings, upload reports, run promotions & coupons, and get paid through an automated **wallet & settlement** system with analytics.
- **For the platform** — multiple revenue streams (commission, sponsored listings, insurance referrals) and an admin console to run the marketplace.

---

## ✨ Feature Highlights

### For Patients
- 🔎 **Lab & test discovery** — search by **city or pincode**, compare prices, ratings, and turnaround; sponsored labs surfaced first.
- 📦 **Tests & packages** — book individual tests or curated multi‑test packages from any lab.
- 🛒 **Smart checkout** — cart grouped by lab, **home collection or lab visit**, date/time slot picker (only future slots for today), **coupons**, and **insured‑user discounts**, paid via **Razorpay**.
- 📁 **Secure reports** — digital report inbox with **download** and **revocable share links**.
- 🧠 **AI report summaries** — plain‑language explanations of each report, abnormal values highlighted.
- 📈 **Health dashboard** — a **health score**, per‑marker **trends**, and "needs attention" flags.
- 🩻 **Doctor recommendations** — specialists **near you (by pincode)**, matched to your flagged results.
- 🛡️ **Insurance** — discover partner insurers and unlock **extra discounts** on tests.
- 🔔 **Re‑test reminders** — never miss a follow‑up.
- ⭐ **Reviews & ratings** — one editable review per lab.

### For Labs
- 🏢 **Storefront & catalogue** — list tests with your own pricing, build **packages**, manage your **profile** (verified changes go through admin approval).
- 📋 **Bookings & reports** — manage orders through their lifecycle and upload reports (PDF/image) — with **AI auto‑extraction** of analyte values.
- 🎟️ **Coupons & promotions** — issue discount codes and buy **sponsored placements** (priced per placement type).
- 💰 **Wallet & settlements** — order revenue is credited on completion; platform fees & ad spend are debited; net balance is settled to you.
- 📊 **Analytics** — bookings, revenue, and GMV trends.

### For Admins
- 🧾 **Test catalogue**, **lab verification**, and **profile change requests**.
- 📣 **Sponsored listings** monitoring, **wallet & settlements**, and platform **analytics**.
- 🤝 **Insurance partners** + referral/commission tracking, and a **doctor directory**.

### AI & Intelligence (Google Gemini)
- **Report summaries** at both the **dashboard** and **per‑report** level — including reading the **PDF directly** when no structured data exists.
- **Automatic analyte extraction** from uploaded reports → instant trends & scores.
- **Specialty suggestions** that power doctor recommendations.

---

## 📸 Screenshots

### Patient Experience

**Tests & Packages**
![Tests Page](./public/Readme%20Photos/Tests%20Page.png)

**Lab Discovery (search by city / pincode)**
![Labs Discovery](./public/Readme%20Photos/Labs%20Discovery.png)

**Cart & Checkout** (home collection / lab visit, slots, coupons)
![Cart](./public/Readme%20Photos/Cart.png)

**My Bookings**
![User Bookings](./public/Readme%20Photos/User%20Bookings.png)

**Insurance Discovery**
![Insurance Discovery](./public/Readme%20Photos/Insurance%20Discovery%20User.png)

**Profile & Addresses**
![User Profile](./public/Readme%20Photos/User%20Profile.png)

### AI & Health Intelligence

**Health Dashboard** — health score, trends, and flags
![Health Dashboard](./public/Readme%20Photos/Heath%20Dashboard.png)

**Doctors Near You & Analyte Values**
![Doctors near you](./public/Readme%20Photos/Doctors%20near%20you%20and%20Analyte%20Values%20user.png)

**Reports Inbox with AI Summary**
![Reports with AI Summary](./public/Readme%20Photos/Reports%20Page%20with%20AI%20Summary.png)

**AI Summary of a Report**
![AI Summary of Report](./public/Readme%20Photos/AI%20Summary%20of%20Report.png)

### Lab Console

**Lab Dashboard**
![Lab Dashboard](./public/Readme%20Photos/Lab%20Dashboard.png)

**Bookings & Report Upload**
![Lab Bookings](./public/Readme%20Photos/Lab%20Bookings.png)

**Test Packages**
![Test Packages Creation](./public/Readme%20Photos/Test%20Packages%20Creation%20Lab.png)

**Coupon Generation**
![Lab Coupon Generation](./public/Readme%20Photos/Lab%20Coupon%20Generaiton.png)

**Promote Your Lab (Sponsored Listings)**
![Promote Your Lab](./public/Readme%20Photos/Promote%20Your%20lab.png)

**Wallet & Earnings**
![Lab Wallet](./public/Readme%20Photos/Lab%20Wallet.png)

**Analytics**
![Lab Analytics](./public/Readme%20Photos/Lab%20Analytics.png)

**Lab Profile**
![Lab Profile](./public/Readme%20Photos/Lab%20Profile.png)

### Admin Console

**Test Catalogue**
![Admin Test Catalogue](./public/Readme%20Photos/Admin%20Test%20Catalogue.png)

**Lab Verification**
![Admin Lab Verification](./public/Readme%20Photos/Admin%20Lab%20Verificaiton.png)

**Profile Change Requests**
![Admin Change Requests](./public/Readme%20Photos/Admin%20Change%20requests.png)

**Sponsored Listings View**
![Admin Sponsored Listings](./public/Readme%20Photos/Admin%20Sponsored%20Lisitngs%20View.png)

**Wallet & Settlements**
![Admin Wallet](./public/Readme%20Photos/Admin%20Wallet.png)

**Platform Analytics**
![Admin Analytics](./public/Readme%20Photos/Admin%20Analytics.png)

**Insurance Partners & Lead Tracking**
![Admin Insurance](./public/Readme%20Photos/Admin%20Insurance%20Partner%20add%20and%20lead%20track.png)

**Doctor Directory**
![Admin Doctors](./public/Readme%20Photos/Admin%20Doctors%20Additon%20and%20view.png)

### Authentication

**Patient Sign Up**
![User Signup](./public/Readme%20Photos/User%20Singup.png)

**Lab Sign Up**
![Lab Signup](./public/Readme%20Photos/Lab%20Signup.png)

**Sign In**
![Sign In](./public/Readme%20Photos/Signin.png)

**Change Password**
![Change Password](./public/Readme%20Photos/Change%20Password.png)

**Reset Password (OTP)**
![Reset Password](./public/Readme%20Photos/Reset%20Password.png)

---

## 🛠 Tech Stack

| Area | Technology |
|---|---|
| **Framework** | Next.js 15 (App Router) · React 18 · TypeScript |
| **API** | Next.js Route Handlers (`src/app/api/v1/**`) — same‑origin |
| **Database** | PostgreSQL + Prisma 7 (via `@prisma/adapter-pg`) |
| **State** | Zustand (`useAuthStore`) |
| **Styling** | Tailwind CSS + shadcn‑style UI primitives |
| **Auth** | httpOnly cookie sessions (patient/lab) + JWT (admin), RBAC via middleware |
| **Payments** | Razorpay (orders + HMAC verification) |
| **File storage** | Cloudinary (report PDFs/images) |
| **Email** | Resend (order lifecycle, OTP, reminders) |
| **AI** | Google Gemini (`gemini-2.5-flash`) — summaries, extraction, suggestions |
| **Caching** | Upstash Redis (REST) — graceful, optional |
| **Charts** | Chart.js |
| **Deployment** | Docker (Next.js standalone) — or any Node host |

---

## 🏗 Architecture

A single, unified Next.js app (frontend + API in one same‑origin project):

```
src/
├── app/
│   ├── (routes)/            # each */page.tsx re-exports a view from src/views
│   ├── api/v1/**            # REST endpoints (auth, tests, orders, reports,
│   │                        #   labs, admin, insurance, doctors, health, reminders)
│   ├── sitemap.ts / robots  # SEO
│   └── layout.tsx
├── views/                   # page bodies (Home, Tests, Cart, Results, dashboards…)
├── components/              # shared UI + admin/lab widgets + ui/ primitives
├── store/                   # Zustand auth store
├── lib/                     # prisma, auth, redis, gemini, ai-summary, wallet,
│                            #   billing, coupons, pricing, cloudinary, email, geo…
prisma/                      # schema.prisma + migrations
public/                      # assets + Readme Photos
Dockerfile / .dockerignore   # standalone container build
```

**Key design choices**
- **Same‑origin API** — no separate backend/CORS; route handlers run on the Node runtime (needed for Prisma, bcrypt, JWT).
- **Role‑gated** — middleware protects `/labsdashboard`, `/admin`, and patient‑only pages; APIs verify the session/role and return `403` otherwise.
- **Graceful degradation** — Redis caching and AI calls fall back safely; a cache miss or AI/quota error never breaks a request.
- **Money in paise** (integers) throughout orders, invoices, wallet, and payouts.

---

## 🗄 Data Model

Core entities (Prisma / PostgreSQL):

- **Users & Auth** — `User` (patients), `Lab`, `Admin`, OTP/verification, `Address` (with default).
- **Catalogue** — `Tests` (global), `LabTest` (per‑lab pricing), `Package` + `PackageTest`.
- **Orders** — `Order`, `OrderItem`, `Payment`, `Slot`.
- **Reports & Health** — `Report` (file + structured results + cached `ai_summary`), `Review`, `HealthSummary`, `TestReminder`.
- **Monetization** — `Coupon` + `CouponRedemption`, `SponsoredListing`, `WalletEntry` (unified ledger).
- **Ecosystem** — `InsurancePartner`, `InsuranceLead`, `Doctor`.

The **wallet** is a single signed ledger per lab: order earnings credit it **on completion**, platform fees & sponsorships debit it, and admins settle the net balance — Ola/Uber style.

---

## 💸 Revenue Model

1. **Commission on GMV** — a performance‑based platform fee on monthly lab GMV (slab model), deducted from the wallet.
2. **Sponsored listings** — labs buy priced placements (everywhere / directory / specific tests).
3. **Insurance referrals** — commission from partner insurers (tracked via `sub_id`), with an extra test discount for insured users.
4. **Doctor referrals** — specialist discovery as an added channel.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- A PostgreSQL database
- (Optional but recommended) accounts for Razorpay, Cloudinary, Resend, Google Gemini, Upstash Redis

### Setup

```bash
# 1. Install
npm install

# 2. Configure environment
cp .env.example .env        # then fill in the values

# 3. Apply database migrations + generate the client
npx prisma migrate deploy
npx prisma generate

# 4. Run
npm run dev                 # http://localhost:3000
```

Build & run production:

```bash
npm run build
npm start
```

---

## 🔐 Environment Variables

All variables are documented in [`.env.example`](./.env.example). Summary:

| Group | Variables |
|---|---|
| Database | `DATABASE_URL` |
| Auth / Admin | `JWT_SECRET`, `ADMIN_EMAIL` |
| URLs | `NEXT_PUBLIC_SITE_URL` |
| Email (Resend) | `RESEND_API_KEY`, `RESEND_FROM_EMAIL` |
| Payments (Razorpay) | `RAZORPAY_API_KEY`, `RAZORPAY_API_SECRET` |
| Storage (Cloudinary) | `CLOUDINARY_URL` |
| AI (Gemini) | `GEMINI_API_KEY`, `GEMINI_MODEL` |
| Cache (Upstash) | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` |
| Cron | `CRON_SECRET` (for the re‑test reminder job) |

> Caching (Redis) and AI are **optional** — the app runs without them and degrades gracefully.

---

## 🐳 Deployment

### Docker (standalone)

The app builds to a self‑contained Next.js standalone server.

```bash
docker build -t labeasy .
docker run -d --env-file .env -p 3000:3000 labeasy
```

> **Note:** Docker's `--env-file` parser is strict — keep `KEY=value` with **no spaces around `=`** and **no surrounding quotes** (see `.env.example`).

### Non‑Docker

`output: "standalone"` is additive — `npm run build && npm start` (and platforms like Vercel) work unchanged.

### Scheduled jobs

Point a cron/scheduler at `POST /api/v1/reminders/run` with the `x-cron-secret` header to send due re‑test reminder emails.

---

## 🔮 Future Scope

- **Smarter recommendations** — proximity ranking (geo‑distance), preventive‑care nudges, and recurring‑test cadence suggestions.
- **Search infrastructure** — dedicated full‑text/geo search and a CDN cache layer.
- **PWA / mobile app** and **regional‑language (i18n)** support.
- **Deeper AI** — longitudinal health insights and risk scoring across report history.

---

<div align="center">

Built with ❤️ for accessible diagnostics.

</div>
