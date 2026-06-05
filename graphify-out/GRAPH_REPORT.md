# Graph Report - .  (2026-06-05)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 936 nodes · 1192 edges · 143 communities (122 shown, 21 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 20 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `35f1256d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Composer Package Configuration|Composer Package Configuration]]
- [[_COMMUNITY_Architecture & Database Schema|Architecture & Database Schema]]
- [[_COMMUNITY_Auth & Alert Controllers|Auth & Alert Controllers]]
- [[_COMMUNITY_Screening Rules Controller|Screening Rules Controller]]
- [[_COMMUNITY_Watchlist Controller|Watchlist Controller]]
- [[_COMMUNITY_EDD Detail Panel|EDD Detail Panel]]
- [[_COMMUNITY_Case Detail Panel|Case Detail Panel]]
- [[_COMMUNITY_Case Controller|Case Controller]]
- [[_COMMUNITY_Frontend Dependencies|Frontend Dependencies]]
- [[_COMMUNITY_Notification Controller|Notification Controller]]
- [[_COMMUNITY_LTKM Report Controller|LTKM Report Controller]]
- [[_COMMUNITY_Customer Controller|Customer Controller]]
- [[_COMMUNITY_Document & Report Models|Document & Report Models]]
- [[_COMMUNITY_Customer Model|Customer Model]]
- [[_COMMUNITY_Application Overview|Application Overview]]
- [[_COMMUNITY_User Model|User Model]]
- [[_COMMUNITY_EDD Document & Screening Rule|EDD Document & Screening Rule]]
- [[_COMMUNITY_AI Patrol & Outlet Models|AI Patrol & Outlet Models]]
- [[_COMMUNITY_DataSource & Patrol Execution|DataSource & Patrol Execution]]
- [[_COMMUNITY_Report Index Page|Report Index Page]]
- [[_COMMUNITY_AmlCase Model|AmlCase Model]]
- [[_COMMUNITY_Patrol Controller|Patrol Controller]]
- [[_COMMUNITY_Architecture & Requirements|Architecture & Requirements]]
- [[_COMMUNITY_Tech Stack Analysis|Tech Stack Analysis]]
- [[_COMMUNITY_Rules Index Page|Rules Index Page]]
- [[_COMMUNITY_Watchlist Index Page|Watchlist Index Page]]
- [[_COMMUNITY_Training Controller|Training Controller]]
- [[_COMMUNITY_Report Detail Page|Report Detail Page]]
- [[_COMMUNITY_Settings Index Page|Settings Index Page]]
- [[_COMMUNITY_Alert Detail Page|Alert Detail Page]]
- [[_COMMUNITY_Test Cases|Test Cases]]
- [[_COMMUNITY_Customer Detail Page|Customer Detail Page]]
- [[_COMMUNITY_LTKM Index Page|LTKM Index Page]]
- [[_COMMUNITY_EddCase Model|EddCase Model]]
- [[_COMMUNITY_Project Roadmap|Project Roadmap]]
- [[_COMMUNITY_Alerts Index Page|Alerts Index Page]]
- [[_COMMUNITY_Patrol Detail Page|Patrol Detail Page]]
- [[_COMMUNITY_SaaS & SSO Architecture|SaaS & SSO Architecture]]
- [[_COMMUNITY_Training Index Page|Training Index Page]]
- [[_COMMUNITY_Heatmap Component|Heatmap Component]]
- [[_COMMUNITY_App Layout & Navigation|App Layout & Navigation]]
- [[_COMMUNITY_LTKM Detail Page|LTKM Detail Page]]
- [[_COMMUNITY_Alert Model|Alert Model]]
- [[_COMMUNITY_Regulatory Report Controller|Regulatory Report Controller]]
- [[_COMMUNITY_Inertia Middleware|Inertia Middleware]]
- [[_COMMUNITY_User Factory|User Factory]]
- [[_COMMUNITY_Transaction Model|Transaction Model]]
- [[_COMMUNITY_Patrol Create Page|Patrol Create Page]]
- [[_COMMUNITY_Patrol Index Page|Patrol Index Page]]
- [[_COMMUNITY_Transaction Index Page|Transaction Index Page]]
- [[_COMMUNITY_Avatar Component|Avatar Component]]
- [[_COMMUNITY_Dashboard Index Page|Dashboard Index Page]]
- [[_COMMUNITY_Transaction Detail Page|Transaction Detail Page]]
- [[_COMMUNITY_Portal Token Auth|Portal Token Auth]]
- [[_COMMUNITY_Case Create Page|Case Create Page]]
- [[_COMMUNITY_Badge Component|Badge Component]]
- [[_COMMUNITY_Customer Index Page|Customer Index Page]]
- [[_COMMUNITY_EDD Create Page|EDD Create Page]]
- [[_COMMUNITY_App Service Provider|App Service Provider]]
- [[_COMMUNITY_RiskPill Component|RiskPill Component]]
- [[_COMMUNITY_Timeline Component|Timeline Component]]

