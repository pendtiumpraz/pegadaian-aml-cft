import { useState, useCallback, useMemo } from 'react';
import { Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/PageHeader';
import DataTable from '@/Components/DataTable';
import StatCard from '@/Components/StatCard';
import Tag from '@/Components/Tag';
import Sparkline from '@/Components/Sparkline';
import Badge from '@/Components/Badge';
import Avatar from '@/Components/Avatar';
import Timeline from '@/Components/Timeline';
import {
    Plus, Pencil, Trash2, Download,
    BookOpen, Activity, Target,
    RotateCcw, ArrowUpCircle, FileText,
    Plug, RefreshCw, Settings,
} from 'lucide-react';

const TABS = [
    ['rules',        'Aturan & Threshold'],
    ['roles',        'Roles'],
    ['audit',        'Audit Trail'],
    ['model',        'Model IRA'],
    ['integrations', 'Integrasi'],
];

const CATEGORY_TONE = {
    transaction: 'blue',
    customer:    'amber',
    watchlist:   'red',
    pattern:     'amber',
    pep:         'violet',
    sanctions:   'red',
    risk:        'green',
    ltkt:        'blue',
    anomaly:     'amber',
};

const CATEGORY_LABEL = {
    transaction: 'Transaksi',
    customer:    'Nasabah',
    watchlist:   'Watchlist',
    pattern:     'Pola',
    pep:         'PEP',
    sanctions:   'Sanctions',
    risk:        'Risk',
    ltkt:        'LTKT',
    anomaly:     'Anomaly',
};

/** Deterministic mock spark per rule id (until backend exposes hits trend) */
function sparkFor(seed) {
    const arr = [];
    let v = 30;
    for (let i = 0; i < 8; i++) {
        v += ((seed * 13 + i * 7) % 17) - 8;
        arr.push(Math.max(5, Math.min(100, v)));
    }
    return arr;
}

/**
 * @param {{
 *   rules: { data: object[], links: object[], meta: object },
 *   filters: { search?: string, category?: string, is_active?: string },
 *   summary?: { active?: number, hits_30d?: number, fp_rate?: number },
 * }} props
 */
export default function AturanIndex({ rules, filters = {}, summary = {} }) {
    const [tab, setTab]           = useState('rules');
    const [search, setSearch]     = useState(filters.search    ?? '');
    const [category, setCategory] = useState(filters.category  ?? '');

    const applyFilters = useCallback((overrides = {}) => {
        const params = {
            search:    overrides.search    ?? search,
            category:  overrides.category  ?? category,
        };
        Object.keys(params).forEach(k => { if (params[k] === '' || params[k] == null) delete params[k]; });
        router.get(route('rules.index'), params, { preserveState: true, replace: true });
    }, [search, category]);

    const rows = rules?.data ?? [];

    const totalActive = useMemo(
        () => summary.active ?? rows.filter(r => r.is_active).length,
        [rows, summary.active],
    );

    const totalHits = useMemo(
        () => summary.hits_30d ?? rows.reduce((sum, r) => sum + (r.hits_30d ?? 0), 0),
        [rows, summary.hits_30d],
    );

    const avgFpRate = useMemo(() => {
        if (summary.fp_rate != null) return summary.fp_rate;
        const withRate = rows.filter(r => r.fp_rate != null);
        if (!withRate.length) return 0;
        return Math.round(withRate.reduce((s, r) => s + r.fp_rate, 0) / withRate.length);
    }, [rows, summary.fp_rate]);

    function handleDelete(id, name) {
        if (!confirm(`Hapus aturan "${name}"? Tindakan ini tidak dapat dibatalkan.`)) return;
        router.delete(route('rules.destroy', id));
    }

    function toggleActive(rule) {
        router.put(
            route('rules.toggle', rule.id),
            { is_active: !rule.is_active },
            { preserveScroll: true, preserveState: true },
        );
    }

    const columns = [
        {
            key: 'nama_aturan',
            label: 'Nama Aturan',
            render: (val, row) => (
                <div>
                    <div style={{ fontWeight: 500, fontSize: 12.5 }}>
                        {val ?? row.name ?? '—'}
                    </div>
                    {(row.deskripsi || row.description) && (
                        <div className="muted" style={{ fontSize: 11, marginTop: 2, maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {row.deskripsi ?? row.description}
                        </div>
                    )}
                </div>
            ),
        },
        {
            key: 'category',
            label: 'Kategori',
            render: (val) => (
                <Tag tone={CATEGORY_TONE[val] ?? 'default'}>
                    {CATEGORY_LABEL[val] ?? (val ?? '—')}
                </Tag>
            ),
        },
        {
            key: 'threshold',
            label: 'Threshold',
            render: (val) => val != null
                ? <span className="mono" style={{ fontSize: 11.5 }}>{val}</span>
                : <span className="muted">—</span>,
        },
        {
            key: 'hits_30d',
            label: 'Hits 30hr',
            render: (val, row) => {
                const n = val ?? 0;
                const sp = sparkFor((row.id ?? 1) + 7);
                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Sparkline data={sp} width={56} height={16} />
                        <span className="mono" style={{ fontSize: 12, fontWeight: 600, minWidth: 32, textAlign: 'right' }}>
                            {n.toLocaleString('id-ID')}
                        </span>
                    </div>
                );
            },
        },
        {
            key: 'fp_rate',
            label: 'FP Rate',
            render: (val) => val != null
                ? <span className="num">{val}%</span>
                : <span className="muted">—</span>,
        },
        {
            key: 'version',
            label: 'Versi',
            render: (val) => val
                ? <span className="mono muted" style={{ fontSize: 11 }}>{val}</span>
                : <span className="muted">—</span>,
        },
        {
            key: 'severity',
            label: 'Severity',
            render: (val) => val ? <Badge status={val} /> : <span className="muted">—</span>,
        },
        {
            key: 'is_active',
            label: 'Aktif',
            render: (val, row) => (
                <ToggleSwitch on={!!val} onClick={() => toggleActive(row)} />
            ),
        },
        {
            key: 'id',
            label: 'Aksi',
            render: (_val, row) => (
                <div style={{ display: 'flex', gap: 4 }}>
                    <Link
                        href={route('rules.edit', row.id)}
                        className="btn ghost"
                        title="Edit"
                        style={{ padding: '3px 6px' }}
                    >
                        <Pencil size={13} />
                    </Link>
                    <button
                        type="button"
                        onClick={() => handleDelete(row.id, row.nama_aturan ?? row.name)}
                        className="btn ghost"
                        title="Hapus"
                        style={{ padding: '3px 6px', color: 'var(--red)' }}
                    >
                        <Trash2 size={13} />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <AppLayout title="Aturan Screening">
            <PageHeader
                title="Aturan Screening"
                subtitle="Aturan, threshold, peran, dan jejak audit · Penanggung jawab: Departemen AML CFT"
                actions={
                    <>
                        <button type="button" className="btn">
                            <Download size={14} /> Ekspor Konfig
                        </button>
                        <Link href={route('rules.create')} className="btn primary">
                            <Plus size={14} /> Aturan Baru
                        </Link>
                    </>
                }
            />

            {/* KPI strip */}
            <div className="grid grid-3" style={{ marginBottom: 16 }}>
                <StatCard
                    title="Aturan Aktif"
                    value={totalActive}
                    icon={BookOpen}
                    delta={`${rows.length} total terdaftar`}
                    deltaTone="flat"
                />
                <StatCard
                    title="Hits 30 Hari"
                    value={totalHits.toLocaleString('id-ID')}
                    icon={Activity}
                    delta="Total trigger seluruh aturan"
                    deltaTone="up"
                />
                <StatCard
                    title="Avg FP Rate"
                    value={`${avgFpRate}%`}
                    icon={Target}
                    delta="False-positive rata-rata"
                    deltaTone={avgFpRate > 25 ? 'down' : 'flat'}
                />
            </div>

            {/* Tab strip */}
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

            {tab === 'rules' ? (
                <div className="card">
                    <div className="card-head">
                        <h3>Daftar Aturan</h3>
                        <Tag>{rows.length} aturan</Tag>
                    </div>

                    <div className="card-body" style={{ paddingBottom: 8 }}>
                        <div
                            className="toolbar"
                            style={{ margin: 0, padding: '8px 0', background: 'transparent', border: 0, borderRadius: 0 }}
                        >
                            <input
                                type="search"
                                className="input"
                                placeholder="Cari nama aturan…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && applyFilters({ search: e.target.value })}
                                style={{ minWidth: 240, flex: 1 }}
                            />

                            <select
                                className="input"
                                value={category}
                                onChange={e => { setCategory(e.target.value); applyFilters({ category: e.target.value }); }}
                                style={{ width: 'auto' }}
                            >
                                <option value="">Semua Kategori</option>
                                <option value="transaction">Transaksi</option>
                                <option value="customer">Nasabah</option>
                                <option value="watchlist">Watchlist</option>
                                <option value="pattern">Pola</option>
                                <option value="pep">PEP</option>
                                <option value="sanctions">Sanctions</option>
                            </select>

                            <button type="button" onClick={() => applyFilters()} className="btn primary">
                                Cari
                            </button>
                        </div>
                    </div>

                    <div className="card-body tight">
                        <DataTable
                            columns={columns}
                            data={rows}
                            wrapInCard={false}
                            empty="Belum ada aturan yang sesuai dengan filter."
                        />
                    </div>
                </div>
            ) : tab === 'roles' ? (
                <RolesView />
            ) : tab === 'audit' ? (
                <AuditTrailView />
            ) : tab === 'model' ? (
                <ModelIraView />
            ) : tab === 'integrations' ? (
                <IntegrationsView />
            ) : null}

            {/* Pagination */}
            {rules?.links?.length > 3 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16, flexWrap: 'wrap' }}>
                    {rules.links.map((link, i) => (
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

            {rules?.meta && (
                <p style={{ textAlign: 'center', marginTop: 8, fontSize: 11.5, color: 'var(--fg-3)' }}>
                    Menampilkan {rules.meta.from ?? 0}–{rules.meta.to ?? 0} dari {rules.meta.total ?? 0} aturan
                </p>
            )}
        </AppLayout>
    );
}

/* ---------- Sub-tab views (sample data inline) ---------- */

function RolesView() {
    const roles = [
        { name: 'Head of AML/CFT',     desc: 'Read all · approve LTKM · sign-off laporan',           users: 4,  perms: 38 },
        { name: 'AML/CFT Specialist',  desc: 'Investigasi · eskalasi · draft laporan',               users: 12, perms: 24 },
        { name: 'AML/CFT Analyst',     desc: 'Triage · investigasi tier-1',                          users: 24, perms: 16 },
        { name: 'Reporting Officer',   desc: 'Submit laporan ke regulator',                          users: 6,  perms: 12 },
        { name: 'Auditor (read-only)', desc: 'Read-only seluruh modul + audit log',                  users: 3,  perms: 9  },
        { name: 'Compliance Manager',  desc: 'Manage rules · review · approve override',             users: 5,  perms: 28 },
        { name: 'IT Admin',            desc: 'Manage integrations · users · system settings',        users: 2,  perms: 22 },
        { name: 'Viewer',              desc: 'Read-only dashboard + alerts',                         users: 8,  perms: 5  },
    ];

    const columns = [
        { key: 'name',  label: 'Role',         render: v => <span style={{ fontWeight: 600, fontSize: 12.5 }}>{v}</span> },
        { key: 'desc',  label: 'Deskripsi',    render: v => <span className="muted" style={{ fontSize: 12 }}>{v}</span> },
        { key: 'users', label: 'Pengguna',     render: v => <Tag tone="soft">{v} user</Tag> },
        { key: 'perms', label: 'Permissions',  render: v => <span className="mono" style={{ fontSize: 11.5 }}>{v}</span> },
        { key: 'aksi',  label: 'Aksi',         render: () => (
            <div style={{ display: 'flex', gap: 4 }}>
                <button className="btn ghost" style={{ padding: '3px 6px' }} title="Edit"><Pencil size={13} /></button>
                <button className="btn ghost" style={{ padding: '3px 6px', color: 'var(--red)' }} title="Hapus"><Trash2 size={13} /></button>
            </div>
        ) },
    ];

    return (
        <div className="card">
            <div className="card-head">
                <h3>Roles</h3>
                <Tag>{roles.length} role</Tag>
            </div>
            <div className="card-body tight">
                <DataTable columns={columns} data={roles} wrapInCard={false} />
            </div>
        </div>
    );
}

function AuditTrailView() {
    const events = [
        { time: '08/05 09:42:18', actor: 'Y. Pramudya',     action: 'Update Status', body: 'Cases ALT-2026-04780 → Investigasi',                type: 'info' },
        { time: '08/05 09:38:05', actor: 'S. Adi',          action: 'Approve',       body: 'LTKM-2026050702 disetujui',                          type: 'success' },
        { time: '08/05 09:35:22', actor: 'system',          action: 'Auto Sync',     body: 'Screening · DPPSPM list',                            type: 'info' },
        { time: '08/05 09:28:14', actor: 'M. Atikah',       action: 'Open Case',     body: 'ALT-2026-04779 · alert escalated',                   type: 'info' },
        { time: '08/05 09:14:51', actor: 'I. Wahyu',        action: 'Rule Activated', body: 'R-INR-08 (IRA naik 20+)',                           type: 'warn' },
        { time: '08/05 08:51:09', actor: 'Y. Pramudya',     action: 'View Profile',  body: 'CIF-7723014',                                        type: 'info' },
        { time: '08/05 08:42:33', actor: 'system',          action: 'Trigger Alert', body: 'ALT-2026-04780 · IRA + transaction',                 type: 'warn' },
        { time: '08/05 08:14:00', actor: 'A. Grahadwisara', action: 'Submit Report', body: 'LTKT-2026050614789 ke PPATK',                        type: 'success' },
        { time: '07/05 17:22:40', actor: 'S. Adi',          action: 'User Added',    body: 'New user "rahmat.h@pegadaian.id" · Analyst',         type: 'info' },
        { time: '07/05 16:14:08', actor: 'I. Wahyu',        action: 'Rule Created',  body: 'R-GEO-09 v2.0 · Multi-kota',                         type: 'info' },
        { time: '07/05 14:30:55', actor: 'M. Atikah',       action: 'Role Updated',  body: '"AML Analyst" perms +3',                             type: 'info' },
        { time: '07/05 11:48:12', actor: 'Y. Pramudya',     action: 'Override',      body: 'Alert ALT-2026-04778 · false positive',              type: 'warn' },
        { time: '07/05 09:14:00', actor: 'system',          action: 'Model Deployed',body: 'IRA v3.2 → production',                              type: 'success' },
        { time: '06/05 16:08:30', actor: 'I. Wahyu',        action: 'Config Update', body: 'Threshold R-LTKT-01 ≥ 500jt',                        type: 'info' },
        { time: '06/05 14:02:18', actor: 'A. Grahadwisara', action: 'Approve LTKM',  body: 'LTKM-2026050614781',                                 type: 'success' },
        { time: '06/05 11:30:00', actor: 'S. Adi',          action: 'Permission',    body: 'Granted "Reporting Officer" → I. Wahyu',             type: 'info' },
        { time: '06/05 09:18:42', actor: 'system',          action: 'Auto Sync',     body: 'Screening · DTTOT list',                             type: 'info' },
        { time: '05/05 12:00:00', actor: 'system',          action: 'Sync Failed',   body: 'UN Consolidated · timeout',                          type: 'danger' },
        { time: '05/05 09:48:22', actor: 'M. Atikah',       action: 'Rule Disabled', body: 'R-INR-08 → off (review)',                            type: 'warn' },
        { time: '04/05 23:55:11', actor: 'system',          action: 'DTTOT Update',  body: 'Submit ke OJK · 412 entri',                          type: 'success' },
    ];

    const items = events.map(e => ({
        time:  <span className="mono" style={{ fontSize: 11 }}>{e.time}</span>,
        title: (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <Tag tone={e.type === 'danger' ? 'risk' : 'soft'} size="sm">{e.action}</Tag>
                <span>{e.body}</span>
            </span>
        ),
        actor: (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Avatar name={e.actor} size={18} />
                <span style={{ fontSize: 11.5 }}>{e.actor}</span>
            </span>
        ),
        type: e.type,
    }));

    return (
        <div className="card">
            <div className="card-head">
                <h3>Audit Trail</h3>
                <Tag>{items.length} event</Tag>
            </div>
            <div className="card-body">
                <Timeline items={items} />
            </div>
        </div>
    );
}

function ModelIraView() {
    const versions = [
        {
            version:  'v2.4',
            stage:    'staging',
            tone:     'amber',
            deployed: '2026-04-25',
            accuracy: '0.901',
            fp_rate:  '18%',
            note:     'Re-train Q2 · evaluasi pre-prod sedang berjalan.',
            actions:  ['promote'],
        },
        {
            version:  'v2.3',
            stage:    'production',
            tone:     'green',
            deployed: '2026-04-12',
            accuracy: '0.892',
            fp_rate:  '22%',
            note:     'Model aktif · gradient boosted (15 fitur).',
            actions:  ['rollback'],
        },
        {
            version:  'v2.2',
            stage:    'deprecated',
            tone:     'default',
            deployed: '2026-02-10',
            accuracy: '0.871',
            fp_rate:  '27%',
            note:     'Sudah diganti v2.3 · arsip evaluasi tersedia.',
            actions:  [],
        },
    ];

    return (
        <div className="grid grid-3">
            {versions.map(v => (
                <div key={v.version} className="card">
                    <div className="card-head">
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            IRA {v.version}
                            <Tag tone={v.tone === 'green' ? 'soft' : 'neutral'}>
                                {v.stage}
                            </Tag>
                        </h3>
                    </div>
                    <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', rowGap: 6, fontSize: 12 }}>
                            <span className="muted">Deployed</span>
                            <span className="mono">{v.deployed}</span>
                            <span className="muted">Accuracy</span>
                            <span className="mono">{v.accuracy}</span>
                            <span className="muted">FP rate</span>
                            <span className="mono">{v.fp_rate}</span>
                        </div>
                        <p style={{ fontSize: 11.5, color: 'var(--fg-3)', margin: 0 }}>{v.note}</p>
                        <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                            {v.actions.includes('promote') && (
                                <button className="btn primary" style={{ padding: '4px 10px', fontSize: 11.5 }}>
                                    <ArrowUpCircle size={12} /> Promote
                                </button>
                            )}
                            {v.actions.includes('rollback') && (
                                <button className="btn" style={{ padding: '4px 10px', fontSize: 11.5 }}>
                                    <RotateCcw size={12} /> Rollback
                                </button>
                            )}
                            <button className="btn ghost" style={{ padding: '4px 10px', fontSize: 11.5 }}>
                                <FileText size={12} /> Logs
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function IntegrationsView() {
    const integrations = [
        { name: 'PPATK',         desc: 'Submission LTKT/LTKM + sync DTTOT', status: 'ok',   sync: '08/05 06:00', dot: 'var(--primary)' },
        { name: 'OJK',           desc: 'Channel pelaporan kepatuhan',        status: 'ok',   sync: '07/05 23:00', dot: 'var(--primary)' },
        { name: 'Internal Core', desc: 'Transaction stream Pegadaian (Kafka)', status: 'ok', sync: 'realtime',     dot: 'var(--primary)' },
        { name: 'SIMPEL',        desc: 'Sistem Pelaporan Internal',          status: 'warn', sync: '07/05 14:30', dot: 'var(--amber)' },
        { name: 'NIK Validator', desc: 'DukCapil REST API',                  status: 'ok',   sync: '08/05 05:14', dot: 'var(--primary)' },
        { name: 'DTTOT Sync',    desc: 'PPATK / Densus 88',                  status: 'err',  sync: '06/05 23:00', dot: 'var(--red)' },
    ];

    return (
        <div className="grid grid-3">
            {integrations.map(it => (
                <div key={it.name} className="card">
                    <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span
                                    aria-hidden="true"
                                    style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--surface-3)', display: 'grid', placeItems: 'center', color: 'var(--fg-2)' }}
                                >
                                    <Plug size={14} />
                                </span>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: 13 }}>{it.name}</div>
                                    <div className="muted" style={{ fontSize: 11.5 }}>{it.desc}</div>
                                </div>
                            </div>
                            <span
                                aria-hidden="true"
                                style={{ width: 8, height: 8, borderRadius: '50%', background: it.dot, flexShrink: 0 }}
                                title={it.status}
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11.5 }}>
                            <span className="muted">Sync terakhir</span>
                            <span className="mono">{it.sync}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                            <button className="btn" style={{ padding: '4px 10px', fontSize: 11.5, flex: 1 }}>
                                <RefreshCw size={12} /> Sync Now
                            </button>
                            <button className="btn ghost" style={{ padding: '4px 10px', fontSize: 11.5 }}>
                                <Settings size={12} />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

/* ---------- Local helpers ---------- */
function ToggleSwitch({ on, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer',
                background: 'none',
                border: 'none',
                padding: 0,
                color: 'inherit',
            }}
        >
            <span
                style={{
                    width: 28,
                    height: 16,
                    borderRadius: 8,
                    background: on ? 'var(--primary)' : 'var(--surface-3)',
                    position: 'relative',
                    display: 'inline-block',
                    transition: 'background 0.15s',
                }}
            >
                <span
                    style={{
                        position: 'absolute',
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        background: '#fff',
                        top: 2,
                        left: on ? 14 : 2,
                        transition: 'left 0.15s',
                    }}
                />
            </span>
            <span style={{ fontSize: 11.5 }}>{on ? 'On' : 'Off'}</span>
        </button>
    );
}
