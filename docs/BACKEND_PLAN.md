# AML/CFT — Backend Implementation Plan

Stack: Laravel 12 + Inertia.js + React 18 + MySQL (dev) / PostgreSQL (prod)  
Port dev: `http://localhost:8001`  
Auth: SSO via Portal OAuth2 (Laravel Passport token validation)

---

## 1. Composer Packages

```json
{
  "require": {
    "inertiajs/inertia-laravel": "^3.1",
    "spatie/laravel-permission": "^6.0",
    "spatie/laravel-activitylog": "^4.0",
    "spatie/laravel-data": "^4.0",
    "maatwebsite/excel": "^3.1",
    "barryvdh/laravel-dompdf": "^3.0",
    "guzzlehttp/guzzle": "^7.0"
  },
  "require-dev": {
    "fakerphp/faker": "^1.23",
    "laravel/pint": "^2.0",
    "phpunit/phpunit": "^11.0"
  }
}
```

---

## 2. Eloquent Models

Semua model menggunakan:
- `use SoftDeletes;` (dari `Illuminate\Database\Eloquent\SoftDeletes`)
- `use HasFactory;`
- `use LogsActivity;` (Spatie Activity Log)

| Model | File | Traits | Key Relations |
|---|---|---|---|
| `Customer` | `app/Models/Customer.php` | SoftDeletes, HasFactory, LogsActivity | hasMany(Transaction), hasMany(Alert), hasMany(IraComponent), hasMany(WatchlistHit), hasMany(EddCase), hasMany(LtkmReport), hasOne(OnboardingApplication) |
| `CustomerIraComponent` | | SoftDeletes | belongsTo(Customer) |
| `Outlet` | | SoftDeletes | hasMany(Transaction) |
| `Transaction` | | SoftDeletes | belongsTo(Customer), belongsTo(Outlet), hasMany(Alert) |
| `ScreeningRule` | | SoftDeletes | hasMany(Alert) |
| `Alert` | | SoftDeletes | belongsTo(Customer), belongsTo(ScreeningRule), hasOne(Case_) |
| `Case_` | `app/Models/Case.php` | SoftDeletes | belongsTo(Alert), belongsTo(Customer), hasMany(CaseActivity), hasMany(CaseDocument), hasOne(LtkmReport) |
| `CaseActivity` | | SoftDeletes | belongsTo(Case_) |
| `CaseDocument` | | SoftDeletes | belongsTo(Case_) |
| `WatchlistSource` | | SoftDeletes | hasMany(WatchlistEntry), hasMany(WatchlistAuditLog) |
| `WatchlistEntry` | | SoftDeletes | belongsTo(WatchlistSource), hasMany(WatchlistHit) |
| `WatchlistHit` | | SoftDeletes | belongsTo(Customer), belongsTo(WatchlistEntry) |
| `WatchlistAuditLog` | | SoftDeletes | belongsTo(WatchlistSource) |
| `EddCase` | | SoftDeletes | belongsTo(Customer), belongsTo(Case_), hasMany(EddAnswer), hasMany(EddDocument) |
| `EddAnswer` | | SoftDeletes | belongsTo(EddCase) |
| `EddDocument` | | SoftDeletes | belongsTo(EddCase) |
| `OnboardingApplication` | | SoftDeletes | belongsTo(Customer) |
| `RegulatoryReport` | | SoftDeletes | belongsTo(User) |
| `LtkmReport` | | SoftDeletes | belongsTo(Customer), belongsTo(Case_), belongsTo(User), hasMany(LtkmTransaction), hasMany(LtkmAttachment) |
| `LtkmTransaction` | | SoftDeletes | belongsTo(LtkmReport) |
| `LtkmAttachment` | | SoftDeletes | belongsTo(LtkmReport) |
| `TrainingModule` | | SoftDeletes | hasMany(TrainingCompletion) |
| `TrainingCompletion` | | SoftDeletes | belongsTo(TrainingModule), belongsTo(User) |
| `TrainingCertification` | | SoftDeletes | belongsTo(User) |
| `AwarenessCampaign` | | SoftDeletes | |
| `Notification` | | SoftDeletes | belongsTo(User) |
| `NotificationPreference` | | SoftDeletes | belongsTo(User) |
| `AiPatrolRule` | | SoftDeletes | hasMany(PatrolExecution), belongsTo(User) |
| `DataSource` | | SoftDeletes | hasMany(DataSourceTable), hasMany(PatrolExecution) |
| `DataSourceTable` | | SoftDeletes | belongsTo(DataSource) |
| `PatrolExecution` | | SoftDeletes | belongsTo(AiPatrolRule), belongsTo(DataSource), hasMany(PatrolResult) |
| `PatrolResult` | | SoftDeletes | belongsTo(PatrolExecution), belongsTo(Customer) |
| `User` | | SoftDeletes | hasMany(Alert), hasMany(Case_), hasMany(Notification) |
| `ModelIraConfig` | | SoftDeletes | |
| `SystemSetting` | | — | |
| `IntegrationLog` | | — | |