## God Nodes (most connected - your core abstractions)
1. `Database Schema` - 25 edges
2. `Controller` - 18 edges
3. `Pegadaian AML/CFT Application` - 18 edges
4. `Customer` - 14 edges
5. `AmlCase` - 14 edges
6. `Customer` - 14 edges
7. `LtkmReport` - 13 edges
8. `User` - 12 edges
9. `Alert` - 11 edges
10. `CaseController` - 11 edges

## Surprising Connections (you probably didn't know these)
- `Architecture Modules (CDD/TM/EDD/Reporting)` --conceptually_related_to--> `Pegadaian AML/CFT Application`  [INFERRED]
  docs/ARCHITECTURE.md → README.md
- `Phase 2 Transaction Monitoring` --conceptually_related_to--> `Pemantauan Transaksi`  [INFERRED]
  docs/ROADMAP.md → README.md
- `Phase 1 MVP Core CDD` --conceptually_related_to--> `Onboarding CDD Wizard`  [INFERRED]
  docs/ROADMAP.md → README.md
- `Phase 3 Regulatory Reporting` --conceptually_related_to--> `Pelaporan Regulator`  [INFERRED]
  docs/ROADMAP.md → README.md
- `Phase 4 AI Enhancement` --conceptually_related_to--> `AI Patrol NL-to-SQL`  [INFERRED]
  docs/ROADMAP.md → README.md

## Import Cycles
- None detected.

## Communities (143 total, 21 thin omitted)

### Community 0 - "Composer Package Configuration"
Cohesion: 0.04
Nodes (46): pestphp/pest-plugin, php-http/discovery, autoload, psr-4, config, allow-plugins, optimize-autoloader, preferred-install (+38 more)

### Community 1 - "Architecture & Database Schema"
Cohesion: 0.07
Nodes (28): Backend Implementation Plan, Middleware Catalogue, Eloquent Models Catalogue, Inertia Pages Tree, Routes Map (web.php), Service Layer Catalogue, alerts table, case_activities table (+20 more)

### Community 2 - "Auth & Alert Controllers"
Cohesion: 0.13
Nodes (7): Alert, Request, Request, Request, LoginController, Controller, Transaction

### Community 3 - "Screening Rules Controller"
Cohesion: 0.13
Nodes (7): Request, Request, SystemSetting, ScreeningRule, Seeder, ScreeningRuleSeeder, UserSeeder

### Community 4 - "Watchlist Controller"
Cohesion: 0.11
Nodes (3): Request, WatchlistHit, WatchlistHit

### Community 5 - "EDD Detail Panel"
Cohesion: 0.12
Nodes (15): buildSteps(), deriveDocuments(), deriveQaCards(), EddDetailPanel(), eddRiskLevel(), fmtDateTime(), QaBorderColor(), QaCard() (+7 more)

### Community 6 - "Case Detail Panel"
Cohesion: 0.15
Nodes (14): caseRiskLevel(), caseStatusBadgeStatus(), caseStatusKey(), caseStatusLabel(), deriveFactors(), deriveTimeline(), fmtDate(), fmtDateTime() (+6 more)

