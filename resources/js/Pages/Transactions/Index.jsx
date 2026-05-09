import { useState, useCallback, useMemo } from 'react';
import { Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/PageHeader';
import DataTable from '@/Components/DataTable';
import StatCard from '@/Components/StatCard';
import HBar from '@/Components/HBar';
import Tag from '@/Components/Tag';
import Badge from '@/Components/Badge';
import {
    Eye, Flag,
    Activity, ShieldAlert, CheckCircle2, FileWarning,
    Bolt, Download, Plus, Filter,
} from 'lucide-react';

const CURRENCY = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

const STATUS_TONE = {
    normal:     'green',
    suspicious: 'red',
    flagged:    'amber',
    reviewed:   'blue',
};

const STATUS_LABEL = {
    normal:     'Normal',
    suspicious: 'Suspicious',
    flagged:    'Flagged',
    reviewed:   'Reviewed',
};

/* Top aturan aktif — sample data until backend exposes */
const TOP_RULES = [
    { id: 'R-LTKT-01',  name: 'Tunai > 500jt',           count: 142, pct: 70 },
    { id: 'R-SMURF-04', name: 'Smurfing pattern',         count:  87, pct: 42 },
    { id: 'R-FREQ-12',  name: 'Frek gadai > 10/30hr',     count:  65, pct: 32 },
    { id: 'R-GEO-09',   name: 'Multi-kota dlm 14hr',      count:  41, pct: 20 },
    { id: 'R-IRA-02',   name: 'IRA Tinggi + tx baru',     count:  28, pct: 14 },
];

/**
 * @param {{
 *   transaksi: { data: object[], links: object[], meta: object },
 *   filters: { search?: string, status?: string, is_suspicious?: string },
 *   summary?: { total_24h?: number, flagged?: number, auto_cleared?: number, escalated?: number },
 * }} props
 */
export default function TransaksiIndex({ transaksi, filters = {}, summary = {} }) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [isSuspicious, setIsSuspicious] = useState(filters.is_suspicious ?? '');

    const applyFilters = useCallback((overrides = {}) => {
        const params = {
            search:        overrides.search        ?? search,
            status:        overrides.status        ?? status,
            is_suspicious: overrides.is_suspicious ?? isSuspicious,
        };
        Object.keys(params).forEach(k => { if (!params[k]) delete params[k]; });
        router.get(route('transactions.index'), params, { preserveState: true, replace: true });
    }, [search, status, isSuspicious]);

    const rows = transaksi?.data ?? [];

    const computed = useMemo(() => ({
        total_24h:    summary.total_24h    ?? '302.4k',
        flagged:      summary.flagged      ?? rows.filter(r => r.status === 'flagged' || r.is_suspicious).length,
        auto_cleared: summary.auto_cleared ?? 924,
        escalated:    summary.escalated    ?? rows.filter(r => r.status === 'reviewed').length,
    }), [summary, rows]);

    const columns = [
        {
            key: 'nomor_transaksi',
            label: 'No. Transaksi',
            render: (val) => <span className="mono" style={{ fontSize: 11 }}>{val}</span>,
        },
        {
            key: 'nasabah',
            label: 'Nasabah',
            render: (_val, row) => row.nasabah
                ? (
                    <Link href={route('customers.show', row.nasabah.id)} style={{ color: 'var(--fg)', fontSize: 12.5, fontWeight: 500 }}>
                        {row.nasabah.nama}
                    </Link>
                )
                : <span className="muted">—</span>,
        },
        { key: 'jenis_transaksi', label: 'Jenis' },
        {
            key: 'jumlah',
            label: 'Jumlah',
            align: 'right',
            render: (val) => (
                <span className="num" style={{ fontWeight: 600 }}>
                    {CURRENCY.format(val)}
                </span>
            ),
        },
        {
            key: 'tanggal_transaksi',
            label: 'Tanggal',
            render: (val) => val
                ? <span className="mono" style={{ fontSize: 11 }}>
                    {new Date(val).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                  </span>
                : <span className="muted">—</span>,
        },
        { key: 'channel', label: 'Channel' },
        {
            key: 'status',
            label: 'Status',
            render: (val) => val
                ? <Badge tone={STATUS_TONE[val]} label={STATUS_LABEL[val] ?? val} />
                : <span className="muted">—</span>,
        },
        {
            key: 'is_suspicious',
            label: 'Suspicious',
            render: (val, row) => {
                const score = row.suspicious_score ?? row.risk_score ?? (val ? 75 : 0);
                if (!val && score < 30) return <span className="muted">—</span>;
                const color = score >= 75 ? 'var(--red)' : score >= 50 ? 'var(--amber)' : 'var(--fg-3)';
                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 120 }}>
                        <HBar value={score} color={color} style={{ width: 60 }} />
                        <span className="mono" style={{ fontSize: 11.5, fontWeight: 600, color }}>
                            {score}
                        </span>
                    </div>
                );
            },
        },
        {
            key: 'rule_triggered',
            label: 'Rule Terpicu',
            render: (val) => val
                ? <Tag tone="mono">{val}</Tag>
                : <span className="muted">—</span>,
        },
        {
            key: 'id',
            label: 'Aksi',
            render: (_val, row) => (
                <div style={{ display: 'flex', gap: 4 }}>
                    <Link
                        href={route('transactions.show', row.id)}
                        className="btn ghost"
                        title="Lihat"
                        style={{ padding: '3px 6px' }}
                    >
                        <Eye size={13} />
                    </Link>
                    <button
                        type="button"
                        className="btn ghost"
                        title="Eskalasi"
                        style={{ padding: '3px 6px' }}
                    >
                        <Flag size={13} />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <AppLayout title="Pemantauan Transaksi">
            <PageHeader
                title="Pemantauan Transaksi"
                subtitle="Anomaly engine v3.2 · 28 rule aktif · Real-time monitoring transaksi nasabah"
                actions={
                    <>
                        <button type="button" className="btn">
                            <Bolt size={14} /> Re-evaluate
                        </button>
                        <button type="button" className="btn">
                            <Download size={14} /> Ekspor
                        </button>
                        <Link href={route('rules.create')} className="btn primary">
                            <Plus size={14} /> Aturan Baru
                        </Link>
                    </>
                }
            />

            {/* KPI strip */}
            <div className="grid grid-4" style={{ marginBottom: 16 }}>
                <StatCard
                    title="Total Tx 24 Jam"
                    value={computed.total_24h}
                    icon={Activity}
                    delta="−1.2% vs hari sebelumnya"
                    deltaTone="down"
                />
                <StatCard
                    title="Flagged"
                    value={computed.flagged.toLocaleString('id-ID')}
                    icon={ShieldAlert}
                    delta="+8% vs kemarin"
                    deltaTone="up"
                />
                <StatCard
                    title="Auto-Cleared"
                    value={computed.auto_cleared.toLocaleString('id-ID')}
                    icon={CheckCircle2}
                    delta="74% rate"
                    deltaTone="up"
                />
                <StatCard
                    title="Diteruskan ke Kasus"
                    value={computed.escalated.toLocaleString('id-ID')}
                    icon={FileWarning}
                    delta="3.7% conversion"
                    deltaTone="flat"
                />
            </div>

            {/* 2-col chart row: Volume + Top rules */}
            <div className="grid" style={{ gridTemplateColumns: '1fr 320px', marginBottom: 16 }}>
                <div className="card">
                    <div className="card-head">
                        <h3>Volume Transaksi 24 Jam</h3>
                        <div style={{ display: 'flex', gap: 6 }}>
                            <Tag tone="green">● Volume</Tag>
                            <Tag tone="red">● Anomali</Tag>
                        </div>
                    </div>
                    <div className="card-body">
                        <div className="chart-ph" style={{ height: 200, position: 'relative' }}>
                            <svg
                                viewBox="0 0 600 180"
                                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
                                preserveAspectRatio="none"
                            >
                                <path
                                    d="M0,140 C40,130 70,110 100,115 C150,125 180,90 230,85 C280,80 310,55 360,65 C410,75 440,40 490,55 C540,70 570,90 600,75 L600,180 L0,180 Z"
                                    fill="var(--primary-soft)"
                                    opacity="0.7"
                                />
                                <path
                                    d="M0,140 C40,130 70,110 100,115 C150,125 180,90 230,85 C280,80 310,55 360,65 C410,75 440,40 490,55 C540,70 570,90 600,75"
                                    fill="none"
                                    stroke="var(--primary)"
                                    strokeWidth="2"
                                />
                                <path
                                    d="M0,160 L100,155 L200,140 L300,120 L350,90 L400,100 L500,60 L600,70"
                                    fill="none"
                                    stroke="var(--red)"
                                    strokeWidth="1.5"
                                    strokeDasharray="5 3"
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
                        <h3>Top Aturan Aktif</h3>
                    </div>
                    <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {TOP_RULES.map(r => (
                            <div
                                key={r.id}
                                style={{ display: 'grid', gridTemplateColumns: '1fr 50px', gap: 8, alignItems: 'center' }}
                            >
                                <div style={{ minWidth: 0 }}>
                                    <div style={{ fontSize: 12, fontWeight: 500 }}>{r.name}</div>
                                    <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-3)' }}>{r.id}</div>
                                    <HBar value={r.pct} style={{ marginTop: 4 }} />
                                </div>
                                <span className="mono" style={{ fontSize: 13, fontWeight: 600, textAlign: 'right' }}>
                                    {r.count}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Toolbar + Table */}
            <div className="card">
                <div className="card-head">
                    <h3>Daftar Transaksi</h3>
                    <Tag>{transaksi?.meta?.total ?? rows.length} transaksi</Tag>
                </div>

                <div className="card-body" style={{ paddingBottom: 8 }}>
                    <div
                        className="toolbar"
                        style={{ margin: 0, padding: '8px 0', background: 'transparent', border: 0, borderRadius: 0 }}
                    >
                        <input
                            type="search"
                            className="input"
                            placeholder="Cari nomor transaksi atau nasabah…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && applyFilters({ search: e.target.value })}
                            style={{ minWidth: 240, flex: 1 }}
                        />

                        <select
                            className="input"
                            value={status}
                            onChange={e => { setStatus(e.target.value); applyFilters({ status: e.target.value }); }}
                            style={{ width: 'auto' }}
                        >
                            <option value="">Semua Status</option>
                            <option value="normal">Normal</option>
                            <option value="suspicious">Suspicious</option>
                            <option value="flagged">Flagged</option>
                            <option value="reviewed">Reviewed</option>
                        </select>

                        <select
                            className="input"
                            value={isSuspicious}
                            onChange={e => { setIsSuspicious(e.target.value); applyFilters({ is_suspicious: e.target.value }); }}
                            style={{ width: 'auto' }}
                        >
                            <option value="">Semua</option>
                            <option value="1">Suspicious Saja</option>
                            <option value="0">Normal Saja</option>
                        </select>

                        <span className="spacer" />

                        <button type="button" className="btn ghost">
                            <Filter size={14} /> Filter Lanjutan
                        </button>
                    </div>
                </div>

                <div className="card-body tight">
                    <DataTable
                        columns={columns}
                        data={rows}
                        wrapInCard={false}
                        empty="Belum ada transaksi yang sesuai dengan filter."
                    />
                </div>
            </div>

            {/* Pagination */}
            {transaksi?.links?.length > 3 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16, flexWrap: 'wrap' }}>
                    {transaksi.links.map((link, i) => (
                        <Link
                            key={i}
                            href={link.url ?? '#'}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                            className={`btn ${link.active ? 'primary' : ''}`}
                            style={{
                                padding: '4px 10px',
                                fontSize: 12,
                                pointerEvents: link.url ? 'auto' : 'none',
                                opacity: link.url ? 1 : 0.45,
                            }}
                        />
                    ))}
                </div>
            )}

            {transaksi?.meta && (
                <p style={{ textAlign: 'center', marginTop: 8, fontSize: 11.5, color: 'var(--fg-3)' }}>
                    Menampilkan {transaksi.meta.from ?? 0}–{transaksi.meta.to ?? 0} dari {transaksi.meta.total ?? 0} transaksi
                </p>
            )}
        </AppLayout>
    );
}
