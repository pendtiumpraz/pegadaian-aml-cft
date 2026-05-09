# AML/CFT — Database Schema

**Stack**: MySQL (dev) / PostgreSQL (prod)  
**Naming**: `snake_case`, `id` BIGINT UNSIGNED PK, semua tabel ada `deleted_at` (SoftDeletes)

---

## Konvensi Global

```sql
-- Semua tabel memiliki:
id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
deleted_at  TIMESTAMP NULL    -- SoftDeletes (Illuminate\Database\Eloquent\SoftDeletes)
```

Soft delete → restore → hard delete tersedia di semua modul via `Trash` view.

---

## 1. `customers` — Master Nasabah

```sql
id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
cif                 VARCHAR(20) UNIQUE NOT NULL              -- CIF-7723014
nik_encrypted       TEXT NOT NULL                             -- AES-256 via Laravel Crypt
name                VARCHAR(255) NOT NULL
dob                 DATE NULL
pob                 VARCHAR(100) NULL                         -- Tempat lahir
gender              ENUM('M','F') NULL
occupation          VARCHAR(255) NULL
income_range        VARCHAR(100) NULL                         -- "Rp 18–25 jt/bln"
source_of_funds     VARCHAR(255) NULL                         -- Gaji, Usaha, dll.
purpose             VARCHAR(255) NULL                         -- Investasi emas, dll.
address             TEXT NULL
domicili_area       VARCHAR(255) NULL
phone               VARCHAR(30) NULL
email               VARCHAR(255) NULL
channel             ENUM('outlet','digital','both') DEFAULT 'outlet'
onboarded_at        TIMESTAMP NULL
onboarded_branch    VARCHAR(255) NULL
pep_flag            BOOLEAN DEFAULT FALSE
pep_tier            TINYINT UNSIGNED NULL                     -- 1 = direct, 2 = relasi
risk_level          ENUM('low','med','high') DEFAULT 'low'
ira_score           TINYINT UNSIGNED DEFAULT 0                -- 0–100
ira_tier            ENUM('rendah','menengah','tinggi') DEFAULT 'rendah'
dukcapil_verified   BOOLEAN DEFAULT FALSE
dukcapil_verified_at TIMESTAMP NULL
biometric_verified  BOOLEAN DEFAULT FALSE
biometric_updated_at TIMESTAMP NULL
cdd_due_date        DATE NULL
status              ENUM('active','suspended','closed') DEFAULT 'active'
created_by          BIGINT UNSIGNED NULL FK users
deleted_at          TIMESTAMP NULL
created_at          TIMESTAMP
updated_at          TIMESTAMP
```
Indexes: `cif`, `nik_encrypted` (partial), `risk_level`, `pep_flag`, `ira_tier`, `status`

---

## 2. `customer_ira_components` — IRA Component Scores

```sql
id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
customer_id     BIGINT UNSIGNED NOT NULL FK customers
scored_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
total_score     TINYINT UNSIGNED NOT NULL              -- 0–100
profil_score    TINYINT UNSIGNED NOT NULL              -- /100, weight 20%
geografi_score  TINYINT UNSIGNED NOT NULL              -- /100, weight 15%
produk_score    TINYINT UNSIGNED NOT NULL              -- /100, weight 25%
pola_tx_score   TINYINT UNSIGNED NOT NULL              -- /100, weight 30%
channel_score   TINYINT UNSIGNED NOT NULL              -- /100, weight 10%
prev_score      TINYINT UNSIGNED NULL                  -- score sebelumnya
delta_score     SMALLINT NULL                          -- delta (bisa negatif)
triggered_rescore BOOLEAN DEFAULT FALSE
rescore_reason  TEXT NULL
scored_by       ENUM('system','manual') DEFAULT 'system'
created_by      BIGINT UNSIGNED NULL FK users
deleted_at      TIMESTAMP NULL
created_at      TIMESTAMP
updated_at      TIMESTAMP
```
Indexes: `customer_id`, `scored_at`, `total_score`

---

## 3. `outlets` — Master Cabang