### Community 7 - "Case Controller"
Cohesion: 0.17
Nodes (5): AmlCase, Request, Request, CaseController, EddCase

### Community 8 - "Frontend Dependencies"
Cohesion: 0.10
Nodes (20): dependencies, @inertiajs/react, lucide-react, react, react-dom, ziggy-js, devDependencies, axios (+12 more)

### Community 9 - "Notification Controller"
Cohesion: 0.11
Nodes (9): Request, NotificationController, HasUuids, PREF_DEFAULTS, SAMPLE, TABS, TONE_BG, TONE_FG (+1 more)

### Community 10 - "LTKM Report Controller"
Cohesion: 0.20
Nodes (3): Request, LtkmReport, LtkmReport

### Community 11 - "Customer Controller"
Cohesion: 0.20
Nodes (3): Request, Request, Customer

### Community 12 - "Document & Report Models"
Cohesion: 0.15
Nodes (3): Model, CaseDocument, RegulatoryReport

### Community 14 - "Application Overview"
Cohesion: 0.16
Nodes (15): Alerts Module, Manajemen Kasus, Nasabah / CDD (Customer 360), Dashboard Module, Enhanced Due Diligence, LTKM Workspace (4-eyes), Notifikasi, Onboarding CDD Wizard (+7 more)

### Community 15 - "User Model"
Cohesion: 0.17
Nodes (3): Authenticatable, User, Notifiable

### Community 16 - "EDD Document & Screening Rule"
Cohesion: 0.18
Nodes (4): HasFactory, EddDocument, PatrolQuery, ScreeningRule

### Community 17 - "AI Patrol & Outlet Models"
Cohesion: 0.18
Nodes (4): AiPatrolRule, Outlet, TrainingModule, SoftDeletes

### Community 19 - "Report Index Page"
Cohesion: 0.17
Nodes (5): SAMPLE_REPORTS, SCHEDULE, SYNC_STATUS, TABS, TYPE_TAG

### Community 21 - "Patrol Controller"
Cohesion: 0.33
Nodes (3): Request, PatrolController, PatrolQuery

### Community 22 - "Architecture & Requirements"
Cohesion: 0.18
Nodes (11): Data Model Tables, AML/CFT Architecture, Domain Bisnis APU PPT PPPSPM, External Integrations (DukCapil PPATK), Architecture Modules (CDD/TM/EDD/Reporting), Non-Functional Requirements (300k tx/day), Security 4-eyes PII Encryption, Claude Guidance Doc (+3 more)

### Community 23 - "Tech Stack Analysis"
Cohesion: 0.20
Nodes (11): Laravel React vs Next.js Comparison, Inertia.js Recommendation, AML/CFT App, Tech Stack Analysis, iDesk App, i-GRaCiaS App, Laravel 12 + PHP 8.4, Pegadaian Compliance Platform (4 Apps) (+3 more)

### Community 24 - "Rules Index Page"
Cohesion: 0.18
Nodes (3): CATEGORY_LABEL, CATEGORY_TONE, TABS

### Community 25 - "Watchlist Index Page"
Cohesion: 0.18
Nodes (4): JENIS_LABEL, JENIS_TONE, SOURCE_TONE, TABS

### Community 26 - "Training Controller"
Cohesion: 0.38
Nodes (3): Request, TrainingController, TrainingModule

### Community 27 - "Report Detail Page"
Cohesion: 0.27
Nodes (7): fmtDate(), fmtDateTime(), LaporanShow(), safeRoute(), SAMPLE_AUDIT, SAMPLE_VALIDATIONS, TYPE_LABEL

### Community 28 - "Settings Index Page"
Cohesion: 0.33
Nodes (7): asBoolean(), humanizeGroup(), humanizeKey(), inferType(), SettingField(), SettingSection(), valueToString()

