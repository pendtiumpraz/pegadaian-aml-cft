# Rekomendasi Tech Stack — AML/CFT System

**Stack: Laravel 12 + Inertia.js + React 18 + PostgreSQL 15**

Ini adalah 1 dari 4 app dalam platform compliance Pegadaian.
Keempat app (Portal, iDesk, i-GRaCiaS, AML/CFT) menggunakan **tech stack yang sama**.

---

## Tech Stack

### Backend: Laravel 12 + PHP 8.4
- **Auth**: SSO via Portal (OAuth2/Passport) + Sanctum untuk session lokal
- **RBAC**: Spatie Permission — role: AML Analyst, MLRO, Compliance Head, Admin
- **ORM**: Eloquent + Migration + soft delete
- **Queue**: Laravel Queue + Redis (async: AI calls, batch screening, report generation)
- **Tenancy**: Stancl/Tenancy (multi-database per tenant, custom domain, BYODB)
- **Audit**: Spatie Activity Log (immutable audit trail — syarat regulator)
- **Encryption**: Laravel Crypt untuk PII (NIK, data nasabah)
- **HTTP Client**: Built-in untuk integrasi AI API, DukCapil, PPATK
- **Reporting**: DomPDF + Maatwebsite Excel (LTKT, LTKM, laporan internal)
- **Rules Engine**: Decision rules via configurable PHP classes + database-driven rules

### Frontend: React 18 + Inertia.js + TypeScript
- **UI Framework**: Ant Design atau Shadcn UI (enterprise dashboard)
- **Styling**: Tailwind CSS + CSS variables (whitelabel branding per tenant)
- **Table**: TanStack Table (customer list, transaction monitoring, alert queue)
- **Charts**: Recharts / ApexCharts (risk heatmap, anomaly dashboard, KPI)
- **Forms**: React Hook Form + Zod (CDD/EDD forms, complex validation)
- **Theming**: Dynamic CSS variables per tenant (whitelabel)

### Database: PostgreSQL 15
- JSONB untuk data compliance yang bervariasi (profil risiko, rule config)
- Full-text search untuk pencarian nasabah & transaksi
- Table partitioning by month untuk tabel `transactions` (300k tx/hari)
- BRIN indexes untuk time-series query
- Per-tenant database (Stancl/Tenancy) — BYODB ready

### Infrastructure
- **Cache/Queue**: Redis (session, cache, queue broker)
- **Storage**: S3-compatible (evidence docs, PDF report) — BYOS ready
- **Search**: PostgreSQL full-text search (cukup untuk scale ini)
- **AI**: HTTP → OpenAI / Gemini / Claude API (risk scoring, anomaly hint, document OCR)

---

## Kenapa Laravel (bukan Django/Spring/FastAPI)?

| Kriteria | Laravel ✅ | Django | Spring Boot | FastAPI |
|---|---|---|---|---|
| **AI via API** | HTTP Client cukup | Overkill | Overkill | Overkill |
| **Talent Indonesia** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **CRUD + Dashboard** | Sweet spot | Bagus | Verbose | Kurang |
| **Admin/Reporting** | Excellent ecosystem | Django Admin | Manual | Manual |
| **Queue/Async** | Built-in | Celery (extra) | Spring Batch | Built-in |
| **Time to MVP** | 3-4 bulan | 3 bulan | 4 bulan | 3.5 bulan |
| **Consistency** | ✅ Sama dengan 3 app lain | ❌ Beda stack | ❌ Beda stack | ❌ Beda stack |
| **SaaS/Multi-tenant** | Stancl/Tenancy mature | django-tenants | Manual | Manual |

**Alasan utama**: AI diakses via API (bukan self-host ML), jadi tidak perlu Python/Java stack.
Konsistensi dengan 3 app lain (Portal, iDesk, i-GRaCiaS) = 1 tim, 1 stack, 1 deployment pipeline.

---

## Shared Composer Packages

Packages yang di-share dengan 3 app lain:

```
pegadaian/auth-client      → SSO token validation ke Portal
pegadaian/tenant-core      → Stancl/Tenancy base config, BYODB resolver
pegadaian/ai-service       → AI API wrapper (OpenAI, Gemini, Claude)
pegadaian/branding         → Whitelabel theming utilities
pegadaian/audit-trail      → Activity logging standard
```

---

## REST API (Parallel)

Selain Inertia routes untuk web UI, app juga expose REST API:

```
/api/v1/customers          → CRUD nasabah + profil risiko
/api/v1/screening          → Run CDD screening
/api/v1/alerts             → Alert management
/api/v1/cases              → Case management
/api/v1/reports            → Regulatory reporting
/api/v1/watchlists         → Watchlist management
```

API ini digunakan oleh:
- Whitelabel client yang build custom frontend
- Mobile app (future)
- Cross-app communication (i-GRaCiaS consume compliance signals)