```sql
id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
code            VARCHAR(20) UNIQUE NOT NULL
name            VARCHAR(255) NOT NULL
city            VARCHAR(100) NOT NULL
region          VARCHAR(100) NOT NULL
province        VARCHAR(100) NOT NULL
type            ENUM('cabang','unit','digital') DEFAULT 'cabang'
is_active       BOOLEAN DEFAULT TRUE
deleted_at      TIMESTAMP NULL
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

---

## 4. `transactions` — Transaksi Nasabah (partitioned monthly)

```sql
id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
txn_id          VARCHAR(30) UNIQUE NOT NULL             -- TX-YYYYMMDDHHMMSSXXXXXX
customer_id     BIGINT UNSIGNED NOT NULL FK customers
cif             VARCHAR(20) NOT NULL                    -- denormalized for performance
outlet_id       BIGINT UNSIGNED NULL FK outlets
channel         ENUM('outlet','digital') NOT NULL
type            ENUM(
                  'gadai_emas','gadai_elektronik','tebus_emas',
                  'tabungan_emas','tunai_ltkt','topup_tab_emas'
                ) NOT NULL
amount          BIGINT NOT NULL                         -- IDR dalam satuan rupiah
txn_time        TIMESTAMP NOT NULL
flagged         BOOLEAN DEFAULT FALSE
flag_tone       ENUM('alert','watch') NULL
risk_score      TINYINT UNSIGNED DEFAULT 0
rules_triggered JSON NULL                               -- ["R-LTKT-01","R-SMURF-04"]
reviewed        BOOLEAN DEFAULT FALSE
reviewed_by     BIGINT UNSIGNED NULL FK users
reviewed_at     TIMESTAMP NULL
counterparty    VARCHAR(255) NULL
notes           TEXT NULL
deleted_at      TIMESTAMP NULL
created_at      TIMESTAMP
updated_at      TIMESTAMP
```
Indexes: `txn_id`, `customer_id`, `cif`, `txn_time`, `type`, `flagged`, `risk_score`  
Note: Partition by `txn_time` monthly untuk production (PostgreSQL range partitioning)

---

## 5. `screening_rules` — Aturan Deteksi

```sql
id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
rule_id         VARCHAR(20) UNIQUE NOT NULL             -- R-LTKT-01
name            VARCHAR(255) NOT NULL
description     TEXT NULL
category        ENUM('LTKT','Anomaly','Risk','Sanctions','PEP') NOT NULL
conditions_json JSON NOT NULL                           -- rule logic
threshold       VARCHAR(255) NULL                       -- human-readable: "> Rp 500jt"
severity        ENUM('low','med','high') DEFAULT 'med'
is_active       BOOLEAN DEFAULT TRUE
version         VARCHAR(20) DEFAULT 'v1.0'
hit_count_30d   INT UNSIGNED DEFAULT 0                  -- cache, updated nightly
fp_rate         TINYINT UNSIGNED DEFAULT 0              -- false positive rate %
created_by      BIGINT UNSIGNED NULL FK users
deleted_at      TIMESTAMP NULL
created_at      TIMESTAMP
updated_at      TIMESTAMP
```
Indexes: `rule_id`, `category`, `is_active`

---

## 6. `alerts` — Alert Transaksi Mencurigakan

```sql
id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
alert_id        VARCHAR(25) UNIQUE NOT NULL             -- ALT-2026-04781
customer_id     BIGINT UNSIGNED NOT NULL FK customers
txn_id          VARCHAR(30) NULL                        -- nullable: alert multi-tx
rule_id         VARCHAR(20) NOT NULL FK screening_rules.rule_id
type            VARCHAR(255) NOT NULL                   -- "Anomali Transaksi"
severity        ENUM('low','med','high') NOT NULL
risk_score      TINYINT UNSIGNED NOT NULL
status          ENUM('baru','triage','investigasi','eskalasi','selesai') DEFAULT 'baru'
priority        ENUM('low','med','high') DEFAULT 'med'
assigned_to     BIGINT UNSIGNED NULL FK users
assigned_at     TIMESTAMP NULL
sla_due_at      TIMESTAMP NULL
factors_json    JSON NULL                               -- trigger factors [{label,value,weight}]
notes           TEXT NULL
closed_at       TIMESTAMP NULL
closed_by       BIGINT UNSIGNED NULL FK users
close_reason    TEXT NULL
source          VARCHAR(255) NULL                       -- "MIS · Anomaly Engine"
deleted_at      TIMESTAMP NULL
created_at      TIMESTAMP
updated_at      TIMESTAMP
```
Indexes: `alert_id`, `customer_id`, `rule_id`, `status`, `priority`, `assigned_to`, `sla_due_at`, `created_at`

---

## 7. `cases` — Investigasi Kasus

```sql
id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
case_id         VARCHAR(25) UNIQUE NOT NULL             -- same as alert_id or derived
alert_id        VARCHAR(25) NOT NULL FK alerts.alert_id
customer_id     BIGINT UNSIGNED NOT NULL FK customers
analyst_id      BIGINT UNSIGNED NOT NULL FK users
approver_id     BIGINT UNSIGNED NULL FK users            -- 4-eyes: analyst ≠ approver
state           ENUM('open','investigating','pending_approval','closed','rejected') DEFAULT 'open'
decision        ENUM('ltkm','dismiss','monitor','escalate') NULL
narrative       TEXT NULL                               -- analyst investigation notes
sla_due_at      TIMESTAMP NULL
escalated_at    TIMESTAMP NULL
escalated_by    BIGINT UNSIGNED NULL FK users
closed_at       TIMESTAMP NULL
deleted_at      TIMESTAMP NULL
created_at      TIMESTAMP
updated_at      TIMESTAMP
```
Indexes: `case_id`, `alert_id`, `customer_id`, `analyst_id`, `state`, `created_at`

---

## 8. `case_activities` — Timeline Kasus

```sql
id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
case_id         BIGINT UNSIGNED NOT NULL FK cases
user_id         BIGINT UNSIGNED NULL FK users           -- NULL = system
type            ENUM('comment','status_change','assignment','escalation','document_added','system') NOT NULL
title           VARCHAR(255) NOT NULL
body            TEXT NULL
tone            ENUM('default','red','green','amber') DEFAULT 'default'
metadata_json   JSON NULL                               -- extra data per event type
deleted_at      TIMESTAMP NULL
created_at      TIMESTAMP
updated_at      TIMESTAMP
```
Indexes: `case_id`, `created_at`

---

## 9. `case_documents` — Dokumen Kasus

```sql
id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
case_id         BIGINT UNSIGNED NOT NULL FK cases
name            VARCHAR(255) NOT NULL
file_path       VARCHAR(500) NOT NULL
file_size       INT UNSIGNED NULL
mime_type       VARCHAR(100) NULL
uploaded_by     BIGINT UNSIGNED NOT NULL FK users
deleted_at      TIMESTAMP NULL
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

