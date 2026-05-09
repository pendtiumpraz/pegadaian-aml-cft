import { useMemo, useState } from 'react';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/PageHeader';
import StatCard from '@/Components/StatCard';
import DataTable from '@/Components/DataTable';
import Tag from '@/Components/Tag';
import Badge from '@/Components/Badge';
import Avatar from '@/Components/Avatar';
import {
    Download,
    Plus,
    Eye,
    Send,
    RotateCcw,
    FileText,
    AlertCircle,
    CheckCircle2,
    XCircle,
    Calendar,
    Activity,
} from 'lucide-react';

const TABS = [
    ['ltkt',     'LTKT Harian'],
    ['ltkm',     'LTKM'],
    ['sar',      'SAR'],
    ['schedule', 'Schedule'],
];

const TYPE_TAG = {
    ltkt_harian:     { label: 'LTKT Harian',    tone: 'soft' },
    ltkm_insidental: { label: 'LTKM',           tone: 'risk' },
    lap_bulanan:     { label: 'Bulanan',        tone: 'neutral' },
    lap_triwulanan:  { label: 'Triwulanan',     tone: 'neutral' },
    nasabah_baru:    { label: 'Nasabah Baru',   tone: 'neutral' },
    komite:          { label: 'Komite',         tone: 'neutral' },
    sar:             { label: 'SAR',            tone: 'risk' },
};

/* ---------- Sample fallback ---------- */

const SAMPLE_REPORTS = [
    { id: 1, type: 'ltkt_harian',     recipient: 'PPATK',    period_start: '2026-05-06', period_end: '2026-05-06', item_count: 11842, status: 'submitted', submitted_at: '2026-05-06 16:14', submitted_by: { name: 'I. Wahyu' } },
    { id: 2, type: 'ltkm_insidental', recipient: 'PPATK',    period_start: '2026-05-06', period_end: '2026-05-06', item_count: 2,      status: 'submitted', submitted_at: '2026-05-06 14:02', submitted_by: { name: 'Y. Pramudya' } },
    { id: 3, type: 'ltkt_harian',     recipient: 'PPATK',    period_start: '2026-05-05', period_end: '2026-05-05', item_count: 10224, status: 'submitted', submitted_at: '2026-05-05 16:11', submitted_by: { name: 'I. Wahyu' } },
    { id: 4, type: 'lap_bulanan',     recipient: 'internal', period_start: '2026-04-01', period_end: '2026-04-30', item_count: 1,      status: 'review',    submitted_at: null,             submitted_by: { name: 'S. Adi' } },
    { id: 5, type: 'ltkm_insidental', recipient: 'PPATK',    period_start: '2026-05-07', period_end: '2026-05-07', item_count: 3,      status: 'draft',     submitted_at: null,             submitted_by: { name: 'Y. Pramudya' } },
    { id: 6, type: 'lap_triwulanan',  recipient: 'PPATK',    period_start: '2026-04-01', period_end: '2026-06-30', item_count: 1840000,status: 'draft',     submitted_at: null,             submitted_by: { name: 'S. Adi' } },
    { id: 7, type: 'ltkt_harian',     recipient: 'PPATK',    period_start: '2026-05-04', period_end: '2026-05-04', item_count: 9118,  status: 'submitted', submitted_at: '2026-05-04 16:08', submitted_by: { name: 'I. Wahyu' } },
    { id: 8, type: 'ltkm_insidental', recipient: 'PPATK',    period_start: '2026-04-29', period_end: '2026-04-29', item_count: 1,      status: 'submitted', submitted_at: '2026-04-29 11:20', submitted_by: { name: 'M. Atikah' } },
    { id: 9, type: 'lap_triwulanan',  recipient: 'PPATK',    period_start: '2025-10-01', period_end: '2025-12-31', item_count: 1620000,status: 'submitted', submitted_at: '2026-04-15 16:30', submitted_by: { name: 'S. Adi' } },
];

const SCHEDULE = [
    { date: '08 Mei',  title: 'LTKT Harian',                  to: 'PPATK',    pic: 'I. Wahyu',     critical: true  },
    { date: '12 Mei',  title: 'Laporan Bulanan Direksi',     to: 'Internal', pic: 'S. Adi',       critical: false },
    { date: '15 Mei',  title: 'Lap. Triwulanan Nasabah Baru', to: 'PPATK',    pic: 'S. Adi',       critical: true  },
    { date: '30 Mei',  title: 'Komite Pemantau Risiko',      to: 'Internal', pic: 'I. Wahyu',     critical: false },
    { date: '30 Jun',  title: 'Kepatuhan Terintegrasi',      to: 'BRI Grup', pic: 'A. Grahad',    critical: false },
];

