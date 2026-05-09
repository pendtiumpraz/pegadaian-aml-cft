# 🏢 Arsitektur SaaS + Whitelabel + BYODB/BYOS
## Platform Compliance (4 App Terpisah)

---

## 📌 Arsitektur Platform

```
                    ┌─────────────────────────────────┐
                    │         LOAD BALANCER            │
                    │       (Cloudflare / ALB)         │
                    └────┬───────┬────────┬────────┬───┘
                         │       │        │        │
                   ┌─────▼──┐ ┌──▼────┐ ┌─▼─────┐ ┌▼──────┐
                   │ Portal │ │ iDesk │ │iGRaCi │ │AML/CFT│
                   │ :8000  │ │ :8001 │ │ :8002 │ │ :8003 │
                   └───┬────┘ └──┬────┘ └──┬────┘ └──┬────┘
                       │         │         │         │
            ┌──────────▼─────────▼─────────▼─────────▼──────────┐
            │                   REDIS CLUSTER                    │
            │          (sessions, cache, queues)                 │
            └───────────────────────────────────────────────────┘
```

---

## 🔑 Portal: SSO + Tenant Management

Portal adalah **central hub** — satu-satunya app yang user login langsung.

### Fungsi Portal

| Fitur | Detail |
|---|---|
| **SSO (OAuth2)** | Laravel Passport, issue access token untuk 3 app lain |
| **Tenant Management** | CRUD tenant, assign plan, BYODB/BYOS config |
| **User Management** | Master user pool, assign user ke tenant + app + role |
| **Billing** | Subscription plans, invoice, payment (Xendit/Stripe) |
| **App Launcher** | Dashboard dengan card/icon ke 3 app |
| **Super Admin** | Platform-wide monitoring, usage stats |

### Portal Database (Central, tidak per-tenant)

```sql
-- tenants: registrasi semua tenant
CREATE TABLE tenants (
    id              VARCHAR PRIMARY KEY,  -- 'pegadaian', 'bankxyz'
    name            VARCHAR NOT NULL,     -- 'PT Pegadaian'
    plan            VARCHAR NOT NULL,     -- 'starter', 'professional', 'enterprise'
    domain_portal   VARCHAR,              -- 'pegadaian.platform.com'
    branding        JSONB,                -- {"logo", "colors", "app_name"}
    created_at      TIMESTAMP
);

-- tenant_apps: app mana yang aktif per tenant
CREATE TABLE tenant_apps (
    tenant_id       VARCHAR REFERENCES tenants(id),
    app_code        VARCHAR NOT NULL,     -- 'idesk', 'igracias', 'amlcft'
    is_active       BOOLEAN DEFAULT true,
    domain          VARCHAR,              -- 'idesk.pegadaian.com'
    -- BYODB config per app per tenant
    db_host         VARCHAR,
    db_port         INTEGER DEFAULT 5432,
    db_database     VARCHAR,
    db_username     VARCHAR,
    db_password_enc TEXT,                  -- encrypted
    -- BYOS config per app per tenant
    storage_driver  VARCHAR DEFAULT 'local',
    storage_bucket  VARCHAR,
    storage_key     VARCHAR,
    storage_secret  TEXT,                  -- encrypted
    PRIMARY KEY (tenant_id, app_code)
);

-- users: master user pool
CREATE TABLE users (
    id              BIGSERIAL PRIMARY KEY,
    email           VARCHAR UNIQUE NOT NULL,
    password        VARCHAR NOT NULL,
    name            VARCHAR NOT NULL,
    phone           VARCHAR,
    two_factor      BOOLEAN DEFAULT false,
    created_at      TIMESTAMP
);

-- user_tenant_roles: user punya role berbeda per tenant per app
CREATE TABLE user_tenant_roles (
    user_id         BIGINT REFERENCES users(id),
    tenant_id       VARCHAR REFERENCES tenants(id),
    app_code        VARCHAR NOT NULL,     -- 'idesk', 'igracias', 'amlcft'
    role            VARCHAR NOT NULL,     -- 'aml_analyst', 'risk_officer', dll
    PRIMARY KEY (user_id, tenant_id, app_code)
);

-- subscriptions & billing
CREATE TABLE subscriptions (
    id              BIGSERIAL PRIMARY KEY,
    tenant_id       VARCHAR REFERENCES tenants(id),
    plan            VARCHAR NOT NULL,
    price_monthly   DECIMAL(12,2),
    started_at      TIMESTAMP,
    expires_at      TIMESTAMP,
    status          VARCHAR DEFAULT 'active'
);
```