---

## 10. `watchlist_sources` — Sumber Watchlist

```sql
id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
name            VARCHAR(100) UNIQUE NOT NULL            -- "DTTOT", "DPPSPM", "OFAC SDN"
display_name    VARCHAR(255) NOT NULL
source_org      VARCHAR(255) NULL                       -- "PPATK / Densus 88"
type            ENUM('DTTOT','DPPSPM','sanctions','PEP','adverse_media') NOT NULL
entry_count     INT UNSIGNED DEFAULT 0
last_synced_at  TIMESTAMP NULL
sync_mode       ENUM('auto','manual') DEFAULT 'auto'
sync_status     ENUM('ok','pending','error') DEFAULT 'ok'
sync_url        VARCHAR(500) NULL
is_active       BOOLEAN DEFAULT TRUE
deleted_at      TIMESTAMP NULL
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

---

## 11. `watchlist_entries` — Entri Watchlist

```sql
id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
source_id       BIGINT UNSIGNED NOT NULL FK watchlist_sources
name            VARCHAR(255) NOT NULL
aliases_json    JSON NULL                               -- array of alias names
dob             DATE NULL
nationality     VARCHAR(100) NULL
id_numbers_json JSON NULL                               -- NIK, passport, etc.
address         TEXT NULL
type            ENUM('individual','entity','vessel') DEFAULT 'individual'
metadata_json   JSON NULL                               -- extra fields per list type
is_active       BOOLEAN DEFAULT TRUE
deleted_at      TIMESTAMP NULL
created_at      TIMESTAMP
updated_at      TIMESTAMP
```
Indexes: `source_id`, `name`, `type`, FULLTEXT `name`

---

## 12. `watchlist_hits` — Hasil Screening

```sql
id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
customer_id     BIGINT UNSIGNED NOT NULL FK customers
watchlist_entry_id BIGINT UNSIGNED NOT NULL FK watchlist_entries
source_id       BIGINT UNSIGNED NOT NULL FK watchlist_sources
confidence      TINYINT UNSIGNED NOT NULL               -- 0–100
match_type      ENUM('nama_dob','nama_parsial','nama_umum','nama_alamat') NOT NULL
action          ENUM('investigasi','review','false_positive') NULL
actioned_by     BIGINT UNSIGNED NULL FK users
actioned_at     TIMESTAMP NULL
notes           TEXT NULL
alert_id        VARCHAR(25) NULL FK alerts.alert_id     -- created from this hit
deleted_at      TIMESTAMP NULL
created_at      TIMESTAMP
updated_at      TIMESTAMP
```
Indexes: `customer_id`, `source_id`, `confidence`, `action`

---

## 13. `watchlist_audit_logs` — Log Sinkronisasi

```sql
id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
source_id       BIGINT UNSIGNED NOT NULL FK watchlist_sources
operation       VARCHAR(255) NOT NULL                   -- "Sinkronisasi otomatis"
delta_added     INT DEFAULT 0
delta_removed   INT DEFAULT 0
actor           VARCHAR(100) DEFAULT 'system'
actor_id        BIGINT UNSIGNED NULL FK users
status          ENUM('ok','error') DEFAULT 'ok'
error_msg       TEXT NULL
deleted_at      TIMESTAMP NULL
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

