# 🏗️ Tech Stack Analysis: Platform Compliance Pegadaian

## 📋 Overview Platform

Platform compliance terdiri dari **4 aplikasi terpisah** dengan **tech stack yang sama**:

```
┌────────────────────────────────────────────────────┐
│                    PORTAL                          │
│         SSO · Tenant Management · Billing          │
│              App Launcher · Admin                  │
└────────┬──────────────┬──────────────┬─────────────┘
         │              │              │
   ┌─────▼─────┐ ┌──────▼──────┐ ┌────▼──────┐
   │   iDesk   │ │  i-GRaCiaS  │ │  AML/CFT  │
   │           │ │             │ │           │
   │ Workspace │ │ Governance  │ │ Anti-Money│
   │ Tasks     │ │ Risk        │ │ Laundering│
   │ Dashboard │ │ Compliance  │ │ CDD/STR   │
   └───────────┘ └─────────────┘ └───────────┘
```

### Deskripsi Per Aplikasi

| App | Domain | Target User | Fungsi Utama |
|---|---|---|---|
| **Portal** | Identity & Tenant | Super admin, Tenant admin | SSO, tenant management, billing, app launcher |
| **iDesk** | Compliance Workspace | Compliance officer, Manager | Dashboard, task management, notifications, daily ops |
| **i-GRaCiaS** | GRC Framework | Risk officer, Auditor, Board | Risk register, policy management, control monitoring, audit |
| **AML/CFT** | Anti-Money Laundering | AML analyst, MLRO, Compliance head | CDD/EDD, STR/LTKM, sanctions screening, watchlist, PEP |

### Prinsip Arsitektur

- ✅ **4 app terpisah** — repo sendiri, deploy sendiri, DB sendiri
- ✅ **1 tech stack** — semua pakai Laravel + React + PostgreSQL
- ✅ **SSO via Portal** — single login, token-based auth antar app
- ✅ **Per-app tenancy** — tiap app handle multi-tenant sendiri via Stancl
- ✅ **Same BYODB/BYOS pattern** — konsisten di semua app

---

## 🔧 Tech Stack (Sama untuk semua 4 app)

### Database: PostgreSQL 15+
- JSONB support → fleksibel untuk data compliance yang bervariasi
- Full-text search → pencarian nasabah, transaksi, risk items
- Row-level security → keamanan data per-role
- ACID compliant → wajib untuk data keuangan
- **Tiap app punya DB sendiri per tenant** (bukan shared DB)

### Backend: Laravel 12 + PHP 8.4
- Auth: Laravel Passport (Portal sebagai OAuth2 server) + Sanctum (per-app session)
- RBAC: Spatie Permission (role & permission beda per app)
- ORM: Eloquent + Migration
- Queue: Laravel Queue + Redis (async AI calls, report generation)
- Tenancy: Stancl/Tenancy (multi-database, custom domain, BYODB)
- Reporting: DomPDF, Maatwebsite Excel
- AI: HTTP Client built-in → external API

### Frontend: React 18 + Inertia.js
- UI: Ant Design atau Shadcn UI (enterprise dashboard style)
- Table: TanStack Table (data-heavy views)
- Charts: Recharts / ApexCharts (analytics & dashboard)
- Forms: React Hook Form + Zod (validasi)
- Theming: Tailwind CSS + CSS variables (whitelabel branding per tenant)

### Infrastructure
- Cache/Queue: Redis
- Storage: S3-compatible (BYOS ready per tenant)
- AI: HTTP → OpenAI / Gemini / Claude API
- CI/CD: GitHub Actions
- Server: VPS atau container (per app atau shared server)

---

## 🔐 SSO Architecture

```
User buka portal.pegadaian-compliance.com
→ Login (email + password + 2FA)
→ Portal issue OAuth2 token (Laravel Passport)
→ User klik "Open iDesk"
→ Redirect ke idesk.pegadaian-compliance.com?token=xxx
→ iDesk validasi token ke Portal API
→ iDesk create local session
→ User masuk iDesk dengan role yang sesuai
```

Tiap app validasi token ke Portal, tapi manage session sendiri.
User hanya perlu login **1x** di Portal.

---

## 📁 Struktur Repo

```
github.com/pegadaian-compliance/
├── portal/          → Laravel + React (OAuth2 server, tenant mgmt)
├── idesk/           → Laravel + React (workspace app)
├── igracias/        → Laravel + React (GRC app)
├── amlcft/          → Laravel + React (AML/CFT app)
└── shared-packages/ → Composer packages shared antar app
    ├── auth-client/     → OAuth2 token validation
    ├── tenant-core/     → Stancl/Tenancy base config
    ├── ai-service/      → AI API wrapper
    ├── branding/        → Whitelabel theming utilities
    └── audit-trail/     → Activity logging standard
```

Shared packages di-publish sebagai **private Composer packages**,
di-install di tiap app via `composer require pegadaian/auth-client`.

---

## 📊 Database Per App Per Tenant

```
Portal (central, tidak per-tenant):
└── portal_db
    ├── tenants
    ├── users (master user pool)
    ├── subscriptions
    ├── billing
    └── app_assignments (tenant → app access)

iDesk (per tenant):
├── idesk_pegadaian     → Pegadaian's iDesk data
├── idesk_bankxyz       → Bank XYZ's iDesk data (whitelabel)
└── idesk_clientC       → Client C's iDesk data (BYODB → external server)

i-GRaCiaS (per tenant):
├── igracias_pegadaian
├── igracias_bankxyz
└── igracias_clientC

AML/CFT (per tenant):
├── amlcft_pegadaian
├── amlcft_bankxyz
└── amlcft_clientC
```

Tiap tenant bisa subscribe ke 1, 2, atau semua 3 app.
Data antar app **tidak di-share langsung** — kalau perlu cross-app data, via API antar app.

---

## 💰 Pricing Model (per tenant)

```
┌───────────┬────────────┬───────────────┬──────────────────┐
│   Plan    │  Starter   │ Professional  │   Enterprise     │
├───────────┼────────────┼───────────────┼──────────────────┤
│ Apps      │ 1 app      │ 2 apps        │ All 3 apps       │
│ Users     │ Up to 10   │ Up to 50      │ Unlimited        │
│ Database  │ Shared     │ Dedicated DB  │ BYODB support    │
│ Storage   │ 5 GB       │ 50 GB         │ BYOS support     │
│ Branding  │ Logo only  │ Full theming  │ Custom domain    │
│ AI Calls  │ 100/month  │ 1000/month    │ Unlimited        │
│ API       │ ❌         │ Read-only     │ Full API access  │
│ Support   │ Email      │ Priority      │ Dedicated + SLA  │
└───────────┴────────────┴───────────────┴──────────────────┘
```

---

*Lihat `02-LARAVEL-REACT-VS-NEXTJS.md` untuk perbandingan frontend architecture*
*Lihat `03-SAAS-WHITELABEL-ARCHITECTURE.md` untuk detail BYODB/BYOS/whitelabel*
