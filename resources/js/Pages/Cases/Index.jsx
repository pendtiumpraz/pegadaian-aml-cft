import { useState, useCallback } from 'react';
import { Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/PageHeader';
import StatCard from '@/Components/StatCard';
import MasterDetail from '@/Components/MasterDetail';
import RiskPill from '@/Components/RiskPill';
import Tag from '@/Components/Tag';
import Badge from '@/Components/Badge';
import KasusDetailPanel from './_DetailPanel';
import {
    Plus, Search, FolderOpen, TrendingUp, CheckCircle2,
    Inbox, FileSearch,
} from 'lucide-react';

/* --------------------------------------------------------------------
   Static helpers
   -------------------------------------------------------------------- */

const TABS = [
    { id: 'mine',      label: 'Antrian Saya' },
    { id: 'team',      label: 'Tim' },
    { id: 'escalated', label: 'Eskalasi' },
    { id: 'closed',    label: 'Selesai' },
    { id: 'all',       label: 'Semua' },
];

const STATUS_OPTIONS = [
    { value: '',             label: 'Semua' },
    { value: 'open',         label: 'Terbuka' },
    { value: 'investigating',label: 'Investigasi' },
    { value: 'escalated',    label: 'Eskalasi' },
    { value: 'closed',       label: 'Selesai' },
];

function caseStatusKey(state) {
    const s = String(state ?? '').toLowerCase();
    if (s.includes('escal') || s.includes('eskal')) return 'escalated';
    if (s.includes('close') || s.includes('selesai')) return 'closed';
    if (s.includes('invest')) return 'investigating';
    return 'open';
}

function caseStatusLabel(state) {
    const k = caseStatusKey(state);
    return ({
        open:          'Terbuka',
        investigating: 'Investigasi',
        escalated:     'Eskalasi',
        closed:        'Selesai',
    })[k];
}

function caseRiskLevel(score) {
    const n = Number(score) || 0;
    if (n >= 70) return 'high';
    if (n >= 50) return 'med';
    return 'low';
}

function formatShortDate(value) {
    if (!value) return '—';
    return new Date(value).toLocaleDateString('id-ID', {
        day:   '2-digit',
        month: 'short',
    });
}

/* --------------------------------------------------------------------
   Page
   -------------------------------------------------------------------- */

/**
 * @param {{
 *   cases: { data: object[], links: object[], meta: object },
 *   case_selected?: object | null,
 *   summary?: { open?: number, investigating?: number, escalated?: number, closed?: number },
 *   filters?: { search?: string, status?: string, tab?: string, selected?: number|string },
 * }} props
 */
export default function KasusIndex({
    cases = { data: [], links: [], meta: {} },
    case_selected = null,
    summary = {},
    filters = {},
}) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [tab, setTab]       = useState(filters.tab    ?? 'mine');

    const list = cases?.data ?? [];
    const selectedId = case_selected?.id
        ?? filters.selected
        ?? list[0]?.id
        ?? null;

    const selectedRow = case_selected
        ?? list.find(c => String(c.id) === String(selectedId))
        ?? null;

    const applyFilters = useCallback((overrides = {}) => {
        const params = {
            search:   overrides.search   ?? search,
            status:   overrides.status   ?? status,
            tab:      overrides.tab      ?? tab,
            selected: overrides.selected ?? selectedId,
        };
        Object.keys(params).forEach(k => {
            if (params[k] === '' || params[k] == null) delete params[k];
        });
        router.get(route('cases.index'), params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    }, [search, status, tab, selectedId]);

    function selectCase(id) {
        router.get(
            route('cases.index'),
            {
                search:   search   || undefined,
                status:   status   || undefined,
                tab,
                selected: id,
            },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    }

    const stats = [
        { title: 'Open',          value: summary.open          ?? 0, icon: FolderOpen, color: 'var(--blue)' },
        { title: 'Investigating', value: summary.investigating ?? 0, icon: FileSearch, color: 'var(--amber)' },
        { title: 'Escalated',     value: summary.escalated     ?? 0, icon: TrendingUp, color: 'var(--red)' },
        { title: 'Closed',        value: summary.closed        ?? 0, icon: CheckCircle2, color: 'var(--primary)' },
    ];

    return (
        <AppLayout title="Manajemen Kasus">
            <PageHeader
                title="Manajemen Kasus"
                subtitle="Triage, investigasi, dan eskalasi kasus AML/CFT"
                actions={
                    <Link href={route('cases.create')} className="btn primary">
                        <Plus size={14} /> Buat Kasus
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
                {/* MASTER — list */}
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
                                placeholder="Cari nomor kasus / nasabah…"
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

                    {/* Status chips */}
                    <div
                        style={{
                            display: 'flex',
                            gap: 6,
                            padding: '8px 12px',
                            borderBottom: '1px solid var(--border)',
                            flexWrap: 'wrap',
                        }}
                    >
                        {STATUS_OPTIONS.map(opt => {
                            const active = status === opt.value;
                            return (
                                <button
                                    key={opt.value || 'all'}
                                    type="button"
                                    className={`tag ${active ? 'soft' : ''}`}
                                    style={{
                                        cursor: 'pointer',
                                        background: active ? 'var(--primary-soft)' : undefined,
                                        color:      active ? 'var(--primary-2)'   : undefined,
                                        border: '1px solid transparent',
                                    }}
                                    onClick={() => { setStatus(opt.value); applyFilters({ status: opt.value }); }}
                                >
                                    {opt.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Case list */}
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
                                Belum ada kasus.
                            </div>
                        ) : (
                            list.map(c => {
                                const isSel    = String(c.id) === String(selectedId);
                                const statusKey = caseStatusKey(c.state);
                                const score     = c.alert?.risk_score ?? c.risk_score ?? null;
                                const riskLvl   = score != null ? caseRiskLevel(score) : null;

                                return (
                                    <button
                                        key={c.id}
                                        type="button"
                                        onClick={() => selectCase(c.id)}
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
                                                {c.case_id ?? `#${c.id}`}
                                            </span>
                                            <Badge status={statusKey} label={caseStatusLabel(c.state)} />
                                        </div>
                                        <div
                                            style={{
                                                fontSize: 13,
                                                fontWeight: 500,
                                                marginTop: 4,
                                                color: 'var(--fg)',
                                            }}
                                        >
                                            {c.customer?.name ?? c.customer?.cif ?? '—'}
                                        </div>
                                        <div
                                            style={{
                                                display: 'flex',
                                                gap: 6,
                                                alignItems: 'center',
                                                marginTop: 6,
                                                flexWrap: 'wrap',
                                            }}
                                        >
                                            {riskLvl && <RiskPill level={riskLvl} score={score} />}
                                            {c.decision && <Tag>{c.decision}</Tag>}
                                            <span
                                                style={{
                                                    marginLeft: 'auto',
                                                    fontSize: 11,
                                                    color: 'var(--fg-3)',
                                                }}
                                            >
                                                {formatShortDate(c.created_at)}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>

                    {/* Pagination */}
                    {cases?.links?.length > 3 && (
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
                            {cases.links.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.url ?? '#'}
                                    preserveState
                                    preserveScroll
                                    only={['cases']}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className="btn"
                                    style={{
                                        padding: '4px 8px',
                                        fontSize: 11,
                                        background: link.active ? 'var(--primary)' : undefined,
                                        color:      link.active ? 'var(--fg-inv)' : undefined,
                                        borderColor: link.active ? 'var(--primary)' : undefined,
                                        opacity: link.url ? 1 : 0.45,
                                        pointerEvents: link.url ? 'auto' : 'none',
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* DETAIL — persistent panel */}
                {selectedRow ? (
                    <KasusDetailPanel kasus={selectedRow} variant="panel" />
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
                            <FolderOpen size={28} strokeWidth={1.5} />
                            <span>Pilih kasus untuk lihat detail</span>
                        </div>
                    </div>
                )}
            </MasterDetail>
        </AppLayout>
    );
}
