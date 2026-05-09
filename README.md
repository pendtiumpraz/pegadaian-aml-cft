# Pegadaian AML/CFT — Aplikasi APU/PPT

Aplikasi **Anti-Pencucian Uang & Pencegahan Pendanaan Terorisme** (APU/PPT) untuk Divisi Kepatuhan PT Pegadaian. Sistem ini mendukung end-to-end alur AML/CFT: dari _customer due diligence_, pemantauan transaksi, _alert triage_, manajemen kasus, sampai pelaporan LTKM/LTKT ke PPATK.

---

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Backend | Laravel 12, PHP 8.2+ |
| Frontend | Inertia.js v3, React 18 |
| Build | Vite 7, Tailwind CSS v4 |
| Database | MySQL 8 |
| Auth | Local email/password + Portal SSO via OAuth2 (Laravel Passport client) |
| Routing helper | Ziggy v2 |
| Icons | Lucide React |

Design tokens: warm neutral surface + deep forest green oklch primary. Density variable + dark theme support.

---

## Modul Utama

### Operasional
1. **Dashboard** — KPI strip (Total Alerts, High Severity, Pending LTKM, Flagged Today), antrian alert prioritas tinggi dengan RiskBar, deadline laporan, distribusi risiko (Donut), volume transaksi 24 jam (SVG line), SLA tracker.
2. **Alerts** — Daftar alert dari rule engine. Triage workflow (assign, escalate, close, false-positive). Detail alert dengan Donut score + 4-5 FactorRow weighted bars + Timeline event history.
3. **Pemantauan Transaksi** — Stream transaksi nasabah dengan flagging engine, RiskBar inline, indikator rule-triggered (mono code: R-LTKT-01, R-SMURF-04), drill-in detail.
4. **Onboarding** — Standalone CDD wizard dengan 5-step Stepper (Identitas → Dokumen → Profil Risiko → Screening → Konfirmasi), screening tiles (DTTOT/DPPSPM/OFAC/Internal), IRA score Donut + 5 FactorRow breakdown.
5. **Manajemen Kasus** — Master-detail split: case list di kiri + persistent CaseDetail di kanan dengan Donut + FactorRow + Timeline + 4-button action footer (Tetapkan/Eskalasi/Buat draft LTKM/Tutup FP). Tabs: Antrian Saya / Tim / Eskalasi / Selesai / Semua.
6. **EDD (Enhanced Due Diligence)** — Master-detail dengan EDD list + EddDetailPanel: horizontal Stepper (Trigger → Profil → Sumber Dana → BO → Approval), QA cards dengan colored left border per stage, document checklist.

### Analisis
7. **Nasabah / CDD** — Customer-360 detail dengan KPI strip (Skor IRA, Outstanding Loan, Tx 30 Hari, Alert Lifetime), Profil Card, Komposisi IRA Donut + 5 FactorRow weighted (Profil Risiko 25%, Geografi 20%, Pekerjaan 20%, Pola Tx 25%, Alert History 10%), 30-day transactions sub-table.
8. **Watchlist DTTOT** — Tabbed (Watchlist Manager / Matches Hari Ini / PEP DB / Sanctions / Audit Log). Internal/PEP/Sanctions/Terrorist entries dengan alias_json, NIK mono, source tracking.
9. **LTKM Workspace** — Master-detail dengan Section A-E layout (Identitas Pelapor / Nasabah / Transaksi / Indikasi / Tindakan). **4-eyes approval enforcement**: `analyst_id !== auth()->id()` saat approve. Validasi schema PPATK + XML preview + Submit ke PPATK.
10. **Pelaporan Regulator** — Console laporan LTKT (harian) + LTKM + SAR + Schedule. PPATK sync status, XML preview, validation results.

### AI & Tools
11. **AI Patrol** _(NEW)_ — Natural Language → SQL builder. Prompt input ("Cari transaksi structuring 7 hari di atas Rp 100 juta dari nasabah PEP") → AI parsing → formula → generated SQL preview → cost/time estimate → Execute → results table. Template-based mock generator (tidak panggil AI eksternal di versi sekarang).

### Pengaturan
12. **Aturan Screening** — Tabbed admin (Aturan / Roles / Audit Trail / Model IRA / Integrations). Aturan tab: threshold mono input, hits 30hr count + Sparkline, FP rate %, version mono, custom toggle switch.
13. **Pelatihan & Awareness** — KPI strip (Karyawan Terlatih / Frontliner / Sertifikasi Aktif / Modul Aktif), 2-col layout (modul training + sertifikasi mendekati kadaluarsa), 3-col Kampanye Awareness card grid.
14. **Notifikasi** — Standalone notifications inbox dengan filter tabs (Semua / Alerts / Cases / Sistem) + preferences sidebar (per-category Email/Slack/In-app toggles).
15. **Pengaturan Sistem** — Section-per-group settings page (no wizard) dengan save-per-section batching. Type-aware inputs: boolean → toggle, integer → mono number, json → mono textarea.