---

## 14. `edd_cases` — Enhanced Due Diligence

```sql
id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
edd_id          VARCHAR(20) UNIQUE NOT NULL             -- EDD-2026-001
customer_id     BIGINT UNSIGNED NOT NULL FK customers
case_id         BIGINT UNSIGNED NULL FK cases
trigger_reason  VARCHAR(255) NOT NULL
risk_score      TINYINT UNSIGNED NOT NULL
stage           ENUM('trigger','profil','sumber_dana','beneficial_owner','approval') DEFAULT 'trigger'
status          ENUM('antrian','sedang_berjalan','approved','rejected') DEFAULT 'antrian'
analyst_id      BIGINT UNSIGNED NULL FK users
approver_id     BIGINT UNSIGNED NULL FK users
sla_due_at      TIMESTAMP NULL
completed_at    TIMESTAMP NULL
approval_decision TEXT NULL
rejection_reason  TEXT NULL
deleted_at      TIMESTAMP NULL
created_at      TIMESTAMP
updated_at      TIMESTAMP
```
Indexes: `edd_id`, `customer_id`, `stage`, `status`, `analyst_id`

---

## 15. `edd_questionnaire_answers` — Jawaban EDD

```sql
id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
edd_case_id     BIGINT UNSIGNED NOT NULL FK edd_cases
question        VARCHAR(500) NOT NULL
answer          TEXT NULL
status          ENUM('ok','warn') DEFAULT 'ok'
deleted_at      TIMESTAMP NULL
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

---

## 16. `edd_documents` — Dokumen EDD

```sql
id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
edd_case_id     BIGINT UNSIGNED NOT NULL FK edd_cases
name            VARCHAR(255) NOT NULL
file_path       VARCHAR(500) NOT NULL
status          ENUM('pending','accepted','rejected') DEFAULT 'pending'
uploaded_by     BIGINT UNSIGNED NOT NULL FK users
deleted_at      TIMESTAMP NULL
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

---

## 17. `onboarding_applications` — Onboarding CDD Baru

