import { useState, useCallback } from 'react';
import { Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/PageHeader';
import StatCard from '@/Components/StatCard';
import DataTable from '@/Components/DataTable';
import RiskPill from '@/Components/RiskPill';
import Badge from '@/Components/Badge';
import HBar from '@/Components/HBar';
import Avatar from '@/Components/Avatar';
import {
    Eye, Stethoscope, XCircle, Bell, Search,
    Clock, CheckCircle2, TrendingUp,
} from 'lucide-react';

/* --------------------------------------------------------------------
   Helpers
   -------------------------------------------------------------------- */

const SEVERITY_LEVEL = {
    low:      'low',
    medium:   'med',
    high:     'high',
    critical: 'high',
};

const STATUS_BADGE = {
    new:            { status: 'baru',        label: 'Baru' },
    triage:         { status: 'investigasi', label: 'Triage' },
    reviewing:      { status: 'investigasi', label: 'Review' },
    investigating:  { status: 'investigasi', label: 'Investigasi' },
    escalated:      { status: 'eskalasi',    label: 'Eskalasi' },
    eskalasi:       { status: 'eskalasi',    label: 'Eskalasi' },
    closed:         { status: 'selesai',     label: 'Selesai' },
    selesai:        { status: 'selesai',     label: 'Selesai' },
    false_positive: { status: 'nonaktif',    label: 'False Positive' },
};

const SEVERITY_OPTIONS = [
    { value: '',         label: 'Semua' },
    { value: 'low',      label: 'Rendah' },
    { value: 'medium',   label: 'Sedang' },
    { value: 'high',     label: 'Tinggi' },
    { value: 'critical', label: 'Kritis' },
];

const STATUS_OPTIONS = [
    { value: '',          label: 'Semua' },
    { value: 'new',       label: 'Baru' },
    { value: 'triage',    label: 'Triage' },
    { value: 'escalated', label: 'Eskalasi' },
    { value: 'closed',    label: 'Selesai' },
];

function fmtDate(value) {
    if (!value) return '—';
    return new Date(value).toLocaleDateString('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric',
    });
}

function severityScoreColor(score) {
    const n = Number(score) || 0;
    if (n >= 70) return 'var(--red)';
    if (n >= 50) return 'var(--amber)';
    return 'var(--primary)';
}

/* --------------------------------------------------------------------
   Page
   -------------------------------------------------------------------- */

/**
 * @param {{
 *   alerts: { data: object[], links: object[], meta: object },
 *   filters?: { severity?: string, status?: string, search?: string },
 *   counts?: { new?: number, reviewing?: number, escalated?: number, closed?: number },
 * }} props
 */