---

## 3. Routes (`routes/web.php`)

### Pola Trash/Restore (berlaku semua resource)
```php
Route::prefix('{resource}')->group(function() {
    Route::get('trash',            'trash')        ->name('{resource}.trash');
    Route::post('{id}/restore',    'restore')      ->name('{resource}.restore');
    Route::delete('{id}/force',    'forceDelete')  ->name('{resource}.force-delete');
});
```

### Full Route Map

```php
// Dashboard
GET /dashboard                                  → DashboardController@index

// Cases (Manajemen Kasus)
GET    /cases                                   → CaseController@index
GET    /cases/trash                             → CaseController@trash
GET    /cases/{case}                            → CaseController@show
POST   /cases                                   → CaseController@store
PUT    /cases/{case}                            → CaseController@update
DELETE /cases/{case}                            → CaseController@destroy
POST   /cases/{case}/restore                    → CaseController@restore
DELETE /cases/{case}/force                      → CaseController@forceDelete
POST   /cases/{case}/assign                     → CaseController@assign
POST   /cases/{case}/close                      → CaseController@close
POST   /cases/{case}/escalate                   → CaseController@escalate
POST   /cases/{case}/activities                 → CaseActivityController@store
POST   /cases/{case}/documents                  → CaseDocumentController@store
DELETE /cases/{case}/documents/{doc}            → CaseDocumentController@destroy

// Transactions (Pemantauan Transaksi)
GET    /transactions                            → TransactionController@index
GET    /transactions/trash                      → TransactionController@trash
GET    /transactions/{txn}                      → TransactionController@show
POST   /transactions/{txn}/review               → TransactionController@review
POST   /transactions/{txn}/restore              → TransactionController@restore
DELETE /transactions/{txn}/force                → TransactionController@forceDelete

// AI Patrol & Rule Builder
GET    /patrol                                  → PatrolController@index
GET    /patrol/trash                            → PatrolController@trash
POST   /patrol/rules                            → PatrolController@storeRule
PUT    /patrol/rules/{rule}                     → PatrolController@updateRule
DELETE /patrol/rules/{rule}                     → PatrolController@destroyRule
POST   /patrol/rules/{rule}/restore             → PatrolController@restoreRule
DELETE /patrol/rules/{rule}/force               → PatrolController@forceDeleteRule
POST   /patrol/rules/{rule}/execute             → PatrolController@execute
POST   /patrol/rules/{rule}/promote             → PatrolController@promote
GET    /patrol/executions                       → PatrolController@executions
GET    /patrol/executions/{exec}/results        → PatrolController@results
POST   /patrol/data-sources                     → DataSourceController@store
PUT    /patrol/data-sources/{src}               → DataSourceController@update
DELETE /patrol/data-sources/{src}               → DataSourceController@destroy
POST   /patrol/data-sources/{src}/test          → DataSourceController@test
POST   /patrol/data-sources/{src}/discover      → DataSourceController@discover

// Screening DTTOT/DPPSPM
GET    /screening                               → ScreeningController@index
GET    /screening/trash                         → ScreeningController@trash
GET    /screening/sources                       → ScreeningController@sources
POST   /screening/sources/{src}/sync            → ScreeningController@sync
GET    /screening/hits                          → ScreeningController@hits
POST   /screening/hits/{hit}/action             → ScreeningController@action
GET    /screening/rules                         → ScreeningController@rules
POST   /screening/rules                         → ScreeningController@storeRule
PUT    /screening/rules/{rule}                  → ScreeningController@updateRule
DELETE /screening/rules/{rule}                  → ScreeningController@destroyRule

// Onboarding & CDD
GET    /onboarding                              → OnboardingController@index
GET    /onboarding/trash                        → OnboardingController@trash
POST   /onboarding                              → OnboardingController@store
GET    /onboarding/{app}                        → OnboardingController@show
PUT    /onboarding/{app}                        → OnboardingController@update
DELETE /onboarding/{app}                        → OnboardingController@destroy
POST   /onboarding/{app}/restore                → OnboardingController@restore
DELETE /onboarding/{app}/force                  → OnboardingController@forceDelete
POST   /onboarding/{app}/approve                → OnboardingController@approve
POST   /onboarding/{app}/reject                 → OnboardingController@reject
POST   /onboarding/{app}/verify-dukcapil        → OnboardingController@verifyDukcapil
POST   /onboarding/{app}/screen                 → OnboardingController@screen
POST   /onboarding/{app}/score-ira              → OnboardingController@scoreIra

// EDD - Enhanced Due Diligence
GET    /edd                                     → EddController@index
GET    /edd/trash                               → EddController@trash
GET    /edd/{edd}                               → EddController@show
POST   /edd                                     → EddController@store
PUT    /edd/{edd}                               → EddController@update
DELETE /edd/{edd}                               → EddController@destroy
POST   /edd/{edd}/restore                       → EddController@restore
DELETE /edd/{edd}/force                         → EddController@forceDelete
POST   /edd/{edd}/advance                       → EddController@advance
POST   /edd/{edd}/approve                       → EddController@approve
POST   /edd/{edd}/reject                        → EddController@reject
POST   /edd/{edd}/documents                     → EddController@storeDocument
POST   /edd/{edd}/answers                       → EddController@storeAnswer

// Customer 360 / IRA
GET    /customers                               → CustomerController@index
GET    /customers/trash                         → CustomerController@trash
GET    /customers/{customer}                    → CustomerController@show
POST   /customers                               → CustomerController@store
PUT    /customers/{customer}                    → CustomerController@update
DELETE /customers/{customer}                    → CustomerController@destroy
POST   /customers/{customer}/restore            → CustomerController@restore
DELETE /customers/{customer}/force              → CustomerController@forceDelete
POST   /customers/{customer}/rescore            → CustomerController@rescore
GET    /customers/{customer}/transactions       → CustomerController@transactions
GET    /customers/{customer}/alerts             → CustomerController@alerts
GET    /customers/{customer}/cases              → CustomerController@cases

// Regulatory Reporting
GET    /reporting                               → ReportingController@index
GET    /reporting/trash                         → ReportingController@trash
GET    /reporting/{report}                      → ReportingController@show
POST   /reporting                               → ReportingController@store
PUT    /reporting/{report}                      → ReportingController@update
DELETE /reporting/{report}                      → ReportingController@destroy
POST   /reporting/{report}/restore             → ReportingController@restore
DELETE /reporting/{report}/force               → ReportingController@forceDelete
POST   /reporting/{report}/submit              → ReportingController@submit
GET    /reporting/{report}/download            → ReportingController@download
POST   /reporting/{report}/generate-xml        → ReportingController@generateXml

// LTKM Workspace
GET    /ltkm                                    → LtkmController@index
GET    /ltkm/trash                              → LtkmController@trash
GET    /ltkm/{ltkm}                             → LtkmController@show
POST   /ltkm                                    → LtkmController@store
PUT    /ltkm/{ltkm}                             → LtkmController@update
DELETE /ltkm/{ltkm}                             → LtkmController@destroy
POST   /ltkm/{ltkm}/restore                     → LtkmController@restore
DELETE /ltkm/{ltkm}/force                       → LtkmController@forceDelete
POST   /ltkm/{ltkm}/submit                      → LtkmController@submit
POST   /ltkm/{ltkm}/transactions                → LtkmController@addTransaction
DELETE /ltkm/{ltkm}/transactions/{tx}           → LtkmController@removeTransaction
POST   /ltkm/{ltkm}/attachments                 → LtkmController@uploadAttachment
DELETE /ltkm/{ltkm}/attachments/{att}           → LtkmController@removeAttachment

// Training & Awareness
GET    /training                                → TrainingController@index
GET    /training/trash                          → TrainingController@trash
GET    /training/modules/{module}               → TrainingController@showModule
POST   /training/modules                        → TrainingController@storeModule
PUT    /training/modules/{module}               → TrainingController@updateModule
DELETE /training/modules/{module}               → TrainingController@destroyModule
POST   /training/modules/{module}/restore       → TrainingController@restoreModule
DELETE /training/modules/{module}/force         → TrainingController@forceDeleteModule

// Notifications
GET    /notifications                           → NotificationController@index
POST   /notifications/mark-read                 → NotificationController@markRead
POST   /notifications/{notif}/read              → NotificationController@markOneRead
DELETE /notifications/{notif}                   → NotificationController@destroy
GET    /notifications/preferences               → NotificationController@preferences
POST   /notifications/preferences               → NotificationController@updatePreferences

// Admin & Governance
GET    /admin                                   → AdminController@index
GET    /admin/rules                             → AdminController@rules
POST   /admin/rules                             → AdminController@storeRule
PUT    /admin/rules/{rule}                      → AdminController@updateRule
DELETE /admin/rules/{rule}                      → AdminController@destroyRule
GET    /admin/users                             → AdminController@users
GET    /admin/audit-log                         → AdminController@auditLog
GET    /admin/integrations                      → AdminController@integrations
GET    /admin/ira-config                        → AdminController@iraConfig
POST   /admin/ira-config                        → AdminController@updateIraConfig

// Settings
GET    /settings                                → SettingController@index
POST   /settings                                → SettingController@update

// API (untuk integrasi cross-app)
POST   /api/v1/auth/validate-token             → Api\TokenController@validate
GET    /api/v1/customers/{cif}/risk            → Api\CustomerApiController@risk
POST   /api/v1/alerts                          → Api\AlertApiController@store
```