```sql
id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
application_id  VARCHAR(20) UNIQUE NOT NULL
nik_encrypted   TEXT NOT NULL                            -- diinput saat onboarding
name            VARCHAR(255) NOT NULL
dob             DATE NOT NULL
pob             VARCHAR(100) NOT NULL
occupation      VARCHAR(255) NULL
income_range    VARCHAR(100) NULL
source_of_funds VARCHAR(255) NULL
purpose         VARCHAR(255) NULL
channel         ENUM('outlet','digital') NOT NULL
outlet_id       BIGINT UNSIGNED NULL FK outlets
stage           ENUM('input','screening','verifikasi','skoring','persetujuan') DEFAULT 'input'
screening_result JSON NULL                               -- {dttot:ok, dppspm:ok, pep:warn, ...}
dukcapil_verified BOOLEAN DEFAULT FALSE
biometric_verified BOOLEAN DEFAULT FALSE
ira_score       TINYINT UNSIGNED NULL
risk_level      ENUM('low','med','high') NULL
status          ENUM('draft','submitted','approved','rejected','edd_required') DEFAULT 'draft'
processed_by    BIGINT UNSIGNED NULL FK users
customer_id     BIGINT UNSIGNED NULL FK customers        -- created after approval
notes           TEXT NULL
deleted_at      TIMESTAMP NULL
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

---

## 18. `regulatory_reports` — Laporan Regulator

```sql
id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
report_id       VARCHAR(30) UNIQUE NOT NULL
type            ENUM('ltkt_harian','ltkm_insidental','lap_bulanan','lap_triwulanan','lap_semester','lap_tahunan','nasabah_baru','komite') NOT NULL
recipient       ENUM('PPATK','OJK','internal','BRI_Grup','BI') NOT NULL
period_start    DATE NOT NULL
period_end      DATE NOT NULL
item_count      INT UNSIGNED DEFAULT 0
pct_complete    TINYINT UNSIGNED DEFAULT 0              -- 0–100
status          ENUM('todo','draft','review','submitted') DEFAULT 'todo'
xml_payload     LONGTEXT NULL                           -- goAML XML untuk PPATK
file_path       VARCHAR(500) NULL
submitted_at    TIMESTAMP NULL
due_date        DATE NULL
ppatk_receipt   VARCHAR(100) NULL
submission_note TEXT NULL
submitted_by    BIGINT UNSIGNED NULL FK users
deleted_at      TIMESTAMP NULL
created_at      TIMESTAMP
updated_at      TIMESTAMP
```
Indexes: `type`, `recipient`, `status`, `period_start`, `submitted_at`

---

## 19. `ltkm_reports` — Laporan Transaksi Keuangan Mencurigakan

```sql
id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
ltkm_id         VARCHAR(25) UNIQUE NOT NULL             -- LTKM-20260507001
case_id         BIGINT UNSIGNED NULL FK cases
customer_id     BIGINT UNSIGNED NOT NULL FK customers
analyst_id      BIGINT UNSIGNED NOT NULL FK users
approver_id     BIGINT UNSIGNED NULL FK users            -- 4-eyes
status          ENUM('draft','active','review','submitted','rejected') DEFAULT 'draft'
-- Section A: Pelapor
pelapor_pjk     VARCHAR(255) NOT NULL
pelapor_name    VARCHAR(255) NOT NULL
-- Section B: Terlapor
terlapor_name   VARCHAR(255) NOT NULL
terlapor_nik_encrypted TEXT NULL
terlapor_cif    VARCHAR(20) NULL
terlapor_occupation VARCHAR(255) NULL
terlapor_address TEXT NULL
terlapor_phone  VARCHAR(30) NULL
-- Section D: Narasi
narrative       TEXT NULL                               -- Indikasi & Analisis
submitted_at    TIMESTAMP NULL
ppatk_receipt   VARCHAR(100) NULL
type            VARCHAR(255) NOT NULL                   -- Smurfing, DPPSPM, PEP, dll.
deleted_at      TIMESTAMP NULL
created_at      TIMESTAMP
updated_at      TIMESTAMP
```
Indexes: `ltkm_id`, `case_id`, `customer_id`, `analyst_id`, `status`

---

## 20. `ltkm_transactions` — Transaksi dalam LTKM (Section C)

```sql
id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
ltkm_id         BIGINT UNSIGNED NOT NULL FK ltkm_reports
txn_id          VARCHAR(30) NULL FK transactions.txn_id
txn_time        TIMESTAMP NOT NULL
type            VARCHAR(100) NOT NULL
outlet          VARCHAR(255) NULL
amount          BIGINT NOT NULL
rules_triggered JSON NULL                               -- ["R-FREQ-12"]
deleted_at      TIMESTAMP NULL
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

---

## 21. `ltkm_attachments` — Lampiran LTKM

```sql
id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
ltkm_id         BIGINT UNSIGNED NOT NULL FK ltkm_reports
name            VARCHAR(255) NOT NULL
file_path       VARCHAR(500) NOT NULL
upload_status   VARCHAR(100) NULL                       -- "Diunggah · 07/05"
uploaded_by     BIGINT UNSIGNED NOT NULL FK users
deleted_at      TIMESTAMP NULL
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

---

## 22. `training_modules` — Modul Pelatihan

```sql
id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
name            VARCHAR(255) NOT NULL
description     TEXT NULL
audience        VARCHAR(255) NOT NULL                   -- "Semua karyawan", "Frontliner", dll.
duration_minutes INT UNSIGNED DEFAULT 0
status_type     ENUM('wajib','spesialis','rekomendasi') DEFAULT 'wajib'
completion_pct  TINYINT UNSIGNED DEFAULT 0              -- cached, recomputed
is_active       BOOLEAN DEFAULT TRUE
deleted_at      TIMESTAMP NULL
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