### Community 29 - "Alert Detail Page"
Cohesion: 0.39
Nodes (8): AlertShow(), deriveFactors(), deriveTimeline(), fmtDate(), fmtDateTime(), SEVERITY_LEVEL, severityScoreColor(), STATUS_BADGE

### Community 30 - "Test Cases"
Cohesion: 0.28
Nodes (4): BaseTestCase, ExampleTest, TestCase, ExampleTest

### Community 31 - "Customer Detail Page"
Cohesion: 0.31
Nodes (7): CURRENCY, fmtCompactIdr(), fmtDate(), NasabahShow(), NUMBER, RISK_LABEL, RISK_LEVEL_KEY()

### Community 32 - "LTKM Index Page"
Cohesion: 0.22
Nodes (4): CURRENCY, STATUS_LABEL, STATUS_TABS, STATUS_TAG_TONE

### Community 34 - "Project Roadmap"
Cohesion: 0.22
Nodes (9): AI Patrol NL-to-SQL, Pelaporan Regulator, Pemantauan Transaksi, 10-Month Roadmap, Phase 0 Preparation, Phase 2 Transaction Monitoring, Phase 3 Regulatory Reporting, Phase 4 AI Enhancement (+1 more)

### Community 35 - "Alerts Index Page"
Cohesion: 0.25
Nodes (4): SEVERITY_LEVEL, SEVERITY_OPTIONS, STATUS_BADGE, STATUS_OPTIONS

### Community 36 - "Patrol Detail Page"
Cohesion: 0.29
Nodes (4): fmtDateTime(), PatrolShow(), STATUS_LABEL, STATUS_TONE

### Community 37 - "SaaS & SSO Architecture"
Cohesion: 0.25
Nodes (8): Portal OAuth2 SSO, Phase 6 SaaS & Whitelabel, BYODB Per App Per Tenant, BYOS Per App Per Tenant, SaaS Whitelabel Architecture, SSO OAuth2 Flow, Whitelabel Branding, Stancl Tenancy (multi-DB BYODB)

### Community 39 - "Training Index Page"
Cohesion: 0.25
Nodes (6): CAMPAIGNS, EXPIRING, JENIS_LABEL, JENIS_TONE, STATUS_LABEL, STATUS_TONE

### Community 42 - "LTKM Detail Page"
Cohesion: 0.29
Nodes (3): CURRENCY, STATUS_LABEL, STATUS_TONE

### Community 46 - "User Factory"
Cohesion: 0.47
Nodes (3): UserFactory, Factory, static

### Community 50 - "Transaction Index Page"
Cohesion: 0.33
Nodes (4): CURRENCY, STATUS_LABEL, STATUS_TONE, TOP_RULES

### Community 51 - "Avatar Component"
Cohesion: 0.60
Nodes (4): Avatar(), hashName(), initialsFrom(), PALETTE

### Community 57 - "Transaction Detail Page"
Cohesion: 0.40
Nodes (3): CURRENCY, STATUS_LABEL, STATUS_TONE

## Knowledge Gaps
- **154 isolated node(s):** `$schema`, `name`, `type`, `description`, `keywords` (+149 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **21 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Database Schema` connect `Architecture & Database Schema` to `Architecture & Requirements`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **Why does `SystemSetting` connect `Screening Rules Controller` to `EDD Document & Screening Rule`, `Document & Report Models`?**
  _High betweenness centrality (0.055) - this node is a cross-community bridge._
- **Why does `Data Model Tables` connect `Architecture & Requirements` to `Architecture & Database Schema`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **What connects `$schema`, `name`, `type` to the rest of the system?**
  _154 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Composer Package Configuration` be split into smaller, more focused modules?**
  _Cohesion score 0.04081632653061224 - nodes in this community are weakly interconnected._
- **Should `Architecture & Database Schema` be split into smaller, more focused modules?**
  _Cohesion score 0.07293868921775898 - nodes in this community are weakly interconnected._
- **Should `Auth & Alert Controllers` be split into smaller, more focused modules?**
  _Cohesion score 0.12688172043010754 - nodes in this community are weakly interconnected._