const SYNC_STATUS = [
    { name: 'PPATK API',         status: 'ok',   last: '08/05 06:00', note: 'OAuth refresh OK' },
    { name: 'OJK SFTP',          status: 'ok',   last: '07/05 23:00', note: 'Channel reporting' },
    { name: 'Validator XML',     status: 'ok',   last: 'realtime',     note: 'Schema 2.4 aktif' },
    { name: 'Receipt Listener',  status: 'warn', last: '07/05 22:00', note: 'Polling lag 4 mnt' },
];

/**
 * @param {{
 *   reports?: { data: object[], links?: object[], meta?: object } | object[],
 * }} props
 */
export default function LaporanIndex({ reports }) {
    const [tab, setTab] = useState('ltkt');

    const rows = useMemo(() => {
        const raw = Array.isArray(reports)
            ? reports
            : (reports?.data ?? []);
        if (raw && raw.length > 0) return raw;
        return SAMPLE_REPORTS;
    }, [reports]);

    /* KPI calculations */
    const stats = useMemo(() => {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const inMonth = (r) => {
            const d = r.submitted_at ? new Date(r.submitted_at) : (r.period_start ? new Date(r.period_start) : null);
            return d && d >= monthStart;
        };
        return {
            ltktMonth:      rows.filter(r => r.type === 'ltkt_harian'     && inMonth(r)).length,
            ltkmSubmitted:  rows.filter(r => r.type === 'ltkm_insidental' && r.status === 'submitted').length,
            pendingApproval:rows.filter(r => r.status === 'review').length,
            rejected:       rows.filter(r => r.status === 'rejected').length,
        };
    }, [rows]);

    const filteredRows = useMemo(() => {
        if (tab === 'ltkt')     return rows.filter(r => r.type === 'ltkt_harian');
        if (tab === 'ltkm')     return rows.filter(r => r.type === 'ltkm_insidental');
        if (tab === 'sar')      return rows.filter(r => r.type === 'sar' || r.type === 'ltkm_insidental');
        if (tab === 'schedule') return [];
        return rows;
    }, [rows, tab]);

    const columns = [
        { key: 'type', label: 'Tipe', render: v => {
            const meta = TYPE_TAG[v] ?? { label: v, tone: 'neutral' };
            return <Tag tone={meta.tone}>{meta.label}</Tag>;
        } },
        { key: 'period_start', label: 'Periode', render: (v, row) => (
            <span className="mono" style={{ fontSize: 11.5 }}>
                {fmtDate(v)}{row.period_end && row.period_end !== v ? ` → ${fmtDate(row.period_end)}` : ''}
            </span>
        ) },
        { key: 'recipient', label: 'Penerima', render: v => (
            <Tag tone={v === 'PPATK' ? 'soft' : 'neutral'}>{v}</Tag>
        ) },
        { key: 'item_count', label: 'Records', align: 'right', render: v => (
            <span className="mono num" style={{ fontSize: 12 }}>{Number(v ?? 0).toLocaleString('id-ID')}</span>
        ) },
        { key: 'status', label: 'Status', render: v => <Badge status={v} /> },
        { key: 'submitted_at', label: 'Submitted', render: v => v
            ? <span className="mono" style={{ fontSize: 11 }}>{fmtDateTime(v)}</span>
            : <span className="muted">—</span>
        },
        { key: 'submitted_by', label: 'PIC', render: v => v?.name
            ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Avatar name={v.name} size={20} />
                <span style={{ fontSize: 11.5 }}>{v.name}</span>
              </span>
            : <span className="muted">—</span>
        },
        { key: 'aksi', label: 'Aksi', render: (_v, row) => (
            <div style={{ display: 'flex', gap: 4 }}>
                {row.id != null && (
                    <Link
                        href={safeRoute('reports.show', row.id)}
                        className="btn ghost"
                        style={{ padding: '3px 8px', fontSize: 11.5 }}
                        title="Detail / XML"
                    >
                        <Eye size={11} /> XML
                    </Link>
                )}
                {row.status === 'draft' || row.status === 'review' ? (
                    <button className="btn ghost" style={{ padding: '3px 8px', fontSize: 11.5, color: 'var(--primary-2)' }}>
                        <Send size={11} /> Submit
                    </button>
                ) : row.status === 'rejected' ? (
                    <button className="btn ghost" style={{ padding: '3px 8px', fontSize: 11.5, color: 'var(--amber)' }}>
                        <RotateCcw size={11} /> Resubmit
                    </button>
                ) : null}
            </div>
        ) },
    ];

    return (
        <AppLayout title="Pelaporan Regulator">
            <PageHeader
                title="Pelaporan Regulator"
                subtitle="PPATK · OJK · Bank Indonesia · Internal · BRI Grup"
                actions={
                    <>
                        <button type="button" className="btn">
                            <Download size={14} /> Ekspor
                        </button>
                        <button type="button" className="btn primary">
                            <Plus size={14} /> Generate Report
                        </button>
                    </>
                }
            />

            {/* KPI strip */}
            <div className="grid grid-4" style={{ marginBottom: 16 }}>
                <StatCard
                    title="LTKT Bulan Ini"
                    value={stats.ltktMonth}
                    icon={FileText}
                    delta="harian · cut-off 16:00 WIB"
                    deltaTone="flat"
                />
                <StatCard
                    title="LTKM Submitted"
                    value={stats.ltkmSubmitted}
                    icon={CheckCircle2}
                    delta="diterima PPATK"
                    deltaTone="up"
                />
                <StatCard
                    title="Pending Approval"
                    value={stats.pendingApproval}
                    icon={AlertCircle}
                    delta="menunggu Head AML"
                    deltaTone={stats.pendingApproval > 0 ? 'down' : 'flat'}
                />
                <StatCard
                    title="Rejected"
                    value={stats.rejected}
                    icon={XCircle}
                    delta="perlu resubmit"
                    deltaTone={stats.rejected > 0 ? 'down' : 'flat'}
                />
            </div>

            {/* Tabs */}
            <div className="tabs">
                {TABS.map(([id, label]) => (
                    <button
                        key={id}
                        type="button"
                        className={`tab ${tab === id ? 'active' : ''}`}
                        onClick={() => setTab(id)}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Main content */}
            {tab === 'schedule' ? (
                <ScheduleView />
            ) : (
                <div className="card">
                    <div className="card-head">
                        <h3>Riwayat & Draft</h3>
                        <Tag>{filteredRows.length} laporan</Tag>
                    </div>
                    <div className="card-body tight">
                        <DataTable
                            columns={columns}
                            data={filteredRows}
                            wrapInCard={false}
                            empty="Belum ada laporan untuk filter ini."
                        />
                    </div>
                </div>
            )}

            {/* Bottom 2-col: schedule + sync status */}
            {tab !== 'schedule' && (
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 'var(--gap, 16px)',
                        marginTop: 16,
                    }}
                >
                    <ScheduleCard />
                    <SyncStatusCard />
                </div>
            )}
        </AppLayout>
    );
}

