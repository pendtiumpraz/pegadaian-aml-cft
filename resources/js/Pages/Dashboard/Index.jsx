import AppLayout from '@/Layouts/AppLayout';
import StatCard from '@/Components/StatCard';
import PageHeader from '@/Components/PageHeader';
import Badge from '@/Components/Badge';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import {
    Bell,
    AlertTriangle,
    FileWarning,
    ArrowLeftRight,
    Filter,
    Plus,
    Download,
    RefreshCw,
    ArrowRight,
    MoreHorizontal,
} from 'lucide-react';

/**
 * Dashboard Operasional — KPIs + alert queue + reporting deadlines + analyses
 *
 * Props from {@link \App\Http\Controllers\DashboardController::index}:
 * - total_alerts, high_alerts, pending_ltkm, flagged_today  (numeric)
 * - alertCount  (sidebar badge)
 *
 * The lower panels (alert queue, deadlines, risk distribution, charts, SLA)
 * are presentational placeholders sized to the reference. They will be wired
 * to real data once the corresponding props are exposed by the controller.
 */
export default function DashboardIndex({
    total_alerts = 0,
    high_alerts = 0,
    pending_ltkm = 0,
    flagged_today = 0,
    alertCount = 0,
}) {
    const kpis = [
        {
            title: 'Total Alerts',
            value: total_alerts,
            icon: Bell,
            color: 'var(--primary)',
            delta: 'aktif sekarang',
            deltaTone: 'flat',
            spark: [40, 55, 48, 62, 58, 70, 65, 80],
        },
        {
            title: 'Alert Tinggi',
            value: high_alerts,
            icon: AlertTriangle,
            color: 'var(--red)',
            delta: 'prioritas tinggi',
            deltaTone: 'down',
            spark: [30, 45, 55, 40, 60, 55, 70, 80],
        },
        {
            title: 'LTKM Pending',
            value: pending_ltkm,
            icon: FileWarning,
            color: 'var(--amber)',
            delta: 'menunggu approval',
            deltaTone: 'flat',
            spark: [60, 70, 65, 80, 55, 75, 68, 72],
        },
        {
            title: 'Transaksi Flagged Hari Ini',
            value: flagged_today,
            icon: ArrowLeftRight,
            color: 'var(--blue)',
            delta: 'akumulasi 24 jam',
            deltaTone: 'up',
            spark: [40, 38, 42, 38, 36, 38, 40, 38],
            sparkHi: 6,
        },
    ];

    // Placeholder rows — wire to real data when controller exposes them.
    const alerts = [
        { id: 'ALT-2026-04781', customer: 'Hartono Wijaya',     cif: 'CIF-7723014', type: 'Anomali Transaksi',          risk: 87, status: 'Baru',         age: '12 mnt' },
        { id: 'ALT-2026-04780', customer: 'PT Karya Bersama',   cif: 'CIF-9012087', type: 'Match DPPSPM (parsial)',     risk: 72, status: 'Investigasi',  age: '1 jam' },
        { id: 'ALT-2026-04779', customer: 'Siti Marlina',       cif: 'CIF-1108455', type: 'Threshold LTKT terlampaui',  risk: 64, status: 'Triage',       age: '2 jam' },
        { id: 'ALT-2026-04778', customer: 'Budi Santoso',       cif: 'CIF-3344219', type: 'PEP — relasi Tier-2',        risk: 58, status: 'Investigasi',  age: '3 jam' },
        { id: 'ALT-2026-04777', customer: 'Linda Pratiwi',      cif: 'CIF-2090331', type: 'Pola transaksi smurfing',    risk: 79, status: 'Eskalasi',     age: '4 jam' },
        { id: 'ALT-2026-04776', customer: 'Rahmat Hidayat',     cif: 'CIF-5566012', type: 'Geografi berisiko',          risk: 51, status: 'Triage',       age: '5 jam' },
    ];

    const deadlines = [
        { d: '08', m: 'Mei', title: 'LTKT Harian → PPATK',           meta: 'Cut-off 16:00 WIB · 12.4k transaksi',     status: 'ok'   },
        { d: '12', m: 'Mei', title: 'Laporan Bulanan ke Direksi',    meta: 'Periode April 2026 · Draft 78%',          status: 'warn' },
        { d: '15', m: 'Mei', title: 'Laporan Triwulanan Nasabah',    meta: 'Q1 2026 · 1.84M nasabah baru',            status: 'warn' },
        { d: '30', m: 'Mei', title: 'Komite Pemantau Risiko',        meta: 'Materi APU PPT · Belum disusun',          status: 'err'  },
    ];

    const sla = [
        { label: 'Triage alert (≤ 4 jam)',           pct: 92, value: '92%',  tone: ''      },
        { label: 'Investigasi tier-1 (≤ 24 jam)',    pct: 86, value: '86%',  tone: 'amber' },
        { label: 'Eskalasi & LTKM (≤ 3 hari)',       pct: 78, value: '78%',  tone: 'amber' },
        { label: 'Update DTTOT (insidental)',        pct: 100,value: '100%', tone: ''      },
    ];

    const alertsHref = (() => { try { return route('alerts.index'); } catch { return '/alerts'; } })();

    return (
        <AppLayout title="Dashboard" alertCount={alertCount}>
            <PageHeader
                title="Dashboard Operasional"
                subtitle={`Ringkasan harian penerapan APU, PPT & PPPSPM · Per ${formatToday()}`}
                actions={
                    <>
                        <button className="btn"><RefreshCw className="ico" size={14} /> Sinkronisasi</button>
                        <button className="btn"><Download className="ico" size={14} /> Ekspor</button>
                        <Link href={(() => { try { return route('cases.create'); } catch { return '/kasus/create'; } })()} className="btn primary">
                            <Plus className="ico" size={14} /> Buat kasus manual
                        </Link>
                    </>
                }
            />

            {/* KPI row */}
            <div className="grid grid-4" style={{ marginBottom: 16 }}>
                {kpis.map(k => (
                    <StatCard key={k.title} {...k} />
                ))}
            </div>

            {/* Main panels: alert queue + deadlines */}
            <div className="grid" style={{ gridTemplateColumns: '1.6fr 1fr', marginBottom: 16 }}>
                <div className="card">
                    <div className="card-head">
                        <div>
                            <h3>Antrian Alert Prioritas Tinggi</h3>
                            <div className="sub">{total_alerts} alert aktif · diurutkan berdasarkan skor risiko</div>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <span className="kbd-hint">Auto-refresh 30s</span>
                            <button className="btn ghost"><Filter className="ico" size={14} /> Filter</button>
                        </div>
                    </div>
                    <div className="card-body tight">
                        <div style={{ overflowX: 'auto' }}>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Nasabah</th>
                                        <th>Tipe</th>
                                        <th>Skor</th>
                                        <th>Status</th>
                                        <th style={{ textAlign: 'right' }}>Usia</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {alerts.map(a => (
                                        <tr key={a.id}>
                                            <td className="mono" style={{ color: 'var(--fg-2)' }}>{a.id}</td>
                                            <td>
                                                <div style={{ fontWeight: 500 }}>{a.customer}</div>
                                                <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>{a.cif}</div>
                                            </td>
                                            <td>{a.type}</td>
                                            <td><RiskBar score={a.risk} /></td>
                                            <td><Badge status={a.status} /></td>
                                            <td className="num">{a.age}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div
                        style={{
                            padding: '10px 16px',
                            borderTop: '1px solid var(--border)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: 12,
                        }}
                    >
                        <span className="muted">Menampilkan {alerts.length} dari {total_alerts}</span>
                        <Link href={alertsHref} className="btn ghost">
                            Lihat semua antrian <ArrowRight className="ico" size={14} />
                        </Link>
                    </div>
                </div>

                <div className="card">
                    <div className="card-head">
                        <h3>Tenggat Pelaporan</h3>
                        <button className="btn ghost"><MoreHorizontal className="ico" size={14} /></button>
                    </div>
                    <div className="card-body tight">
                        {deadlines.map((d, i) => (
                            <div className="deadline" key={i}>
                                <div className="deadline-date">
                                    <strong>{d.d}</strong>
                                    <span>{d.m}</span>
                                </div>
                                <div className="meta">
                                    <strong>{d.title}</strong>
                                    <span>{d.meta}</span>
                                </div>
                                <span className={`status ${d.status}`}>
                                    <span className="dot" />
                                    {d.status === 'ok' ? 'Sesuai' : d.status === 'warn' ? 'Mendekati' : 'Kritis'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Lower row: risk distribution, transaction volume, SLA */}
            <div className="grid grid-3">
                <div className="card">
                    <div className="card-head">
                        <h3>Distribusi Risiko Nasabah</h3>
                        <span className="sub">Snapshot 24 jam</span>
                    </div>
                    <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div className="donut" style={{ '--p': 71, '--c': 'var(--primary)' }}>
                            <span className="lbl">71%</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, fontSize: 12 }}>
                            <RiskRow color="var(--primary)" label="Rendah"   value="71%" />
                            <RiskRow color="var(--amber)"   label="Menengah" value="27%" />
                            <RiskRow color="var(--red)"     label="Tinggi"   value="2%"  />
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    paddingTop: 6,
                                    borderTop: '1px solid var(--border)',
                                }}
                            >
                                <span className="muted">Belum di-skor</span>
                                <span className="mono">—</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-head">
                        <h3>Volume Transaksi 24 Jam</h3>
                        <span className="tag">5 mnt</span>
                    </div>
                    <div className="card-body">
                        <div className="chart-ph">
                            <svg
                                viewBox="0 0 320 160"
                                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
                                preserveAspectRatio="none"
                            >
                                <path
                                    d="M0,120 C30,100 50,80 80,90 C110,100 130,60 160,55 C190,50 210,30 240,40 C270,50 290,70 320,55 L320,160 L0,160 Z"
                                    fill="var(--primary-soft)"
                                />
                                <path
                                    d="M0,120 C30,100 50,80 80,90 C110,100 130,60 160,55 C190,50 210,30 240,40 C270,50 290,70 320,55"
                                    fill="none"
                                    stroke="var(--primary)"
                                    strokeWidth="2"
                                />
                            </svg>
                        </div>
                        <div
                            className="muted mono"
                            style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11 }}
                        >
                            <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-head">
                        <h3>SLA Tim AML/CFT</h3>
                        <span className="tag green">On Track</span>
                    </div>
                    <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {sla.map(s => (
                            <div key={s.label}>
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        fontSize: 12,
                                        marginBottom: 6,
                                    }}
                                >
                                    <span>{s.label}</span>
                                    <span className="mono" style={{ fontWeight: 600 }}>{s.value}</span>
                                </div>
                                <div className={`bar ${s.tone}`}>
                                    <i style={{ width: `${s.pct}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

/* ---------- Local helpers ---------- */
function RiskBar({ score = 0, max = 100 }) {
    const pct = Math.min(100, Math.max(0, (score / max) * 100));
    const color = score >= 75 ? 'var(--risk-high)' : score >= 50 ? 'var(--risk-med)' : 'var(--risk-low)';
    return (
        <span className="risk">
            <span className="risk-bar"><i style={{ width: `${pct}%`, background: color }} /></span>
            <span style={{ color, fontWeight: 600 }}>{score}</span>
        </span>
    );
}

function RiskRow({ color, label, value }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>
                <span
                    style={{
                        display: 'inline-block',
                        width: 8,
                        height: 8,
                        borderRadius: 2,
                        background: color,
                        marginRight: 6,
                    }}
                />
                {label}
            </span>
            <span className="mono">{value}</span>
        </div>
    );
}

function formatToday() {
    try {
        const d = new Date();
        const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        const hh = String(d.getHours()).padStart(2, '0');
        const mm = String(d.getMinutes()).padStart(2, '0');
        return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}, ${hh}:${mm} WIB`;
    } catch {
        return '—';
    }
}
