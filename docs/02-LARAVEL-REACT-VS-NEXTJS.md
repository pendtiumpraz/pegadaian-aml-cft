# Laravel + React vs Laravel + Next.js
## Untuk Platform Compliance (4 App Terpisah)

---

## Konteks

Platform compliance terdiri dari **4 app terpisah** (Portal, iDesk, i-GRaCiaS, AML/CFT).
Pertanyaan: frontend architecture mana yang terbaik **per app**?

---

## Perbandingan 3 Opsi Frontend

### Opsi A: Laravel API + React SPA (Vite)

```
Per App:
┌──────────────┐       API (JSON)       ┌──────────────┐
│  React SPA   │ ◄────────────────────► │  Laravel API │
│  (Vite)      │     Sanctum Auth       │  (Backend)   │
└──────────────┘                        └──────────────┘
2 build terpisah per app × 4 app = 8 deployments
```

| Pro | Kontra |
|---|---|
| Full separation FE/BE | CORS setup per app |
| Bisa hire FE & BE terpisah | 8 deployment pipelines (4 FE + 4 BE) |
| React ecosystem 100% | Auth state management 2 tempat |

### Opsi B: Laravel API + Next.js

```
Per App:
┌──────────────┐       API (JSON)       ┌──────────────┐
│   Next.js    │ ◄────────────────────► │  Laravel API │
│  (Node.js)   │                        │  (Backend)   │
└──────────────┘                        └──────────────┘
2 server per app × 4 app = 8 servers running
```

| Pro | Kontra |
|---|---|
| SSR/SSG | 8 servers running (4 Node + 4 PHP) |
| File-based routing | SSR tidak dibutuhkan (internal app) |
| Image optimization | Auth bridging NextAuth ↔ Sanctum (×4 app!) |
| | Biaya infra naik signifikan |

### Opsi C: Laravel + Inertia.js + React ⭐ RECOMMENDED

```
Per App:
┌─────────────────────────────────┐
│       Laravel Monolith          │
│  Inertia.js + React (frontend) │
│  Laravel Controllers (backend)  │
│  Single Server per App          │
└─────────────────────────────────┘
1 server per app × 4 app = 4 servers (atau bahkan 1 shared server)
```

| Pro | Kontra |
|---|---|
| 1 server per app | FE & BE coupled (tapi OK untuk internal app) |
| Auth langsung Laravel | Perlu API layer tambahan untuk mobile (gampang) |
| No CORS, no bridging | |
| Data langsung jadi React props | |
| 4 deploy saja, bukan 8 | |

---

## Kenapa Inertia Menang untuk Case Ini?

### 1. Scale of Simplicity

Dengan 4 app, setiap tambahan kompleksitas **dikali 4**:

| Kompleksitas | Inertia (×4) | Next.js (×4) |
|---|---|---|
| Server yang running | 4 | 8 |
| CORS config | 0 | 4 |
| Auth bridging | 0 | 4 |
| Deploy pipelines | 4 | 8 |
| Repo | 4 | 4-8 |
| Devops effort | 1x | 2x |

### 2. SSO Tetap Bisa

```
Portal (OAuth2 Server)
│
├── iDesk (Inertia app) → validasi token via backend, no CORS issue
├── i-GRaCiaS (Inertia app) → same
└── AML/CFT (Inertia app) → same
```

Kalau pakai Next.js, SSO harus handle CORS + token forwarding antara
Next.js server → Laravel API per app. Dengan Inertia, auth 100% di server-side.

### 3. Shared Packages Lebih Mudah

```
// Composer package: pegadaian/auth-client
// Cukup install di tiap Laravel app, done.

// Kalau Next.js terpisah, perlu JUGA npm package untuk FE auth handling
// = maintain 2 package registries (Composer + npm private registry)
```

### 4. Code Example — Data Flow

```php
// iDesk: TaskController.php
public function index()
{
    return Inertia::render('Tasks/Index', [
        'tasks' => Task::with('assignee')
            ->where('tenant_id', tenant()->id)
            ->latest()
            ->paginate(20),
        'stats' => [
            'open' => Task::open()->count(),
            'completed' => Task::completed()->count(),
        ],
    ]);
}
```

```tsx
// iDesk: Pages/Tasks/Index.tsx
export default function TaskIndex({ tasks, stats }) {
    return (
        <AppLayout>
            <StatsCards stats={stats} />
            <TaskTable data={tasks.data} />
            <Pagination links={tasks.links} />
        </AppLayout>
    );
}
```

Tidak perlu `fetch()`, tidak perlu loading state, tidak perlu error handling API.
Data sudah ada saat component render. **Dikali 4 app = hemat banyak boilerplate.**

---

## Kapan Perlu Next.js?

| Skenario | Perlu Next.js? |
|---|---|
| Internal compliance dashboard | ❌ Inertia cukup |
| SaaS whitelabel (managed) | ❌ Inertia + CSS variables cukup |
| Whitelabel client mau custom UI | ⚠️ Client build sendiri, consume API kamu |
| Public marketing site per tenant | ✅ Bikin site terpisah, bukan bagian core app |
| SEO-heavy public pages | ✅ Tapi ini bukan scope compliance app |

---

## Kesimpulan

Untuk 4 app terpisah, **Inertia.js menang telak** karena setiap tambahan
kompleksitas dikali 4. Tetap build REST API `/api/v1/` parallel di tiap app
supaya ready untuk whitelabel/mobile di masa depan.

```
Semua 4 App:
├── Laravel 12 + Inertia.js + React 18
├── Routes: /web (Inertia) + /api/v1 (REST, parallel)
├── Auth: Passport (Portal) + Sanctum (per-app session)
└── Deploy: 1 server per app (atau shared VPS)
```