---

## 🔄 SSO Flow Detail

```
1. User buka portal.platform.com
   → Login (email + password + 2FA)
   → Portal creates session + generates OAuth2 token

2. User klik "Open iDesk" di app launcher
   → Portal redirect ke idesk.platform.com/auth/sso?token=xxx

3. iDesk backend receives token
   → POST portal.platform.com/api/oauth/validate {token: xxx}
   → Portal returns: {user_id, tenant_id, role: "compliance_officer"}

4. iDesk creates local session
   → User masuk iDesk, sudah authenticated
   → Role "compliance_officer" di-enforce oleh Spatie Permission di iDesk

5. User navigate ke i-GRaCiaS
   → Same flow, tapi role bisa beda: "risk_officer"
```

### SSO Implementation (Shared Package)

```php
// packages/pegadaian/auth-client/src/SsoMiddleware.php
// Install di tiap app: composer require pegadaian/auth-client

class SsoMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        if ($request->has('sso_token')) {
            $portalResponse = Http::post(config('portal.url') . '/api/oauth/validate', [
                'token' => $request->sso_token,
            ]);

            if ($portalResponse->successful()) {
                $userData = $portalResponse->json();
                $user = User::firstOrCreate(
                    ['portal_user_id' => $userData['user_id']],
                    ['name' => $userData['name'], 'email' => $userData['email']]
                );
                $user->syncRoles($userData['roles']); // Spatie
                Auth::login($user);
            }
        }

        return $next($request);
    }
}
```

---

## 🗄️ BYODB Per App Per Tenant

Setiap app handle tenancy-nya sendiri. Config BYODB disimpan di Portal,
lalu dibaca oleh masing-masing app saat tenant teridentifikasi.

### 3 Mode Database

```
Mode 1: Platform-Managed
  Tenant signup → platform auto-create DB:
    idesk_pegadaian, igracias_pegadaian, amlcft_pegadaian
  Backup & maintenance by platform.

Mode 2: BYODB (External Server)
  Tenant kasih credentials DB mereka per app:
    iDesk → connect ke db.bankxyz.internal:5432/idesk
    AML/CFT → connect ke db.bankxyz.internal:5432/amlcft
  Data NEVER touches platform server.

Mode 3: Dedicated (Platform Server, Separate DB)
  Isolated DB tapi di-manage platform.
  Guaranteed separation tanpa tenant manage infra.
```

### App-Side Tenancy Config

```php
// Tiap app: config/tenancy.php
// App fetch BYODB config dari Portal API saat identify tenant

class TenantResolver
{
    public function resolve(string $domain): array
    {
        // Cache-first, fallback ke Portal API
        return Cache::remember("tenant:{$domain}", 300, function () use ($domain) {
            $response = Http::get(config('portal.url') . '/api/tenants/resolve', [
                'domain' => $domain,
                'app' => config('app.code'), // 'idesk' / 'igracias' / 'amlcft'
            ]);
            return $response->json();
            // Returns: {tenant_id, db_host, db_port, db_database, ...}
        });
    }
}
```

---

## 📦 BYOS Per App Per Tenant

Sama seperti BYODB — config di Portal, execution di masing-masing app.

```php
// Shared package: pegadaian/tenant-storage
class TenantStorage
{
    public function disk(): Filesystem
    {
        $config = tenant()->storage_config;

        if ($config['driver'] === 's3') {
            return Storage::build([
                'driver'   => 's3',
                'key'      => $config['key'],
                'secret'   => decrypt($config['secret']),
                'bucket'   => $config['bucket'],
                'endpoint' => $config['endpoint'],
            ]);
        }

        return Storage::build([
            'driver' => 'local',
            'root'   => storage_path("tenants/{$config['tenant_id']}"),
        ]);
    }
}
```

---

## 🎨 Whitelabel: Managed vs Self-Hosted

### Managed Whitelabel (tenant di server kamu)