---

## Authentication

Hybrid auth:
- **Lokal**: `/login` form dengan email + password (users table app)
- **Portal SSO**: tombol "Masuk via Portal SSO" → OAuth2 authorization code flow ke Portal (`http://localhost:8000`) → callback `/auth/portal/callback` → tukar code untuk access_token → fetch user dari Portal `/api/user` → match local user lewat email → `Auth::login()` + simpan portal_token di session

Pada SSO pertama, kolom `portal_user_id` di local user di-backfill dari Portal user ID untuk fast-path berikutnya.

### Default Users (setelah `db:seed`)

| Email | Password | Role | Job Title |
|-------|----------|------|-----------|
| `analis@aml.pegadaian.co.id` | `Password123!` | analyst | Analis AML |
| `approver@aml.pegadaian.co.id` | `Password123!` | approver | Approver AML |
| `admin@aml.pegadaian.co.id` | `Password123!` | admin | Admin AML |

> **4-eyes catatan**: Untuk approve LTKM, login dengan akun BERBEDA dari yang membuat LTKM. Misal kalau `analis@` yang buat draft, `approver@` atau `admin@` yang harus approve.

---

## Setup

### Prerequisites
- PHP 8.2+ dengan ekstensi: `pdo_mysql`, `sodium` (atau `--ignore-platform-req=ext-sodium` saat composer install)
- MySQL 8
- Node.js 20+
- Portal app (`pegadean-portal`) berjalan di `http://localhost:8000` jika ingin pakai SSO

### Install

```bash
# Clone
git clone https://github.com/pendtiumpraz/pegadaian-aml-cft.git
cd pegadaian-aml-cft

# Backend
composer install --ignore-platform-req=ext-sodium
cp .env.example .env
php artisan key:generate

# Database (DB harus sudah dibuat manual di MySQL: `aml_cft_dev`)
php artisan migrate --force
php artisan db:seed --force

# Frontend
npm install --legacy-peer-deps
npm run build

# Run
php artisan serve --port=8001
```

Untuk Portal SSO, set di `.env`:
```
PORTAL_URL=http://localhost:8000
PORTAL_CLIENT_ID=<dari portal seeder oauth_clients_seed.txt>
PORTAL_CLIENT_SECRET=<dari portal seeder>
PORTAL_REDIRECT_URI=http://localhost:8001/auth/portal/callback
```

### Development

```bash
# Hot reload
npm run dev

# Test login
http://localhost:8001/login
```

---

## Domain Model — Tabel Utama

| Tabel | Deskripsi |
|-------|-----------|
| `customers` | Nasabah/CIF dengan IRA score, PEP/blacklist flag, EDD required |
| `transactions` | Transaksi keuangan dengan flag suspicious + alert_triggered |
| `alerts` | Alert dari rule engine (severity, status, assigned_to) |
| `cases` | Manajemen kasus AML (linked alert + customer + PIC + 4-eyes) |
| `edd_cases` | EDD review dengan stage stepper + questionnaire |
| `watchlist_entries` | DTTOT/PEP/Sanctions/Internal entries |
| `ltkm_reports` | LTKM (Suspicious Transaction Report) ke PPATK dengan 4-eyes flow |
| `regulatory_reports` | Submisi LTKT harian + SAR |
| `screening_rules` | Rule definitions dengan conditions_json (NL/SQL) + threshold |
| `training_records` | Catatan pelatihan + certifications |
| `patrol_queries` | AI Patrol query history dengan generated SQL + results |

---

## Architecture Notes

- **MySQL index name limit**: semua multi-column index pakai nama eksplisit (≤64 chars) lewat 2nd arg `$table->index([...], 'idx_xxx_main')`
- **SoftDeletes** pada semua domain models. Trash/restore/forceDelete pattern via `onlyTrashed()` + `withTrashed()`
- **Inertia shared data** lewat `HandleInertiaRequests::share()`: auth.user (id, name, role, job_title, avatar_initials), flash, ziggy routes
- **Folder render path**: controller render `Inertia::render('Cases/Index')` → file `resources/js/Pages/Cases/Index.jsx`. Folder Inggris (Cases, Customers, Rules, Transactions, Training) — route prefix Indonesia (`/kasus`, `/nasabah`, `/aturan`, `/transaksi`, `/pelatihan`)

---

## Related Apps

Bagian dari **Pegadean Compliance Platform**:
- [pegadean-portal](https://github.com/pendtiumpraz/pegadean-portal) — SSO Server + Tenant Admin (port 8000)
- [pegadaian-iGRaCias](https://github.com/pendtiumpraz/pegadaian-iGRaCias) — Integrated GRC Information System (port 8002)
- [pegadean-iDesk](https://github.com/pendtiumpraz/pegadean-iDesk) — Compliance Workspace untuk policy lifecycle (port 8003)

---

## License

Proprietary — PT Pegadaian (Persero). Internal use only.
