# Roadmap — AML/CFT System

**Durasi total: 10 bulan** (termasuk SaaS readiness)
**Stack: Laravel 12 + Inertia.js + React 18 + PostgreSQL 15**
**Constraint**: PPATK submission harus live ≤ bulan ke-6.

---

## Fase 0 — Preparation (Bulan 0, 3 minggu)
- Business Analysis: workshop dengan AML CFT Dept
- Gathering dokumen: POJK 8/2023, SE Dir Pegadaian APU-PPT, template XML goAML PPATK
- Setup development environment (Laravel 12, PostgreSQL, Redis)
- **Output**: BRD, SRS v1, risk register, backlog

## Fase 1 — MVP Core CDD (Bulan 1–3)
**Goal: CDD & screening bisa dipakai outlet**
- Laravel 12 setup + Inertia.js + React 18 + Stancl/Tenancy
- SSO integration dengan Portal (OAuth2 token validation)
- Customer master + profil risiko APU-PPT
- Integrasi DukCapil (verifikasi NIK via HTTP Client)
- Watchlist manager: DTTOT, DPPSPM (manual upload dulu)
- Screening engine (fuzzy name match — PostgreSQL full-text search + trigram)
- IRA scoring (rule-based, parameter POJK)
- Web UI: form CDD outlet, dashboard officer (Inertia + React)
- REST API `/api/v1/` parallel (untuk future whitelabel/mobile)
- **Deliverable**: 1 outlet pilot jalan (UAT)

## Fase 2 — Transaction Monitoring (Bulan 4–6)
**Goal: deteksi anomali & auto-alert**
- Batch import transaksi dari Core Pegadaian (API/scheduled job)
- Rules engine (database-driven PHP) — 15 rule dasar (structuring, velocity, high-risk country, dll.)
- Laravel Queue + Redis untuk batch processing
- Case management: assignment, SLA, narrative, decision
- EDD workflow (escalation, 4-eyes — Spatie Permission)
- Dashboard anomali + drill-down (Recharts/ApexCharts)
- AI integration: anomaly hints via OpenAI/Gemini API
- **Deliverable**: TM live di 50 outlet pilot

## Fase 3 — Regulatory Reporting (Bulan 5–7)
**Goal: kewajiban pelaporan terpenuhi**
- Generator XML goAML: LTKT (harian), LTKM (insidental)
- SFTP gateway PPATK + reconciliation ack (Laravel scheduled job)
- Laporan TPP (Pendanaan Terduga Terorisme) insidental
- Laporan Nasabah Baru triwulanan
- PDF/Excel export (DomPDF + Maatwebsite Excel)
- **Deliverable**: submission PPATK auto, zero manual Excel

## Fase 4 — AI Enhancement (Bulan 7–8)
**Goal: upgrade deteksi dengan AI assist**
- AI risk scoring via API (OpenAI/Gemini/Claude)
- AI-assisted pattern detection (transaction anomaly hints)
- AI narrative generator (ringkasan kasus EDD)
- PEP screening tambahan (opsional)
- **Deliverable**: AI scoring hybrid dengan rules

## Fase 5 — Rollout & Internal Reporting (Bulan 8–9)
- Rollout seluruh outlet (~4.000 cabang)
- Performance tuning: partition pruning, Redis warming, query optimization
- Template laporan internal (Dekom/Direksi, KPR, BRI Kepatuhan, KTKT, OJK/BI)
- Training user: 3 batch × 40 peserta
- **Deliverable**: GA production

## Fase 6 — SaaS & Whitelabel (Bulan 9–10)
- BYODB/BYOS implementation (Stancl/Tenancy config)
- Whitelabel branding (CSS variables per tenant)
- Custom domain support
- API documentation (Swagger/Scramble)
- Billing integration (Xendit/Stripe) via Portal
- **Deliverable**: Ready untuk onboard whitelabel client pertama

---

## Milestone KPI
| Bulan | KPI |
|---|---|
| 3 | 1 outlet pilot, CDD live |
| 6 | LTKT auto-submit PPATK, 50 outlet |
| 8 | AI scoring active |
| 9 | 100% outlet, report eksekutif real-time |
| 10 | SaaS/whitelabel ready |

## Risiko Proyek & Mitigasi
| Risiko | Mitigasi |
|---|---|
| DukCapil API instability | Cache local + async retry (Laravel Queue) |
| False positive alert tinggi | Feedback loop analyst → re-tune rules |
| Data migrasi Core Pegadaian | Batch import scheduled, incremental |
| Resistensi outlet | Training + dashboard performa per outlet |