---

## 23. `training_completions` — Penyelesaian Pelatihan per User

```sql
id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
module_id       BIGINT UNSIGNED NOT NULL FK training_modules
user_id         BIGINT UNSIGNED NOT NULL FK users
completed_at    TIMESTAMP NOT NULL
score           TINYINT UNSIGNED NULL
certificate_path VARCHAR(500) NULL
deleted_at      TIMESTAMP NULL
created_at      TIMESTAMP
updated_at      TIMESTAMP
```
Unique: `(module_id, user_id)` (jika per attempt: drop unique, add attempt col)

---

## 24. `training_certifications` — Sertifikasi Profesional

```sql
id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
user_id         BIGINT UNSIGNED NOT NULL FK users
certification   VARCHAR(100) NOT NULL                   -- "CAMS · ACAMS"
issued_at       DATE NULL
expires_at      DATE NULL
days_remaining  SMALLINT NULL                           -- computed / cached
status          ENUM('active','expiring','expired') DEFAULT 'active'
deleted_at      TIMESTAMP NULL
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

---

## 25. `awareness_campaigns` — Kampanye Awareness

```sql
id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
title           VARCHAR(255) NOT NULL
channel         VARCHAR(255) NOT NULL                   -- "Email + Poster outlet"
reach_count     INT UNSIGNED DEFAULT 0
status          ENUM('berlangsung','mendatang','selesai') DEFAULT 'mendatang'
ends_at         DATE NULL
created_by      BIGINT UNSIGNED NULL FK users
deleted_at      TIMESTAMP NULL
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

---

## 26. `notifications` — Notifikasi System

```sql
id              CHAR(36) PRIMARY KEY                   -- UUID
user_id         BIGINT UNSIGNED NOT NULL FK users
type            ENUM('alert','deadline','approval','screening','system') NOT NULL
title           VARCHAR(255) NOT NULL
body            TEXT NULL
tone            ENUM('red','amber','blue','green','default') DEFAULT 'default'
is_read         BOOLEAN DEFAULT FALSE
read_at         TIMESTAMP NULL
action_url      VARCHAR(500) NULL
deleted_at      TIMESTAMP NULL
created_at      TIMESTAMP
updated_at      TIMESTAMP
```
Indexes: `user_id`, `is_read`, `type`, `created_at`

---

## 27. `notification_preferences` — Preferensi Notifikasi per User

```sql
id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
user_id         BIGINT UNSIGNED NOT NULL FK users
notification_name VARCHAR(255) NOT NULL
frequency       ENUM('realtime','1_hari','harian_digest','mingguan') DEFAULT 'realtime'
channel_inapp   BOOLEAN DEFAULT TRUE
channel_email   BOOLEAN DEFAULT TRUE
channel_teams   BOOLEAN DEFAULT FALSE
channel_sms     BOOLEAN DEFAULT FALSE
is_enabled      BOOLEAN DEFAULT TRUE
deleted_at      TIMESTAMP NULL
created_at      TIMESTAMP
updated_at      TIMESTAMP
```
Unique: `(user_id, notification_name)`

---

## 28. `ai_patrol_rules` — AI Patrol / Rule Builder