---

## 4. Service Layer (`app/Services/`)

| Service | Tanggung Jawab |
|---|---|
| `CustomerService` | CRUD customer, NIK encryption/decryption, IRA scoring trigger |
| `IraScoreService` | Hitung IRA score dari 5 komponen, simpan history |
| `ScreeningService` | Fuzzy match terhadap watchlist, generate alert, update hit |
| `WatchlistSyncService` | Pull watchlist dari sumber eksternal (PPATK, OFAC, dll.) |
| `TransactionService` | Import transaksi, evaluasi rules, flag transaksi |
| `RulesEngineService` | Evaluasi `conditions_json` dari `screening_rules` terhadap transaksi |
| `AlertService` | Create/update/close alert, assign, set SLA |
| `CaseService` | Create case dari alert, workflow state, 4-eyes approval |
| `EddService` | Workflow EDD per stage, dokumen, approval |
| `OnboardingService` | Step-by-step onboarding (5 tahap), DukCapil verify, IRA score |
| `LtkmService` | Buat draft LTKM dari case, 4-eyes approval, generate XML goAML |
| `RegulatoryReportService` | Generate report (LTKT harian, dll.), submit ke PPATK/OJK |
| `AiPatrolService` | Natural language → SQL via AI API, eksekusi read-only, promote ke case |
| `DataSourceService` | Test koneksi, discover schema, sync tables |
| `TrainingService` | Completion tracking, sertifikasi expiry, awareness campaigns |
| `NotificationService` | Create dan deliver notifikasi per channel (in-app, email, Teams, SMS) |
| `DukcapilService` | HTTP Client ke DukCapil API, retry logic, cache |
| `AiApiService` | HTTP Client ke OpenAI/Gemini/Claude (risk scoring, anomaly hints) |
| `PpatकService` | Generate goAML XML, SFTP submit ke PPATK |
| `SlaService` | Hitung dan monitor SLA per alert/case/EDD, kirim notif overdue |

