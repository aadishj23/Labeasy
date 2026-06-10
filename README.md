<div align="center">

# 🧪 Labeasy

### Book lab tests, consult doctors, buy insurance — and *understand* your health with AI.

Labeasy is a full-stack **multi-vendor healthcare marketplace** built for Tier‑2/3 India. Patients compare accredited **labs**, consult **doctors**, and buy **health insurance** in one place — while every lab report is turned into plain‑language insight, health trends, and the right next step. Labs, doctors, and insurers each run their own storefront, bookings, wallet, and analytics.

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
  - [Vendor Console](#vendor-console)
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

- **For patients** — compare accredited labs by price/rating/location and book tests (home collection or lab visit); **book doctor consultations** by specialty, pincode and time; **buy health insurance** plans — all paid securely, with every report **explained by AI**, tracked over time, and paired with the right specialist.
- **For vendors (labs, doctors & insurers)** — each gets a full storefront and operations console: list tests/packages, slots, or insurance plans; manage bookings; a **patient catalogue** (CRM); coupons & featured promotion; analytics; and an automated **wallet & settlement** system. Profile edits are admin‑approved.
- **For the platform** — multiple revenue streams (per‑vendor commission/GMV fees, sponsored listings, insurance commission, platform‑funded coupons) and an admin console to run the whole marketplace.

---

## ✨ Feature Highlights

### For Patients
- 🔎 **Lab & test discovery** — search by **city or pincode**, compare prices, ratings, and turnaround; sponsored labs surfaced first.
- 📦 **Tests & packages** — book individual tests or curated multi‑test packages from any lab.
- 🩺 **Doctor consultations** — find doctors by **specialty, pincode, and preferred time**, view open slots, and **book & pay** for a consult (featured doctors surfaced first).
- 🛡️ **Health insurance** — browse partner insurers' plans and **buy in‑app** (Razorpay).
- 🛒 **Smart checkout** — cart grouped by lab, **home collection or lab visit**, date/time slot picker, **discoverable coupons** (vendor & platform), insured‑user discounts.
- 🧾 **Unified bookings** — tests, consultations, and insurance in one place, sorted by date, with booking‑gated **reviews** for labs, doctors & insurers.
- 📁 **Secure reports** — digital report inbox with **download** and **revocable share links**.
- 🧠 **AI report summaries** — plain‑language explanations of each report, abnormal values highlighted.
- 📈 **Health dashboard** — a **health score**, per‑marker **trends**, and "needs attention" flags.
- 🔔 **Re‑test reminders** — never miss a follow‑up.

### For Vendors — Labs · Doctors · Insurers
- 🏢 **Storefront** — labs list tests & **packages**; doctors manage **slots** (single + recurring, cancel slot/day); insurers list **plans** (commission admin‑approved).
- 📋 **Bookings** — labs manage orders & upload reports (with **AI analyte extraction**); doctors manage appointments (incl. off‑platform "mark booked" with paid status); insurers track **sales & leads**.
- 👥 **Patient catalogue** *(labs & doctors)* — a built‑in CRM: add patients manually or auto‑gathered from bookings, **auto‑linked by phone**, with full per‑vendor **history**, and **book a patient** straight into a slot/test.
- 🎟️ **Coupons** — issue your own discount codes; **platform (admin) coupons** are funded by Labeasy (you're still paid in full).
- 📣 **Promote** — buy **featured placement** to rank first in discovery.
- 💰 **Wallet & settlements** — earnings credit on completion; fees/ad spend/commission debit; net is settled to you.
- 📊 **Analytics** — bookings, revenue & GMV trends, with an **off‑platform** toggle.
- ✏️ **Profile** — all profile edits go through **admin approval**.

### For Admins
- 🧾 **Test catalogue**, **vendor verification** (labs/doctors/insurers: approve / suspend), and **profile change requests** across all vendor types.
- 🎟️ **Platform coupons** — create platform‑funded coupons scoped to all / labs / doctors / insurers.
- 📣 **Sponsored listings** (all vendors), **wallet & settlements** (payouts to whom we owe, reminders for who owes us, per‑vendor ledgers), and platform **analytics** (consults + policy GMV, per‑vertical filter).
- 🤝 **Insurance** approvals + lead/commission tracking, and **doctor** approvals.

### Automation
- ⏱️ **Auto‑billing** — monthly GMV‑slab platform fees for labs & doctors run automatically (cron, `x-cron-secret`).

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

### Vendor Console

> Labs, doctors, and insurers share the same console primitives — storefront, bookings, patient catalogue, coupons, promotion, wallet, analytics, and approval‑gated profiles. The lab views below are representative.

**Vendor Dashboard**
![Vendor Dashboard](./public/Readme%20Photos/Lab%20Dashboard.png)

**Patient Catalogue & History** (labs & doctors)
![Patient Catalogue](./public/Readme%20Photos/Patient%20Catalogue.png)

**Bookings & Report Upload**
![Bookings](./public/Readme%20Photos/Lab%20Bookings.png)

**Test Packages** (labs)
![Test Packages Creation](./public/Readme%20Photos/Test%20Packages%20Creation%20Lab.png)

**Coupon Generation**
![Coupon Generation](./public/Readme%20Photos/Lab%20Coupon%20Generaiton.png)

**Promote (Featured Placement)**
![Promote](./public/Readme%20Photos/Promote%20Your%20lab.png)

**Wallet & Earnings**
![Wallet](./public/Readme%20Photos/Lab%20Wallet.png)

**Analytics**
![Analytics](./public/Readme%20Photos/Lab%20Analytics.png)

**Profile (admin‑approved edits)**
![Profile](./public/Readme%20Photos/Lab%20Profile.png)

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

**Vendor Sign Up** (lab/doctor/insurer — license upload + email OTP)
![Vendor Signup](./public/Readme%20Photos/Lab%20Signup.png)

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
| **Auth** | httpOnly cookie sessions (patient/lab/doctor/insurer) + JWT (admin), RBAC via middleware |
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
│   ├── api/v1/**            # REST endpoints (auth, tests, orders, reports, labs,
│   │                        #   doctor, insurance, vendor, coupons, admin, cron…)
│   ├── sitemap.ts / robots  # SEO
│   └── layout.tsx
├── views/                   # page bodies (Home, Tests, Cart, Results, dashboards…)
├── components/              # shared UI + admin/lab widgets + ui/ primitives
├── store/                   # Zustand auth store
├── lib/                     # prisma, auth, redis, gemini, ai-summary, wallet,
│                            #   billing, coupons, sponsored, vendor-patient,
│                            #   pricing, cloudinary, email, geo…
prisma/                      # schema.prisma + migrations
public/                      # assets + Readme Photos
Dockerfile / .dockerignore   # standalone container build
```

**Key design choices**
- **Same‑origin API** — no separate backend/CORS; route handlers run on the Node runtime (needed for Prisma, bcrypt, JWT).
- **Role‑gated** — middleware protects `/labsdashboard`, `/doctordashboard`, `/insurancedashboard`, `/admin`, and patient‑only pages; APIs verify the session/role and return `403` otherwise.
- **Graceful degradation** — Redis caching and AI calls fall back safely; a cache miss or AI/quota error never breaks a request.
- **Money in paise** (integers) throughout orders, invoices, wallet, and payouts.

---

## 🗄 Data Model

Core entities (Prisma / PostgreSQL):

- **Vendors & Auth** — `User` (patients), `Lab`, `Doctor`, `InsuranceCompany`, `Admin`; OTP/verification, `Address`, cross‑vendor unique email/phone, and `ProfileChangeRequest` (vendor‑generic, admin‑approved edits).
- **Catalogue** — `Tests` (global), `LabTest` (per‑lab pricing), `Package` + `PackageItem`.
- **Lab orders** — `Order` (platform + **manual/offline** orders), `OrderItem`, `Payment`, `Slot`.
- **Doctors** — `DoctorSlot`, `Appointment` (platform + manual, with paid status).
- **Insurance** — `InsurancePlan` (commission %, admin‑approved), `PolicyPurchase`, `InsuranceLead`.
- **Patient catalogue** — `VendorPatient` (per vendor, **phone‑keyed**, links to a `User` by phone).
- **Reports & Health** — `Report` (file + structured results + cached `ai_summary`), `Review` (target‑generic: lab/doctor/insurer), `HealthSummary`, `TestReminder`.
- **Monetization** — `Coupon` (owner‑based: vendor **or** ADMIN with scope) + `CouponRedemption`, `SponsoredListing` (owner‑based), `WalletEntry` (unified ledger across all vendors).

The **wallet** is a single signed ledger per vendor (`owner_type`/`owner_id`): earnings credit it **on completion**, platform fees / ad spend / commission debit it, and admins settle the net balance — Ola/Uber style. Manual (off‑platform) bookings never touch the wallet; **admin‑coupon discounts are funded by Labeasy**, so the vendor is always paid in full.

---

## 💸 Revenue Model

1. **GMV‑slab platform fee** — a performance‑based monthly fee on **lab & doctor** GMV (slab model), auto‑charged to the wallet.
2. **Insurance commission** — a per‑plan commission (admin‑approved %) on every policy sold; off‑platform conversions are also charged the referral commission.
3. **Sponsored / featured listings** — labs, doctors & insurers buy priced placements to rank first.
4. **Platform‑funded coupons** — admin coupons drive demand; Labeasy absorbs the discount while vendors are paid in full.

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

Point your server's cron/scheduler at these endpoints with the `x-cron-secret: $CRON_SECRET` header:

| Job | Endpoint | Suggested schedule |
| --- | --- | --- |
| Re‑test reminder emails | `POST /api/v1/reminders/run` | hourly / daily |
| Monthly platform fees (labs & doctors) | `POST /api/v1/cron/monthly-fees` | `0 0 1 * *` (1st of month) |

Example host crontab (self‑hosted):

```cron
# 1st of each month — charge the previous month's GMV‑slab fee to labs & doctors
0 0 1 * * curl -fsS -X POST -H "x-cron-secret: $CRON_SECRET" https://<your-domain>/api/v1/cron/monthly-fees
```

Both jobs are idempotent, so an accidental re‑run won't double‑charge or double‑send.

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