```sql
id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
rule_id         VARCHAR(20) UNIQUE NOT NULL
name            VARCHAR(255) NOT NULL
prompt_text     TEXT NOT NULL                           -- original natural language prompt
generated_sql   TEXT NULL                              -- AI-generated SQL
generated_formula TEXT NULL                            -- AI-generated formula description
step            ENUM('compose','generated','running','results') DEFAULT 'compose'
status          ENUM('draft','active','archived') DEFAULT 'draft'
category        ENUM('LTKT','Anomaly','Risk','Sanctions','PEP') NULL
promoted_to_rule_id VARCHAR(20) NULL FK screening_rules.rule_id
created_by      BIGINT UNSIGNED NOT NULL FK users
deleted_at      TIMESTAMP NULL
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

---

## 29. `data_sources` — Sumber Data untuk AI Patrol

```sql
id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
slug            VARCHAR(100) UNIQUE NOT NULL            -- "core-banking-pegadaian"
name            VARCHAR(255) NOT NULL
type            ENUM('postgresql','mysql','oracle','sql_server','snowflake','bigquery','rest_api') NOT NULL
host            VARCHAR(255) NOT NULL
port            SMALLINT UNSIGNED NOT NULL
database_name   VARCHAR(255) NOT NULL
db_user         VARCHAR(255) NOT NULL
password_vault_ref VARCHAR(255) NULL                   -- Vault ref, bukan plain text
ssl_enabled     BOOLEAN DEFAULT TRUE
validate_view_only BOOLEAN DEFAULT TRUE
auto_discovery  BOOLEAN DEFAULT TRUE
table_count     INT UNSIGNED DEFAULT 0
latency_ms      SMALLINT UNSIGNED NULL
status          ENUM('ok','warn','error') DEFAULT 'ok'
is_primary      BOOLEAN DEFAULT FALSE
last_scanned_at TIMESTAMP NULL
notes           TEXT NULL
created_by      BIGINT UNSIGNED NOT NULL FK users
deleted_at      TIMESTAMP NULL
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

---

## 30. `data_source_tables` — Discovery Tabel dari Sumber Data

```sql
id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
data_source_id  BIGINT UNSIGNED NOT NULL FK data_sources
schema_name     VARCHAR(100) NULL
table_name      VARCHAR(255) NOT NULL
row_count       BIGINT UNSIGNED DEFAULT 0
column_count    SMALLINT UNSIGNED DEFAULT 0
sample_columns  JSON NULL                              -- ["cif","txn_time","amount",...]
pii_column_count TINYINT UNSIGNED DEFAULT 0
is_used_in_patrol BOOLEAN DEFAULT FALSE
deleted_at      TIMESTAMP NULL
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

---

## 31. `patrol_executions` — Riwayat Eksekusi Patrol

```sql
id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
patrol_rule_id  BIGINT UNSIGNED NOT NULL FK ai_patrol_rules
data_source_id  BIGINT UNSIGNED NOT NULL FK data_sources
executed_by     BIGINT UNSIGNED NOT NULL FK users
started_at      TIMESTAMP NOT NULL
finished_at     TIMESTAMP NULL
duration_seconds DECIMAL(6,2) NULL
data_scanned_gb DECIMAL(6,2) NULL
hit_count       INT UNSIGNED DEFAULT 0
promoted_count  INT UNSIGNED DEFAULT 0
status          ENUM('running','ok','error','timeout') DEFAULT 'running'
error_msg       TEXT NULL
deleted_at      TIMESTAMP NULL
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

---

## 32. `patrol_results` — Hasil Eksekusi Patrol

```sql
id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
execution_id    BIGINT UNSIGNED NOT NULL FK patrol_executions
customer_id     BIGINT UNSIGNED NOT NULL FK customers
txn_date        DATE NULL
gadai_amount    BIGINT NULL
tebus_amount    BIGINT NULL
outlet_count    TINYINT UNSIGNED NULL
ira_score       TINYINT UNSIGNED NULL
is_promoted     BOOLEAN DEFAULT FALSE
promoted_to_alert_id VARCHAR(25) NULL FK alerts.alert_id
promoted_by     BIGINT UNSIGNED NULL FK users
deleted_at      TIMESTAMP NULL
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

---

## 33. `users` — Pengguna Aplikasi (linked to Portal SSO)

```sql
id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
portal_user_id  BIGINT UNSIGNED NOT NULL UNIQUE        -- ID dari Portal SSO
name            VARCHAR(255) NOT NULL
email           VARCHAR(255) NOT NULL UNIQUE
avatar_initials VARCHAR(5) NULL                        -- "YP"
role            VARCHAR(100) NULL                      -- cached dari Portal
job_title       VARCHAR(255) NULL                      -- "AML/CFT Specialist"
is_active       BOOLEAN DEFAULT TRUE
last_seen_at    TIMESTAMP NULL
deleted_at      TIMESTAMP NULL
created_at      TIMESTAMP
updated_at      TIMESTAMP
```
Roles (via Spatie Permission): `head_amlcft`, `amlcft_specialist`, `amlcft_analyst`, `reporting_officer`, `auditor`

---

## 34. `system_settings`

```sql
id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
key             VARCHAR(255) UNIQUE NOT NULL
value           TEXT NULL
type            ENUM('string','boolean','integer','json') DEFAULT 'string'
group           VARCHAR(100) NULL                      -- "ira_model","integrations","sla"
description     TEXT NULL
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