---

## 5. Middleware

| Middleware | Fungsi |
|---|---|
| `HandleInertiaRequests` | Share auth user, flash, notif count ke semua page |
| `ValidatePortalToken` | Validasi OAuth2 token dari Portal sebelum request |
| `EnsureUserIsActive` | Block user yang di-suspend |
| `RequirePermission` | RBAC check per route (Spatie Permission) |

---

## 6. Inertia Pages (`resources/js/Pages/`)

```
Pages/
├── Dashboard.jsx                  # KPIs, alert queue, deadlines, charts
├── Cases/
│   ├── Index.jsx                  # List + filter toolbar
│   ├── Show.jsx                   # Detail: timeline, dokumen, factors
│   └── Trash.jsx                  # Soft-deleted cases
├── Transactions/
│   ├── Index.jsx                  # Filter: tipe, aturan, skor, status, outlet
│   └── Trash.jsx
├── Patrol/
│   ├── Index.jsx                  # Rule builder + data sources + history
│   └── Trash.jsx
├── Screening/
│   ├── Index.jsx                  # Watchlist sources + hits + audit log
│   └── Trash.jsx
├── Onboarding/
│   ├── Index.jsx                  # Antrian onboarding
│   ├── Create.jsx                 # 5-step stepper
│   ├── Show.jsx                   # Detail + IRA score
│   └── Trash.jsx
├── Edd/
│   ├── Index.jsx                  # EDD queue: antrian, running, approved, rejected
│   ├── Show.jsx                   # Detail: stepper, questionnaire, dokumen, approval
│   └── Trash.jsx
├── Customer/
│   ├── Index.jsx                  # Search + filter nasabah
│   ├── Show.jsx                   # Customer 360: profil, IRA, tx history, alerts
│   └── Trash.jsx
├── Reporting/
│   ├── Index.jsx                  # Pipeline + submission history
│   ├── Show.jsx                   # Detail report
│   └── Trash.jsx
├── Ltkm/
│   ├── Index.jsx                  # Draft list
│   ├── Show.jsx                   # 5-section LTKM form: A, B, C, D, E
│   └── Trash.jsx
├── Training/
│   ├── Index.jsx                  # Module list + certifications + campaigns
│   └── Trash.jsx
├── Notifications/
│   └── Index.jsx                  # List + preferences
└── Admin/
    └── Index.jsx                  # Rules, roles, users, audit, IRA config, integrations
```

