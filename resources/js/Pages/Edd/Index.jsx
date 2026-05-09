import { useState, useCallback } from 'react';
import { Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/PageHeader';
import StatCard from '@/Components/StatCard';
import MasterDetail from '@/Components/MasterDetail';
import RiskPill from '@/Components/RiskPill';
import Badge from '@/Components/Badge';
import Tag from '@/Components/Tag';
import EddDetailPanel from './_DetailPanel';
import {
    Plus, Search, FileSearch, Clock, CheckCircle2, XCircle, Inbox,
} from 'lucide-react';

const TABS = [
    { id: 'queue',    label: 'Antrian' },
    { id: 'active',   label: 'Sedang Berjalan' },
    { id: 'approved', label: 'Approved' },
    { id: 'rejected', label: 'Rejected' },
];

const STATUS_BADGE = {
    pending:     { status: 'baru',        label: 'Pending' },
    in_progress: { status: 'investigasi', label: 'Berjalan' },
    review:      { status: 'investigasi', label: 'Review' },
    approved:    { status: 'selesai',     label: 'Approved' },
    completed:   { status: 'selesai',     label: 'Selesai' },
    rejected:    { status: 'eskalasi',    label: 'Rejected' },
};

function eddRiskLevel(score) {
    const n = Number(score) || 0;
    if (n >= 70) return 'high';
    if (n >= 50) return 'med';
    return 'low';
}

function fmtShort(value) {
    if (!value) return '—';
    return new Date(value).toLocaleDateString('id-ID', {
        day: '2-digit', month: 'short',
    });
}

/**
 * @param {{
 *   edd_cases: { data: object[], links: object[], meta: object },
 *   edd_selected?: object | null,
 *   summary?: { active?: number, pending_approval?: number, avg_duration?: number, rejected?: number },
 *   filters?: { search?: string, tab?: string, selected?: number|string },
 * }} props
 */
export default function EddIndex({
    edd_cases = { data: [], links: [], meta: {} },
    edd_selected = null,
    summary = {},
    filters = {},
}) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [tab,    setTab]    = useState(filters.tab    ?? 'queue');

    const list = edd_cases?.data ?? [];
    const selectedId = edd_selected?.id
        ?? filters.selected
        ?? list[0]?.id
        ?? null;

    const selectedRow = edd_selected
        ?? list.find(e => String(e.id) === String(selectedId))
        ?? null;

    const applyFilters = useCallback((overrides = {}) => {
        const params = {
            search:   overrides.search   ?? search,
            tab:      overrides.tab      ?? tab,
            selected: overrides.selected ?? selectedId,
        };
        Object.keys(params).forEach(k => {
            if (params[k] === '' || params[k] == null) delete params[k];
        });
        router.get(route('edd.index'), params, {
            preserveState:  true,
            preserveScroll: true,
            replace:        true,
        });
    }, [search, tab, selectedId]);

    function selectEdd(id) {
        router.get(
            route('edd.index'),
            {
                search: search || undefined,
                tab,
                selected: id,
            },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    }

    const stats = [
        { title: 'EDD Aktif',          value: summary.active           ?? 0, icon: FileSearch,   color: 'var(--blue)' },
        { title: 'Menunggu Approval',  value: summary.pending_approval ?? 0, icon: Clock,        color: 'var(--amber)' },
        {
            title: 'Avg Durasi (hari)',
            value: summary.avg_duration ?? 0,
            icon: CheckCircle2,
            color: 'var(--primary)',
        },
        { title: 'Rejected',           value: summary.rejected         ?? 0, icon: XCircle,      color: 'var(--red)' },
    ];

    return (
        <AppLayout title="Enhanced Due Diligence">
            <PageHeader
                title="Enhanced Due Diligence"
                subtitle="Investigasi mendalam untuk nasabah berisiko tinggi"
                actions={
                    <Link href={route('edd.create')} className="btn primary">
                        <Plus size={14} /> EDD Baru
                    </Link>
                }
            />

            {/* Tabs */}
            <div className="tabs" style={{ marginBottom: 12 }}>
                {TABS.map(t => (
                    <button
                        key={t.id}
                        type="button"
                        className={`tab ${tab === t.id ? 'active' : ''}`}
                        onClick={() => { setTab(t.id); applyFilters({ tab: t.id }); }}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

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

            {/* Master / Detail */}
            <MasterDetail masterWidth="340px">
                {/* MASTER */}
                <div className="card">
                    <div className="card-head" style={{ gap: 8 }}>
                        <div style={{ position: 'relative', flex: 1 }}>
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
                                placeholder="Cari nasabah / EDD ID…"
                                style={{
                                    width: '100%',
                                    padding: '6px 8px 6px 26px',
                                    fontSize: 12,
                                    background: 'var(--surface-2)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 6,
                                    color: 'var(--fg)',
                                    outline: 'none',
                                }}
                            />
                        </div>
                    </div>

                    {/* List */}
                    <div className="card-body tight" style={{ maxHeight: 600, overflow: 'auto' }}>
                        {list.length === 0 ? (
                            <div
                                style={{
                                    padding: '40px 16px',
                                    textAlign: 'center',
                                    color: 'var(--fg-3)',
                                    fontSize: 12.5,
                                }}
                            >
                                <Inbox size={20} style={{ margin: '0 auto 6px', display: 'block' }} />
                                Belum ada EDD.
                            </div>
                        ) : (
                            list.map(e => {
                                const isSel = String(e.id) === String(selectedId);
                                const score = e.risk_score ?? null;
                                const sev   = score != null ? eddRiskLevel(score) : null;
                                const stat  = STATUS_BADGE[e.status] ?? { status: e.status, label: e.status };

                                return (
                                    <button
                                        key={e.id}
                                        type="button"
                                        onClick={() => selectEdd(e.id)}
                                        style={{
                                            display: 'block',
                                            width: '100%',
                                            textAlign: 'left',
                                            padding: '10px 14px',
                                            border: 0,
                                            borderBottom: '1px solid var(--border)',
                                            background: isSel ? 'var(--primary-soft)' : 'transparent',
                                            cursor: 'pointer',
                                            color: 'var(--fg)',
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                gap: 8,
                                            }}
                                        >
                                            <span className="mono" style={{ fontSize: 11.5, color: 'var(--fg-3)' }}>
                                                {e.edd_id ?? `#${e.id}`}
                                            </span>
                                            <Badge status={stat.status} label={stat.label} />
                                        </div>
                                        <div
                                            style={{
                                                fontSize: 13,
                                                fontWeight: 500,
                                                marginTop: 4,
                                                color: 'var(--fg)',
                                            }}
                                        >
                                            {e.customer?.name ?? '—'}
                                        </div>
                                        {e.trigger_reason && (
                                            <div
                                                className="muted"
                                                style={{
                                                    fontSize: 11.5,
                                                    marginTop: 2,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                {e.trigger_reason}
                                            </div>
                                        )}
                                        <div
                                            style={{
                                                display: 'flex',
                                                gap: 6,
                                                alignItems: 'center',
                                                marginTop: 6,
                                                flexWrap: 'wrap',
                                            }}
                                        >
                                            {sev && <RiskPill level={sev} score={score} />}
                                            {e.stage && <Tag>{e.stage}</Tag>}
                                            <span
                                                style={{
                                                    marginLeft: 'auto',
                                                    fontSize: 11,
                                                    color: 'var(--fg-3)',
                                                }}
                                            >
                                                {fmtShort(e.created_at)}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>

                    {/* Pagination */}
                    {edd_cases?.links?.length > 3 && (
                        <div
                            style={{
                                display: 'flex',
                                gap: 4,
                                padding: '8px 12px',
                                borderTop: '1px solid var(--border)',
                                flexWrap: 'wrap',
                                justifyContent: 'center',
                            }}
                        >
                            {edd_cases.links.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.url ?? '#'}
                                    preserveState
                                    preserveScroll
                                    only={['edd_cases']}
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
                </div>

                {/* DETAIL */}
                {selectedRow ? (
                    <EddDetailPanel edd={selectedRow} variant="panel" />
                ) : (
                    <div className="card">
                        <div
                            className="card-body"
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 8,
                                minHeight: 320,
                                color: 'var(--fg-3)',
                                fontSize: 13,
                            }}
                        >
                            <FileSearch size={28} strokeWidth={1.5} />
                            <span>Pilih EDD untuk lihat detail</span>
                        </div>
                    </div>
                )}
            </MasterDetail>
        </AppLayout>
    );
}