```
Tenant config di Portal:
{
    "branding": {
        "logo_url": "https://cdn.bankxyz.com/logo.png",
        "app_name": "XYZ Compliance Suite",
        "primary_color": "#1a5276",
        "secondary_color": "#d4ac0d",
        "sidebar_style": "dark"
    }
}

→ Semua 3 app baca branding dari Portal API
→ React apply via CSS variables
→ 1 codebase, tampilan beda per tenant
```

### Self-Hosted Whitelabel (tenant deploy di server mereka)

```
Client deploy Laravel app di server mereka sendiri.
→ Mereka BISA pakai default Inertia frontend (ganti branding saja)
→ Atau mereka build custom frontend, consume /api/v1/ routes
→ Kamu provide: Docker image / deployment guide
→ App connect ke Portal untuk license validation
```

---

## 🔗 Cross-App Communication

Data antar 3 app TIDAK di-share via shared DB.
Kalau perlu data dari app lain, via **internal API**:

```php
// Di iDesk, perlu risk level dari i-GRaCiaS:
$riskData = Http::withToken($internalApiToken)
    ->get("http://igracias-internal:8002/api/internal/risk-scores", [
        'entity_type' => 'customer',
        'entity_id' => $customerId,
    ]);

// Internal API routes: hanya bisa diakses dari network internal
// (beda dari /api/v1/ yang public-facing)
Route::middleware(['internal-network'])->prefix('api/internal')->group(function () {
    Route::get('/risk-scores', [InternalApiController::class, 'riskScores']);
});
```

---

## 🚀 Deployment Strategy

### Development (Local)

```bash
# 4 terminal tabs:
cd portal   && php artisan serve --port=8000
cd idesk    && php artisan serve --port=8001
cd igracias && php artisan serve --port=8002
cd amlcft   && php artisan serve --port=8003
```

### Production: Shared VPS (Budget)

```
1 VPS (8 vCPU, 16GB RAM):
├── Nginx (reverse proxy, route by domain)
├── PHP-FPM × 4 pools (1 per app)
├── PostgreSQL (multiple databases)
├── Redis
└── Supervisor (queue workers per app)

Estimated: Rp 500.000 - 1.000.000/bulan
Supports: ~10-20 tenants
```

### Production: Container (Scale)

```
Kubernetes / Docker Swarm:
├── portal-app     (2 replicas)
├── idesk-app      (2 replicas)
├── igracias-app   (2 replicas)
├── amlcft-app     (2 replicas)
├── postgres       (managed: RDS/CloudSQL)
├── redis          (managed: ElastiCache)
└── nginx-ingress  (route by domain)

Estimated: Rp 2.000.000 - 5.000.000/bulan
Supports: 50+ tenants, horizontal scaling
```

---

## 📅 Development Timeline

| Phase | Durasi | Deliverable |
|---|---|---|
| **Phase 1** | Bulan 1-2 | Portal (SSO, tenant mgmt, user mgmt) |
| **Phase 2** | Bulan 2-4 | AML/CFT app (fitur inti: CDD, screening) |
| **Phase 3** | Bulan 4-6 | iDesk (dashboard, task management) |
| **Phase 4** | Bulan 6-8 | i-GRaCiaS (risk register, control monitoring) |
| **Phase 5** | Bulan 8-9 | BYODB/BYOS, whitelabel branding, billing |
| **Phase 6** | Bulan 9-10 | API documentation, onboarding flow, testing |

**Team size minimal:** 2-3 fullstack dev + 1 devops (part-time)

---

## ✅ Kesimpulan

| Pertanyaan | Jawaban |
|---|---|
| Tech stack sama untuk semua? | ✅ Ya — Laravel + Inertia + React + PostgreSQL |
| Laravel fullstack aman untuk SaaS? | ✅ Ya — dengan API-first approach |
| Perlu Next.js? | ❌ Tidak — Inertia cukup, API tersedia untuk client yang mau custom FE |
| BYODB feasible? | ✅ Ya — Stancl/Tenancy + Portal config |
| BYOS feasible? | ✅ Ya — Dynamic Storage per tenant |
| 4 app bisa 1 server? | ✅ Ya (dev & small scale), tapi plan untuk scale |