---

## 7. Shared Components (`resources/js/Components/`)

```
Components/
├── UI/
│   ├── Icons.jsx             # Semua icon SVG (dari reference design)
│   ├── Tag.jsx               # tone: green|amber|red|blue|violet|default
│   ├── RiskPill.jsx          # level: low|med|high
│   ├── Risk.jsx              # Score bar + number
│   ├── Status.jsx            # Dot + label: ok|warn|err|muted
│   ├── KPI.jsx               # KPI card dengan spark + delta
│   ├── Spark.jsx             # Mini sparkline bar chart
│   ├── Donut.jsx             # Donut/pie chart SVG
│   ├── SlaBar.jsx            # Progress bar dengan tone
│   ├── Badge.jsx             # Count badge
│   └── Stepper.jsx           # Multi-step progress
├── Table/
│   ├── DataTable.jsx         # Table dengan sorting, sticky header
│   ├── Toolbar.jsx           # Filter toolbar (field + select + spacer)
│   └── Pagination.jsx
├── Form/
│   ├── Field.jsx             # Label + input wrapper
│   ├── TextInput.jsx
│   ├── SelectInput.jsx
│   ├── Textarea.jsx
│   ├── DateInput.jsx
│   ├── FileUpload.jsx        # Drag & drop
│   └── Toggle.jsx
├── Modal/
│   ├── Modal.jsx             # Base modal
│   └── ConfirmDelete.jsx     # Konfirmasi sebelum delete
├── Layout/
│   ├── AppLayout.jsx         # Sidebar + Topbar wrapper
│   ├── Sidebar.jsx           # Nav dengan section + badge + active
│   └── Topbar.jsx            # Breadcrumbs + search + actions
└── Shared/
    ├── Alert.jsx             # Flash message (success/error)
    └── EmptyState.jsx        # Empty list placeholder
```