/* ---------- Sub-views ---------- */

function ScheduleView() {
    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 'var(--gap, 16px)',
                alignItems: 'start',
            }}
        >
            <ScheduleCard />
            <SyncStatusCard />
        </div>
    );
}

function ScheduleCard() {
    return (
        <div className="card">
            <div className="card-head">
                <h3 style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <Calendar size={14} /> Schedule Berikutnya
                </h3>
                <Tag>5 deadline</Tag>
            </div>
            <div className="card-body tight">
                {SCHEDULE.map((s, i) => (
                    <div
                        key={i}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: '10px 14px',
                            borderBottom: i === SCHEDULE.length - 1 ? 0 : '1px solid var(--border)',
                        }}
                    >
                        <div style={{ minWidth: 50 }}>
                            <div style={{ fontSize: 11, fontWeight: 600 }}>{s.date.split(' ')[0]}</div>
                            <div style={{ fontSize: 10, color: 'var(--fg-3)', textTransform: 'uppercase' }}>{s.date.split(' ')[1]}</div>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 500, fontSize: 12.5 }}>{s.title}</div>
                            <div className="muted" style={{ fontSize: 11 }}>{s.to}</div>
                        </div>
                        {s.critical && <Tag tone="risk">Kritis</Tag>}
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <Avatar name={s.pic} size={20} />
                            <span style={{ fontSize: 11.5 }}>{s.pic}</span>
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function SyncStatusCard() {
    return (
        <div className="card">
            <div className="card-head">
                <h3 style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <Activity size={14} /> PPATK Sync Status
                </h3>
                <Tag tone="soft">live</Tag>
            </div>
            <div className="card-body tight">
                {SYNC_STATUS.map((s, i) => (
                    <div
                        key={s.name}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            padding: '10px 14px',
                            borderBottom: i === SYNC_STATUS.length - 1 ? 0 : '1px solid var(--border)',
                        }}
                    >
                        <span
                            aria-hidden="true"
                            style={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                background: s.status === 'ok' ? 'var(--primary)' : s.status === 'warn' ? 'var(--amber)' : 'var(--red)',
                            }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 500, fontSize: 12.5 }}>{s.name}</div>
                            <div className="muted" style={{ fontSize: 11 }}>{s.note}</div>
                        </div>
                        <span className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>{s.last}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ---------- Helpers ---------- */

function fmtDate(v) {
    if (!v) return '';
    const d = typeof v === 'string' ? new Date(v) : v;
    if (Number.isNaN(d.getTime())) return String(v);
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtDateTime(v) {
    if (!v) return '';
    const d = typeof v === 'string' ? new Date(v) : v;
    if (Number.isNaN(d.getTime())) return String(v);
    return d.toLocaleString('id-ID', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function safeRoute(name, ...args) {
    try { return route(name, ...args); }
    catch { return '#'; }
}
