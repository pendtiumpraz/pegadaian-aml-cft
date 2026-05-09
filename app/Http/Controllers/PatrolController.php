<?php

namespace App\Http\Controllers;

use App\Models\PatrolQuery;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PatrolController extends Controller
{
    public function index(Request $request)
    {
        $queries = PatrolQuery::with('user')
            ->latest()
            ->paginate(20)
            ->withQueryString();

        $summary = [
            'total'      => PatrolQuery::count(),
            'executed'   => PatrolQuery::where('status', 'executed')->count(),
            'pending'    => PatrolQuery::whereIn('status', ['draft', 'generated'])->count(),
            'avg_time'   => (int) PatrolQuery::where('status', 'executed')
                                ->whereNotNull('execution_time_ms')
                                ->avg('execution_time_ms'),
        ];

        return Inertia::render('Patrol/Index', [
            'queries' => $queries,
            'summary' => $summary,
        ]);
    }

    public function create()
    {
        return Inertia::render('Patrol/Create');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'prompt' => 'required|string|min:5',
        ]);

        $generated = $this->generateMockSql($data['prompt']);

        $query = PatrolQuery::create([
            'prompt'        => $data['prompt'],
            'formula'       => $generated['formula'],
            'generated_sql' => $generated['sql'],
            'cost_estimate' => $generated['cost_estimate'],
            'status'        => 'generated',
            'user_id'       => auth()->id(),
        ]);

        return redirect()
            ->route('patrol.show', $query)
            ->with('success', 'Query AI berhasil dibuat. Tinjau dan jalankan untuk melihat hasil.');
    }

    public function show(PatrolQuery $patrol)
    {
        $patrol->load('user');

        return Inertia::render('Patrol/Show', [
            'query' => $patrol,
        ]);
    }

    public function execute(PatrolQuery $patrol)
    {
        $start = microtime(true);

        $results = $this->generateMockResults($patrol->prompt);

        $elapsedMs = (int) ((microtime(true) - $start) * 1000) + random_int(800, 4500);

        $patrol->update([
            'executed_at'       => Carbon::now(),
            'execution_time_ms' => $elapsedMs,
            'result_count'      => count($results),
            'status'            => 'executed',
            'result_json'       => $results,
        ]);

        return redirect()
            ->route('patrol.show', $patrol)
            ->with('success', "Query berhasil dieksekusi · {$patrol->result_count} hasil ditemukan.");
    }

    /* -----------------------------------------------------------------
     | Mock SQL & result generation — template based on keywords.
     | NO real AI service is called.
     | ----------------------------------------------------------------- */

    private function generateMockSql(string $prompt): array
    {
        $p = Str::lower($prompt);

        $whereClauses = [];
        $formulaParts = [];

        // Threshold detection
        if (preg_match('/(\d+)\s*(jt|juta|m|miliar)/i', $p, $m)) {
            $n = (int) $m[1];
            $unit = strtolower($m[2]);
            $multiplier = in_array($unit, ['jt', 'juta']) ? 1_000_000 : 1_000_000_000;
            $threshold = $n * $multiplier;
            $whereClauses[] = "transactions.amount > {$threshold}";
            $formulaParts[] = "transaksi.jumlah > Rp " . number_format($threshold, 0, ',', '.');
        } else {
            $whereClauses[] = "transactions.amount > 100000000";
            $formulaParts[] = "transaksi.jumlah > Rp 100.000.000";
        }

        // Time window detection
        if (preg_match('/(\d+)\s*hari/i', $p, $m)) {
            $days = (int) $m[1];
            $whereClauses[] = "transactions.txn_time > NOW() - INTERVAL {$days} DAY";
            $formulaParts[] = "tanggal > {$days} hari yang lalu";
        } elseif (Str::contains($p, ['minggu', 'week'])) {
            $whereClauses[] = "transactions.txn_time > NOW() - INTERVAL 7 DAY";
            $formulaParts[] = "tanggal > 7 hari yang lalu";
        } elseif (Str::contains($p, ['hari ini', 'today'])) {
            $whereClauses[] = "DATE(transactions.txn_time) = CURDATE()";
            $formulaParts[] = "tanggal = hari ini";
        } else {
            $whereClauses[] = "transactions.txn_time > NOW() - INTERVAL 30 DAY";
            $formulaParts[] = "tanggal > 30 hari yang lalu";
        }

        // PEP keyword
        if (Str::contains($p, ['pep', 'politik', 'pejabat'])) {
            $whereClauses[] = "customers.pep_flag = TRUE";
            $formulaParts[] = "nasabah.is_pep = true";
        }

        // Watchlist
        if (Str::contains($p, ['watchlist', 'dttot', 'sanksi', 'sanction'])) {
            $whereClauses[] = "EXISTS (SELECT 1 FROM watchlist_hits wh WHERE wh.customer_id = customers.id AND wh.status = 'confirmed')";
            $formulaParts[] = "nasabah.watchlist_match = true";
        }

        // Smurfing / structuring
        if (Str::contains($p, ['smurfing', 'structuring', 'pemecahan'])) {
            $whereClauses[] = "transactions.amount BETWEEN 50000000 AND 499000000";
            $whereClauses[] = "(SELECT COUNT(*) FROM transactions t2 WHERE t2.customer_id = customers.id AND t2.txn_time > NOW() - INTERVAL 1 DAY) >= 5";
            $formulaParts[] = "pola_smurfing(>= 5 transaksi/hari, masing-masing < 500jt)";
        }

        // High risk / curiga
        if (Str::contains($p, ['curiga', 'mencurigakan', 'suspicious', 'high risk', 'risiko tinggi'])) {
            $whereClauses[] = "customers.risk_level IN ('high', 'critical')";
            $formulaParts[] = "nasabah.risk_level = high|critical";
        }

        $whereSql = implode("\n  AND ", $whereClauses);

        $sql = <<<SQL
-- AI generated · v1 · sandbox · readonly_aml
SELECT
  customers.cif,
  customers.name AS nasabah,
  transactions.txn_id,
  transactions.txn_time AS tanggal_transaksi,
  transactions.amount AS jumlah,
  transactions.channel,
  customers.risk_level,
  customers.ira_score
FROM transactions
JOIN customers ON customers.id = transactions.customer_id
WHERE {$whereSql}
ORDER BY transactions.txn_time DESC
LIMIT 200;
SQL;

        $formula = "Filter: " . implode(' AND ', $formulaParts);

        // Cost estimate — deterministic-ish from prompt length
        $cost = round((strlen($prompt) % 50) / 10 + 0.50, 2);

        return [
            'formula'       => $formula,
            'sql'           => $sql,
            'cost_estimate' => $cost,
        ];
    }

    private function generateMockResults(string $prompt): array
    {
        $p = Str::lower($prompt);
        $isPep = Str::contains($p, ['pep', 'politik', 'pejabat']);
        $isHigh = Str::contains($p, ['curiga', 'mencurigakan', 'high', 'risiko tinggi']);

        $sample = [
            ['cif' => 'CIF-7723014', 'nasabah' => 'Hartono Wijaya',     'tanggal' => '2026-05-07', 'jumlah' => 320_000_000, 'channel' => 'outlet',  'risk' => 'high'],
            ['cif' => 'CIF-2090331', 'nasabah' => 'Linda Pratiwi',      'tanggal' => '2026-05-06', 'jumlah' => 410_000_000, 'channel' => 'digital', 'risk' => 'high'],
            ['cif' => 'CIF-9012087', 'nasabah' => 'PT Karya Bersama',   'tanggal' => '2026-05-06', 'jumlah' => 480_000_000, 'channel' => 'outlet',  'risk' => 'medium'],
            ['cif' => 'CIF-7081244', 'nasabah' => 'PT Sumber Niaga',    'tanggal' => '2026-05-05', 'jumlah' => 290_000_000, 'channel' => 'outlet',  'risk' => 'medium'],
            ['cif' => 'CIF-4422199', 'nasabah' => 'Andi Setiawan',      'tanggal' => '2026-05-05', 'jumlah' => 210_000_000, 'channel' => 'digital', 'risk' => 'low'],
            ['cif' => 'CIF-1108455', 'nasabah' => 'Siti Marlina',       'tanggal' => '2026-05-04', 'jumlah' => 340_000_000, 'channel' => 'outlet',  'risk' => 'medium'],
            ['cif' => 'CIF-3344219', 'nasabah' => 'Budi Santoso',       'tanggal' => '2026-05-04', 'jumlah' => 180_000_000, 'channel' => 'digital', 'risk' => 'low'],
            ['cif' => 'CIF-5566012', 'nasabah' => 'Rahmat Hidayat',     'tanggal' => '2026-05-03', 'jumlah' => 260_000_000, 'channel' => 'outlet',  'risk' => 'low'],
            ['cif' => 'CIF-8809113', 'nasabah' => 'Dewi Anggraini',     'tanggal' => '2026-05-03', 'jumlah' => 520_000_000, 'channel' => 'digital', 'risk' => 'high'],
            ['cif' => 'CIF-6620478', 'nasabah' => 'Eko Pranowo',        'tanggal' => '2026-05-02', 'jumlah' => 145_000_000, 'channel' => 'outlet',  'risk' => 'medium'],
            ['cif' => 'CIF-1290877', 'nasabah' => 'PT Mitra Dagang',    'tanggal' => '2026-05-02', 'jumlah' => 760_000_000, 'channel' => 'outlet',  'risk' => 'high'],
            ['cif' => 'CIF-4477821', 'nasabah' => 'Yanti Kusuma',       'tanggal' => '2026-05-01', 'jumlah' => 135_000_000, 'channel' => 'digital', 'risk' => 'low'],
        ];

        if ($isPep) {
            $sample = array_map(fn ($r) => $r + ['is_pep' => true], $sample);
        }
        if ($isHigh) {
            $sample = array_filter($sample, fn ($r) => in_array($r['risk'], ['high', 'medium']));
        }

        // Slice 5–12 rows pseudorandomly based on prompt
        $count = 5 + (strlen($prompt) % 8);
        return array_values(array_slice($sample, 0, min($count, count($sample))));
    }
}