---

## 8. Design System (`resources/css/app.css`)

Menggunakan design tokens persis dari reference design:
- **Brand color**: `oklch(0.40 0.08 155)` — deep forest green
- **Font**: Inter (sans), JetBrains Mono (mono)
- **Radius**: 6px card, 10px large card
- **Topbar height**: 56px, Sidebar width: 232px
- **Dark mode**: via `[data-theme="dark"]` on `<html>`
- **Density**: CSS variable `--density: 1` (overridable)

CSS variables, komponen CSS (table, card, btn, tag, kpi, spark, donut, bar, stepper, deadline, dll.) diimport dari `resources/css/app.css` berdasarkan 1:1 dari reference `styles.css`.

---

## 9. Security

- **NIK encryption**: `encrypt()`/`decrypt()` via Laravel Crypt (AES-256-CBC)
- **NIK masking**: custom accessor `getMaskedNikAttribute()` — tampil sebagai `****4321` untuk non-privileged roles
- **PII dalam query**: Hanya role `amlcft_specialist`, `head_amlcft`, `reporting_officer` yang bisa lihat NIK full
- **4-eyes approval**: LTKM dan closing case butuh `analyst_id ≠ approver_id` — enforced di service layer
- **Separation of duties**: Analyst ≠ Approver ≠ Admin — enforced via Spatie Permission
- **Audit trail**: Semua create/update/delete via Spatie Activity Log (immutable, 10 tahun)
- **Rate limiting**: `/api/*` → 60 req/menit per IP

---

## 10. Queue Jobs (`app/Jobs/`)

| Job | Trigger | Queue |
|---|---|---|
| `ScreenTransactionJob` | New transaction created | `screening` |
| `SyncWatchlistJob` | Schedule daily atau manual | `watchlist` |
| `GenerateLtktReportJob` | Schedule harian 14:00 | `reports` |
| `GenerateLtkmXmlJob` | LTKM submitted for PPATK | `reports` |
| `ResocreIraJob` | Alert generated atau schedule | `ira` |
| `ExecutePatrolRuleJob` | Manual trigger dari UI | `patrol` |
| `SendNotificationJob` | Event-driven | `notifications` |
| `SlaMonitorJob` | Schedule setiap 15 menit | `monitoring` |

---

## 11. Scheduled Commands (`app/Console/Commands/`)

```
AmlCft:SyncWatchlist           → Harian 02:00
AmlCft:GenerateLtktReport      → Harian 14:00
AmlCft:CheckSlaOverdue         → Setiap 15 menit
AmlCft:ResyncIraScores         → Harian 03:00 (batch rescore)
AmlCft:CleanIntegrationLogs    → Mingguan (hapus log > 30 hari)
```

---

## 12. Soft Delete & Trash UI Pattern

Setiap resource controller mengimplementasi:

```php
// Index: tampilkan yang tidak terhapus
public function index() → Model::latest()->paginate(20)

// Trash: tampilkan yang terhapus
public function trash() → Model::onlyTrashed()->paginate(20)

// Soft delete
public function destroy(Model $model) → $model->delete()

// Restore dari trash
public function restore($id) → Model::withTrashed()->findOrFail($id)->restore()

// Hard delete (hanya dari trash)
public function forceDelete($id) → Model::onlyTrashed()->findOrFail($id)->forceDelete()
```

Setiap `Trash.jsx` page menampilkan:
- Tabel dengan kolom yang sama tapi tambah kolom "Dihapus Pada"
- Tombol "Restore" per baris
- Tombol "Hapus Permanen" per baris (dengan konfirmasi modal)
- Tombol "Kosongkan Trash" (bulk force delete, hanya super admin)
