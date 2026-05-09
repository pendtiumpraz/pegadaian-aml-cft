# App 1 — AML/CFT System (Pegadaian)

## 1. Tujuan
Mengelola kebijakan dan operasional fungsi kerja **APU, PPT, dan PPPSPM** — mencakup CDD, EDD, pemantauan transaksi, dan pelaporan regulator (PPATK, OJK, BI) — untuk **31 juta nasabah** dan **~300.000 transaksi/hari**.

## 2. Domain Bisnis
```
Outlet/Digital → [1] Onboarding → [2] CDD Screening → [3] EDD & Monitoring → [4] Reporting → [5] Lap. Penerapan
```
- **[1] Onboarding**: input profil & transaksi nasabah (outlet & digital channel)
- **[2] CDD**: screening DTTOT/DPPSPM/Tindak Pidana, verifikasi DukCapil, scoring risiko, IRA
- **[3] EDD & Pemantauan**: MIS dashboard, deteksi anomali, analisis lanjutan
- **[4] Pelaporan**: PPATK (LTKT harian, LTKM insidental), OJK & BI
- **[5] Laporan Penerapan**: Dekom/Direksi, KPR, BRI Kepatuhan, KTKT, OJK/BI

## 3. Modul Aplikasi

| Modul | Fungsi Inti |
|---|---|
| **Customer Management** | Master nasabah + profil risiko APU-PPT + IRA score |
| **CDD Engine** | Screening list (DTTOT/DPPSPM/PEP/sanctions) + fuzzy match + DukCapil |
| **Transaction Monitoring** | Rules engine (configurable PHP) + AI anomaly hint + case management |
| **EDD Workflow** | Escalation, assignment, analyst investigation notebook |
| **Regulatory Reporting** | LTKT, LTKM, TPP, Nasabah Baru → XML goAML PPATK |
| **Watchlist Manager** | Auto-sync DTTOT, DPPSPM, sanctions list (UN, OFAC) |
| **Dashboard & MIS** | KPI, Risk heatmap, trending, drill-down |
| **Reporting Internal** | Template bulanan/triwulanan/semester/tahunan |
| **Admin & Audit** | Role matrix, audit log immutable, 4-eyes approval |

## 4. Arsitektur (Laravel + Inertia + React)

```
┌──────────────────────────────────────────────────┐
│            WEB APP (Inertia + React)              │
│  Dashboard │ CDD Form │ Case │ Reports │ Admin   │
└────────────────────┬─────────────────────────────┘
                     │ SSO Token (Portal)
                     ▼
┌──────────────────────────────────────────────────┐
│              LARAVEL APPLICATION                  │
│                                                   │
│  Services: Customer, Screening, Case, Alert,     │
│            Report, Watchlist, AI, DukCapil, PPATK │
│                                                   │
│  Routes: /web (Inertia) + /api/v1 (REST)         │
│  Queue Workers: batch screening, report gen       │
│  Stancl/Tenancy: multi-DB per tenant, BYODB      │
└──────┬────────────────┬──────────────────────────┘
       │                │
┌──────▼──────┐  ┌──────▼──────┐
│ PostgreSQL  │  │   Redis     │
│ (per tenant)│  │ cache/queue │
└─────────────┘  └─────────────┘
```

**Integrations**: Portal SSO, DukCapil, PPATK goAML (SFTP), OJK/BNPT, Core Pegadaian, i-GRaCiaS (API), AI API, S3/MinIO (BYOS)

## 5. Data Model (ringkas)
- `customer(id, nik_encrypted, name, pep_flag, risk_score, ira_tier)`
- `transaction(id, customer_id, amount, channel, outlet_id, ts)` — **partitioned monthly**
- `alert(id, customer_id, tx_id, rule_id, severity, status, assigned_to)`
- `case(id, alert_ids, analyst_id, state, decision, narrative, sla_ts)`
- `watchlist_entry(id, list_type, name, dob, nationality, source)`
- `regulatory_report(id, type, period, xml_payload, submitted_at, ppatk_ack)`
- `screening_rule(id, name, conditions_json, severity, active)`
- `audit_log(...)` — Spatie Activity Log, immutable

## 6. Non-Functional Requirements

| Aspek | Target |
|---|---|
| Throughput TM | **300k tx/hari**, burst 100 tx/detik |
| Latency screening | p95 < 500 ms |
| Availability | 99.9% |
| RPO/RTO | RPO 15 menit / RTO 1 jam |
| Retensi data | 10 tahun (kewajiban APU-PPT) |
| Audit trail | Immutable (Spatie Activity Log) |
| Compliance | OJK POJK 8/2023, UU PDP, SEOJK 29/2022 |

## 7. Security
- **SSO** via Portal (OAuth2 token)
- **PII encryption** at rest (Laravel Crypt, NIK encrypted)
- **4-eyes approval** untuk closing LTKM
- **Segregation of duties**: Analyst ≠ Approver ≠ Admin (Spatie Permission)
- **Masking** NIK & nominal untuk role non-privileged
- **Tenant data isolation** — database-level via Stancl/Tenancy

## 8. Integrasi Eksternal
1. **Portal** — SSO, tenant config, BYODB/BYOS
2. **DukCapil** — verifikasi NIK (HTTP Client + retry)
3. **PPATK goAML** — submit XML via SFTP
4. **OJK/BNPT** — daily refresh watchlist
5. **Core Pegadaian** — transaksi (API/batch)
6. **i-GRaCiaS** — compliance signals (internal API)
7. **iDesk** — procedure reference (internal API)
8. **AI API** — risk scoring, anomaly hints (OpenAI/Gemini/Claude)

## 9. Rules Engine (Laravel-native)
Database-driven rules + PHP evaluator. Tidak perlu Drools/Flink.
300k tx/hari (~3.5 tx/detik) → Laravel Queue + Redis lebih dari cukup.