---

## 35. `integration_logs` — Log Integrasi Eksternal

```sql
id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
integration     ENUM('ppatk','dukcapil','ojk','bi','core_pegadaian','igracias','idesk','ai_api') NOT NULL
operation       VARCHAR(255) NOT NULL
request_json    JSON NULL
response_json   JSON NULL
status          ENUM('ok','error') DEFAULT 'ok'
duration_ms     INT UNSIGNED NULL
error_msg       TEXT NULL
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

---

## 36. `model_ira_configs` — Konfigurasi Model IRA

```sql
id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
version         VARCHAR(20) NOT NULL                   -- "v3.2"
algorithm       VARCHAR(255) NOT NULL                  -- "Gradient boosted (15 fitur)"
auc             DECIMAL(4,3) NULL                      -- 0.xxx
precision_at_70 DECIMAL(4,3) NULL
recall_at_70    DECIMAL(4,3) NULL
fp_rate         TINYINT UNSIGNED NULL
retrain_schedule VARCHAR(255) NULL                     -- "Bulanan · jadwal 15"
weight_profil   TINYINT UNSIGNED DEFAULT 20            -- 20%
weight_geografi TINYINT UNSIGNED DEFAULT 15
weight_produk   TINYINT UNSIGNED DEFAULT 25
weight_pola_tx  TINYINT UNSIGNED DEFAULT 30
weight_channel  TINYINT UNSIGNED DEFAULT 10
is_active       BOOLEAN DEFAULT TRUE
activated_at    TIMESTAMP NULL
created_by      BIGINT UNSIGNED NULL FK users
deleted_at      TIMESTAMP NULL
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

---

## Diagram Relasi (Ringkas)

```
customers ──< transactions (many)
customers ──< alerts (many)
customers ──< watchlist_hits (many)
customers ──< edd_cases (many)
customers ──< customer_ira_components (many, history)
customers ──< ltkm_reports (many)

transactions >── alerts (optional, one alert per tx)
alerts >── cases (one-to-one, when escalated)
cases ──< case_activities (many)
cases ──< case_documents (many)
cases >── ltkm_reports (optional)

watchlist_sources ──< watchlist_entries (many)
watchlist_entries ──< watchlist_hits (many)

screening_rules ──< alerts (many, via rule_id)

edd_cases ──< edd_questionnaire_answers (many)
edd_cases ──< edd_documents (many)

ltkm_reports ──< ltkm_transactions (many)
ltkm_reports ──< ltkm_attachments (many)

ai_patrol_rules ──< patrol_executions (many)
patrol_executions ──< patrol_results (many)
data_sources ──< data_source_tables (many)
data_sources ──< patrol_executions (many)

training_modules ──< training_completions (many)
users ──< training_completions (many)

users ──< notifications (many)
users ──< notification_preferences (many)
```

---

## Soft Delete & Trash Policy

| Table | Soft Delete | Trash View | Restore | Hard Delete |
|---|---|---|---|---|
| customers | ✓ | ✓ | ✓ | ✓ (super admin) |
| transactions | ✓ | ✓ | ✓ | ✓ (super admin) |
| alerts | ✓ | ✓ | ✓ | ✓ |
| cases | ✓ | ✓ | ✓ | ✓ |
| watchlist_sources | ✓ | ✓ | ✓ | ✓ |
| watchlist_entries | ✓ | ✓ | ✓ | ✓ |
| watchlist_hits | ✓ | ✓ | ✓ | ✓ |
| screening_rules | ✓ | ✓ | ✓ | ✓ |
| edd_cases | ✓ | ✓ | ✓ | ✓ |
| ltkm_reports | ✓ | ✓ | ✓ | ✓ |
| regulatory_reports | ✓ | ✓ | ✓ | ✓ |
| onboarding_applications | ✓ | ✓ | ✓ | ✓ |
| ai_patrol_rules | ✓ | ✓ | ✓ | ✓ |
| data_sources | ✓ | ✓ | ✓ | ✓ |
| training_modules | ✓ | ✓ | ✓ | ✓ |
| users | ✓ | ✓ | ✓ | ✓ |

Data regulasi (ltkm, regulatory_reports): hard delete hanya super admin, retensi 10 tahun.