export default function AlertsIndex({
    alerts = { data: [], links: [], meta: {} },
    filters = {},
    counts = {},
}) {
    const [severity, setSeverity] = useState(filters.severity ?? '');
    const [status, setStatus]     = useState(filters.status   ?? '');
    const [search, setSearch]     = useState(filters.search   ?? '');

    const applyFilters = useCallback((overrides = {}) => {
        const params = {
            search:   overrides.search   ?? search,
            severity: overrides.severity ?? severity,
            status:   overrides.status   ?? status,
        };
        Object.keys(params).forEach(k => {
            if (!params[k]) delete params[k];
        });
        router.get(route('alerts.index'), params, {
            preserveState:  true,
            preserveScroll: true,
            replace:        true,
        });
    }, [search, severity, status]);

    const stats = [
        { title: 'New',       value: counts.new        ?? 0, icon: Bell,         color: 'var(--blue)' },
        { title: 'Reviewing', value: counts.reviewing  ?? 0, icon: Clock,        color: 'var(--amber)' },
        { title: 'Escalated', value: counts.escalated  ?? 0, icon: TrendingUp,   color: 'var(--red)' },
        { title: 'Closed',    value: counts.closed     ?? 0, icon: CheckCircle2, color: 'var(--primary)' },
    ];

    const columns = [
        {
            key: 'title',
            label: 'Alert',
            render: (_v, row) => (
                <div>
                    <Link
                        href={route('alerts.show', row.id)}
                        className="mono"
                        style={{ fontSize: 11.5, color: 'var(--fg-3)', textDecoration: 'none' }}
                    >
                        {row.alert_id ?? `#${row.id}`}
                    </Link>
                    <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--fg)', marginTop: 2 }}>
                        {row.type ?? row.title ?? '—'}
                    </div>
                </div>
            ),
        },
        {
            key: 'customer',
            label: 'Nasabah',
            render: (_v, row) => row.customer ? (
                <div>
                    <div style={{ fontSize: 12.5 }}>{row.customer.name}</div>
                    <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>
                        {row.customer.cif}
                    </div>
                </div>
            ) : <span className="muted">—</span>,
        },
        {
            key: 'severity',
            label: 'Severity',
            render: (val) => (
                <RiskPill
                    level={SEVERITY_LEVEL[val] ?? 'low'}
                    score={undefined}
                />
            ),
        },
        {
            key: 'status',
            label: 'Status',
            render: (val) => {
                const m = STATUS_BADGE[val] ?? { status: val, label: val };
                return <Badge status={m.status} label={m.label} />;
            },
        },
        {
            key: 'risk_score',
            label: 'Risk Bar',
            render: (val) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 120 }}>
                    <HBar
                        value={val ?? 0}
                        height={6}
                        color={severityScoreColor(val)}
                        style={{ flex: 1 }}
                    />
                    <span className="mono" style={{ fontSize: 11.5, fontWeight: 600, minWidth: 24, textAlign: 'right' }}>
                        {val ?? 0}
                    </span>
                </div>
            ),
        },
        {
            key: 'assignedTo',
            label: 'Assigned',
            render: (_v, row) => row.assignedTo
                ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Avatar name={row.assignedTo.name} size={22} />
                        <span style={{ fontSize: 12 }}>{row.assignedTo.name}</span>
                    </div>
                )
                : <span className="muted">—</span>,
        },
        {
            key: 'created_at',
            label: 'Created',
            render: (val) => <span className="mono" style={{ fontSize: 11.5 }}>{fmtDate(val)}</span>,
        },
        {
            key: 'id',
            label: 'Aksi',
            align: 'right',
            render: (_v, row) => (
                <div style={{ display: 'inline-flex', gap: 8 }}>
                    <Link
                        href={route('alerts.show', row.id)}
                        title="Lihat detail"
                        style={{ color: 'var(--primary-2)' }}
                    >
                        <Eye size={14} />
                    </Link>
                    {(row.status === 'new' || row.status === 'reviewing') && (
                        <Link
                            href={route('alerts.show', row.id)}
                            title="Triage"
                            style={{ color: 'var(--amber)' }}
                        >
                            <Stethoscope size={14} />
                        </Link>
                    )}
                    {row.status !== 'closed' && row.status !== 'selesai' && (
                        <Link
                            href={route('alerts.show', row.id)}
                            title="Tutup"
                            style={{ color: 'var(--red)' }}
                        >
                            <XCircle size={14} />
                        </Link>
                    )}
                </div>
            ),
        },
    ];

    return (
        <AppLayout title="Alerts Manager">
            <PageHeader
                title="Alerts Manager"
                subtitle="Pantau dan tindaklanjuti alert AML/CFT yang terdeteksi sistem"
            />

            {/* KPI summary */}
            <div className="grid grid-4" style={{ marginBottom: 16 }}>
                {stats.map(s => (
                    <StatCard
                        key={s.title}
                        title={s.title}
                        value={s.value}
                        icon={s.icon}
                        color={s.color}
                    />
                ))}
            </div>

            {/* Toolbar */}
            <div className="card" style={{ marginBottom: 12 }}>
                <div
                    className="card-body"
                    style={{
                        display: 'flex',
                        gap: 10,
                        alignItems: 'center',
                        flexWrap: 'wrap',
                    }}
                >
                    {/* Search */}
                    <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 220 }}>
                        <Search
                            size={13}
                            style={{
                                position: 'absolute',
                                left: 8,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--fg-3)',
                            }}
                        />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && applyFilters({ search: e.target.value })}
                            placeholder="Cari alert / nasabah…"
                            style={{
                                width: '100%',
                                padding: '6px 8px 6px 26px',
                                fontSize: 12.5,
                                background: 'var(--surface-2)',
                                border: '1px solid var(--border)',
                                borderRadius: 6,
                                color: 'var(--fg)',
                                outline: 'none',
                            }}
                        />
                    </div>

                    {/* Severity chips */}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                        <span className="kpi-label" style={{ fontSize: 10.5 }}>Severity</span>
                        {SEVERITY_OPTIONS.map(opt => {
                            const active = severity === opt.value;
                            return (
                                <button
                                    key={opt.value || 'all'}
                                    type="button"
                                    className="tag"
                                    style={{
                                        cursor: 'pointer',
                                        background: active ? 'var(--primary-soft)' : undefined,
                                        color:      active ? 'var(--primary-2)'   : undefined,
                                    }}
                                    onClick={() => { setSeverity(opt.value); applyFilters({ severity: opt.value }); }}
                                >
                                    {opt.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Status chips */}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                        <span className="kpi-label" style={{ fontSize: 10.5 }}>Status</span>
                        {STATUS_OPTIONS.map(opt => {
                            const active = status === opt.value;
                            return (
                                <button
                                    key={opt.value || 'all'}
                                    type="button"
                                    className="tag"
                                    style={{
                                        cursor: 'pointer',
                                        background: active ? 'var(--primary-soft)' : undefined,
                                        color:      active ? 'var(--primary-2)'   : undefined,
                                    }}
                                    onClick={() => { setStatus(opt.value); applyFilters({ status: opt.value }); }}
                                >
                                    {opt.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Table */}
            <DataTable columns={columns} data={alerts?.data ?? []} />

            {/* Pagination */}
            {alerts?.links?.length > 3 && (
                <div
                    style={{
                        display: 'flex',
                        gap: 4,
                        marginTop: 12,
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                    }}
                >
                    {alerts.links.map((link, i) => (
                        <Link
                            key={i}
                            href={link.url ?? '#'}
                            preserveState
                            preserveScroll
                            dangerouslySetInnerHTML={{ __html: link.label }}
                            className="btn"
                            style={{
                                padding: '4px 8px',
                                fontSize: 11,
                                background:  link.active ? 'var(--primary)' : undefined,
                                color:       link.active ? 'var(--fg-inv)' : undefined,
                                borderColor: link.active ? 'var(--primary)' : undefined,
                                opacity: link.url ? 1 : 0.45,
                                pointerEvents: link.url ? 'auto' : 'none',
                            }}
                        />
                    ))}
                </div>
            )}

            {alerts?.meta && (
                <p className="muted" style={{ textAlign: 'center', marginTop: 6, fontSize: 11.5 }}>
                    Menampilkan {alerts.meta.from ?? 0}–{alerts.meta.to ?? 0} dari {alerts.meta.total ?? 0} alert
                </p>
            )}
        </AppLayout>
    );
}
