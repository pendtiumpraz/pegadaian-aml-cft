import { useState, useCallback } from 'react';
import { Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/PageHeader';
import DataTable from '@/Components/DataTable';
import StatCard from '@/Components/StatCard';
import Tag from '@/Components/Tag';
import Badge from '@/Components/Badge';
import Avatar from '@/Components/Avatar';
import HBar from '@/Components/HBar';
import Timeline from '@/Components/Timeline';
import {
    Eye,
    Plus,
    Users,
    ShieldAlert,
    Globe,
    Flame,
    RefreshCw,
    Upload,
    Check,
    X as XIcon,
} from 'lucide-react';

/* Tabs available on Screening / Watchlist page (matches reference screening.jsx) */
const TABS = [
    ['watchlist', 'Watchlist Manager'],
    ['matches',   'Matches Hari Ini'],
    ['pep',       'PEP Database'],
    ['sanctions', 'Sanksi Internasional'],
    ['audit',     'Audit Log Sinkronisasi'],
];

const JENIS_TONE = {
    internal:  'default',
    pep:       'violet',
    sanctions: 'red',
    terrorist: 'red',
};

const JENIS_LABEL = {
    internal:  'Internal',
    pep:       'PEP',
    sanctions: 'Sanksi',
    terrorist: 'Teroris',
};

/**
 * @param {{
 *   entries: { data: object[], links: object[], meta: object },
 *   filters: { search?: string, jenis?: string, is_active?: string },
 *   summary?: { total?: number, pep?: number, sanctions?: number, hits_today?: number },
 * }} props
 */
export default function WatchlistIndex({ entries, filters = {}, summary = {} }) {
    const [tab, setTab]           = useState('watchlist');
    const [search, setSearch]     = useState(filters.search    ?? '');
    const [jenis, setJenis]       = useState(filters.jenis     ?? '');
    const [isActive, setIsActive] = useState(filters.is_active ?? '');

    const applyFilters = useCallback((overrides = {}) => {
        const params = {
            search:    overrides.search    ?? search,
            jenis:     overrides.jenis     ?? jenis,
            is_active: overrides.is_active ?? isActive,
        };
        Object.keys(params).forEach(k => { if (params[k] === '' || params[k] == null) delete params[k]; });
        router.get(route('watchlist.index'), params, { preserveState: true, replace: true });
    }, [search, jenis, isActive]);

    const rows = entries?.data ?? [];

    /* Derived KPI counts (fallback when controller doesn't supply summary) */
    const totalEntries = summary.total      ?? entries?.meta?.total ?? rows.length;
    const totalPep     = summary.pep        ?? rows.filter(r => r.jenis === 'pep' && r.is_active).length;
    const totalSanc    = summary.sanctions  ?? rows.filter(r => (r.jenis === 'sanctions' || r.jenis === 'terrorist') && r.is_active).length;
    const totalHits    = summary.hits_today ?? 0;

    const columns = [
        {
            key: 'nama',
            label: 'Nama',
            render: (val, row) => (
                <Link
                    href={route('watchlist.show', row.id)}
                    style={{ fontWeight: 500, color: 'var(--fg)', fontSize: 12.5 }}
                >
                    {val}
                </Link>
            ),
        },
        {
            key: 'alias_json',
            label: 'Alias',
            render: (val) => {
                let aliases = [];
                try {
                    aliases = Array.isArray(val) ? val : JSON.parse(val ?? '[]');
                } catch { aliases = []; }
                const first = aliases[0];
                const extra = aliases.length - 1;
                if (!first) return <span className="muted">—</span>;
                return (
                    <span style={{ fontSize: 12 }}>
                        {first}
                        {extra > 0 && <span className="muted" style={{ marginLeft: 4, fontSize: 11 }}>+{extra}</span>}
                    </span>
                );
            },
        },
        {
            key: 'jenis',
            label: 'Jenis',
            render: (val) => (
                <Tag tone={JENIS_TONE[val] ?? 'default'}>
                    {JENIS_LABEL[val] ?? val}
                </Tag>
            ),
        },
        {
            key: 'nik',
            label: 'NIK',
            render: (val) => val
                ? <span className="mono" style={{ fontSize: 11.5 }}>{val}</span>
                : <span className="muted">—</span>,
        },
        {
            key: 'kebangsaan',
            label: 'Kebangsaan',
            render: (val) => val ?? <span className="muted">—</span>,
        },
        {
            key: 'sumber',
            label: 'Sumber',
            render: (val) => val
                ? <span style={{ fontSize: 12 }}>{val}</span>
                : <span className="muted">—</span>,
        },
        {
            key: 'is_active',
            label: 'Aktif',
            render: (val, row) => (
                <ToggleSwitch
                    on={!!val}
                    onClick={() => router.put(route('watchlist.toggle', row.id), {}, { preserveScroll: true })}
                />
            ),
        },
        {
            key: 'id',
            label: 'Aksi',
            render: (_val, row) => (
                <Link
                    href={route('watchlist.show', row.id)}
                    className="btn ghost"
                    style={{ padding: '3px 8px', fontSize: 11.5 }}
                >
                    <Eye size={12} /> Detail
                </Link>
            ),
        },
    ];

    return (
        <AppLayout title="Watchlist Management">
            <PageHeader
                title="Watchlist Management"
                subtitle="Screening DTTOT, DPPSPM, PEP, sanksi internasional, dan adverse media"
                actions={
                    <>
                        <button type="button" className="btn">
                            <RefreshCw size={14} /> Sinkron PPATK
                        </button>
                        <button type="button" className="btn">
                            <Upload size={14} /> Upload list
                        </button>
                        <Link href={route('watchlist.create')} className="btn primary">
                            <Plus size={14} /> Tambah Entri
                        </Link>
                    </>
                }
            />

            {/* KPI strip */}
            <div className="grid grid-4" style={{ marginBottom: 16 }}>
                <StatCard
                    title="Total Entries"
                    value={totalEntries.toLocaleString('id-ID')}
                    icon={Users}
                    delta="seluruh sumber watchlist"
                    deltaTone="flat"
                />
                <StatCard
                    title="PEP Aktif"
                    value={totalPep.toLocaleString('id-ID')}
                    icon={ShieldAlert}
                    delta="Politically Exposed"
                    deltaTone="flat"
                />
                <StatCard
                    title="Sanksi"
                    value={totalSanc.toLocaleString('id-ID')}
                    icon={Globe}
                    delta="OFAC + UN + EU + DTTOT"
                    deltaTone="flat"
                />
                <StatCard
                    title="Match Hari Ini"
                    value={totalHits.toLocaleString('id-ID')}
                    icon={Flame}
                    delta="Hits 24 jam terakhir"
                    deltaTone={totalHits > 0 ? 'up' : 'flat'}
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

            {/* Tab content */}
            {tab === 'watchlist' ? (
                <div className="card">
                    <div className="card-head">
                        <h3>Daftar Entri Watchlist</h3>
                        <Tag>{totalEntries.toLocaleString('id-ID')} entri</Tag>
                    </div>

                    <div className="card-body" style={{ paddingBottom: 8 }}>
                        <div
                            className="toolbar"
                            style={{ margin: 0, padding: '8px 0', background: 'transparent', border: 0, borderRadius: 0 }}
                        >
                            <input
                                type="search"
                                className="input"
                                placeholder="Cari nama atau NIK…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && applyFilters({ search: e.target.value })}
                                style={{ minWidth: 240, flex: 1 }}
                            />

                            <select
                                className="input"
                                value={jenis}
                                onChange={e => { setJenis(e.target.value); applyFilters({ jenis: e.target.value }); }}
                                style={{ width: 'auto' }}
                            >
                                <option value="">Semua Jenis</option>
                                <option value="internal">Internal</option>
                                <option value="pep">PEP</option>
                                <option value="sanctions">Sanksi</option>
                                <option value="terrorist">Teroris</option>
                            </select>

                            <select
                                className="input"
                                value={isActive}
                                onChange={e => { setIsActive(e.target.value); applyFilters({ is_active: e.target.value }); }}
                                style={{ width: 'auto' }}
                            >
                                <option value="">Semua Status</option>
                                <option value="1">Aktif</option>
                                <option value="0">Nonaktif</option>
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
                            empty="Belum ada entri yang sesuai dengan filter."
                        />
                    </div>
                </div>
            ) : tab === 'matches' ? (
                <MatchesView />
            ) : tab === 'pep' ? (
                <PepView />
            ) : tab === 'sanctions' ? (
                <SanctionsView />
            ) : tab === 'audit' ? (
                <AuditLogView />
            ) : null}

            {/* Pagination */}
            {entries?.links?.length > 3 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16, flexWrap: 'wrap' }}>
                    {entries.links.map((link, i) => (
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

            {entries?.meta && (
                <p style={{ textAlign: 'center', marginTop: 8, fontSize: 11.5, color: 'var(--fg-3)' }}>
                    Menampilkan {entries.meta.from ?? 0}–{entries.meta.to ?? 0} dari {entries.meta.total ?? 0} entri
                </p>
            )}
        </AppLayout>
    );
}

/* ---------- Sub-tab views (sample data inline) ---------- */

const SOURCE_TONE = {
    'DTTOT':   'red',
    'DPPSPM':  'red',
    'OFAC':    'amber',
    'UN':      'blue',
    'EU':      'blue',
    'PEP':     'violet',
    'Adverse': 'default',
};

function MatchesView() {
    const matches = [
        { tgl: '08/05 09:42', nasabah: 'Hartono Wijaya',     source: 'PEP',     score: 96, reviewer: 'Y. Pramudya',  status: 'investigasi' },
        { tgl: '08/05 09:14', nasabah: 'PT Karya Bersama',   source: 'DPPSPM',  score: 78, reviewer: 'M. Atikah',    status: 'pending' },
        { tgl: '08/05 08:55', nasabah: 'Linda Pratiwi',      source: 'Adverse', score: 88, reviewer: 'Y. Pramudya',  status: 'investigasi' },
        { tgl: '08/05 08:31', nasabah: 'Ahmad Saputra',      source: 'OFAC',    score: 64, reviewer: 'A. Grahad',    status: 'rejected' },
        { tgl: '08/05 08:02', nasabah: 'Roni Hakim',         source: 'PEP',     score: 72, reviewer: 'M. Atikah',    status: 'pending' },
        { tgl: '07/05 16:12', nasabah: 'Bambang Sulistyo',   source: 'UN',      score: 81, reviewer: 'S. Adi',       status: 'investigasi' },
        { tgl: '07/05 14:20', nasabah: 'CV Mitra Sejahtera', source: 'DTTOT',   score: 92, reviewer: 'I. Wahyu',     status: 'investigasi' },
        { tgl: '07/05 11:48', nasabah: 'Siti Nurhaliza',     source: 'EU',      score: 58, reviewer: 'A. Grahad',    status: 'rejected' },
        { tgl: '07/05 10:30', nasabah: 'Joko Widodo',        source: 'PEP',     score: 95, reviewer: 'S. Adi',       status: 'approved' },
        { tgl: '07/05 09:11', nasabah: 'Tantowi Yahya',      source: 'PEP',     score: 89, reviewer: 'Y. Pramudya',  status: 'approved' },
    ];

    const columns = [
        { key: 'tgl',     label: 'Tanggal', render: v => <span className="mono" style={{ fontSize: 11.5 }}>{v}</span> },
        { key: 'nasabah', label: 'Nasabah', render: v => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar name={v} size={22} />
                <span style={{ fontWeight: 500, fontSize: 12.5 }}>{v}</span>
            </div>
        ) },
        { key: 'source',  label: 'Watchlist', render: v => <Tag tone="soft">{v}</Tag> },
        { key: 'score',   label: 'Match Score', render: v => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 120 }}>
                <HBar value={v} style={{ flex: 1 }} tone={v > 85 ? 'red' : v > 70 ? 'amber' : undefined} />
                <span className="mono" style={{ fontSize: 11.5, fontWeight: 600, minWidth: 32, textAlign: 'right' }}>{v}%</span>
            </div>
        ) },
        { key: 'reviewer', label: 'Reviewer', render: v => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Avatar name={v} size={20} />
                <span style={{ fontSize: 11.5 }}>{v}</span>
            </div>
        ) },
        { key: 'status', label: 'Status', render: v => <Badge status={v} /> },
        { key: 'aksi',   label: 'Aksi', render: () => (
            <div style={{ display: 'flex', gap: 4 }}>
                <button className="btn ghost" style={{ padding: '3px 8px', fontSize: 11.5 }}><Check size={11} /> Confirm</button>
                <button className="btn ghost" style={{ padding: '3px 8px', fontSize: 11.5, color: 'var(--fg-3)' }}><XIcon size={11} /> FP</button>
            </div>
        ) },
    ];

    return (
        <div className="card">
            <div className="card-head">
                <h3>Matches Hari Ini</h3>
                <Tag>{matches.length} match</Tag>
            </div>
            <div className="card-body tight">
                <DataTable columns={columns} data={matches} wrapInCard={false} />
            </div>
        </div>
    );
}

function PepView() {
    const peps = [
        { nama: 'Joko Widodo',         posisi: 'Mantan Presiden RI',        kebangsaan: 'Indonesia', status: 'aktif',         updated: '2026-04-12' },
        { nama: 'Megawati Soekarnoputri', posisi: 'Ketua Partai',           kebangsaan: 'Indonesia', status: 'aktif',         updated: '2026-04-08' },
        { nama: 'Prabowo Subianto',    posisi: 'Menteri Pertahanan',        kebangsaan: 'Indonesia', status: 'aktif',         updated: '2026-04-15' },
        { nama: 'Tantowi Yahya',       posisi: 'Mantan Dubes',              kebangsaan: 'Indonesia', status: 'resigned',      updated: '2026-03-20' },
        { nama: 'Sri Mulyani',         posisi: 'Menteri Keuangan',          kebangsaan: 'Indonesia', status: 'aktif',         updated: '2026-04-30' },
        { nama: 'Anies Baswedan',      posisi: 'Mantan Gubernur DKI',       kebangsaan: 'Indonesia', status: 'resigned',      updated: '2026-02-14' },
        { nama: 'Erick Thohir',        posisi: 'Menteri BUMN',              kebangsaan: 'Indonesia', status: 'aktif',         updated: '2026-04-22' },
        { nama: 'Bambang Brodjonegoro',posisi: 'Komisaris BUMN',            kebangsaan: 'Indonesia', status: 'aktif',         updated: '2026-04-01' },
        { nama: 'Setya Novanto',       posisi: 'Mantan Ketua DPR',          kebangsaan: 'Indonesia', status: 'investigated',  updated: '2026-01-10' },
        { nama: 'Najib Razak',         posisi: 'Mantan PM Malaysia',        kebangsaan: 'Malaysia',  status: 'investigated',  updated: '2026-01-05' },
        { nama: 'Rodrigo Duterte',     posisi: 'Mantan Presiden Filipina',  kebangsaan: 'Filipina',  status: 'resigned',      updated: '2026-03-12' },
        { nama: 'Lee Hsien Loong',     posisi: 'Mantan PM Singapura',       kebangsaan: 'Singapura', status: 'resigned',      updated: '2026-03-30' },
    ];

    const columns = [
        { key: 'nama',       label: 'Nama PEP', render: v => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar name={v} size={22} />
                <span style={{ fontWeight: 500, fontSize: 12.5 }}>{v}</span>
            </div>
        ) },
        { key: 'posisi',     label: 'Posisi/Jabatan', render: v => <span style={{ fontSize: 12 }}>{v}</span> },
        { key: 'kebangsaan', label: 'Kebangsaan',     render: v => <Tag>{v}</Tag> },
        { key: 'status',     label: 'Status',         render: v => {
            const tone = v === 'aktif' ? 'red' : v === 'investigated' ? 'amber' : 'default';
            const label = v === 'aktif' ? 'Active' : v === 'investigated' ? 'Investigated' : 'Resigned';
            return <Badge tone={tone}>{label}</Badge>;
        } },
        { key: 'updated',    label: 'Last Updated',   render: v => <span className="mono" style={{ fontSize: 11.5 }}>{v}</span> },
    ];

    return (
        <div className="card">
            <div className="card-head">
                <h3>PEP Database</h3>
                <Tag>{peps.length} entri</Tag>
            </div>
            <div className="card-body tight">
                <DataTable columns={columns} data={peps} wrapInCard={false} />
            </div>
        </div>
    );
}

function SanctionsView() {
    const sanctions = [
        { source: 'OFAC',   nama: 'Viktor Bout',                 listed: '2024-12-08', reason: 'Arms trafficking',       status: 'aktif', sync: '08/05 06:00' },
        { source: 'UN',     nama: 'Al-Qaeda Affiliate Network',  listed: '2025-02-14', reason: 'Terrorism financing',    status: 'aktif', sync: '08/05 06:00' },
        { source: 'EU',     nama: 'Rosneft Trading SA',          listed: '2025-03-22', reason: 'Sanctions evasion',      status: 'aktif', sync: '07/05 18:00' },
        { source: 'DTTOT',  nama: 'Jamaah Islamiyah operative',  listed: '2024-09-30', reason: 'Terrorism (domestic)',   status: 'aktif', sync: '08/05 06:00' },
        { source: 'DPPSPM', nama: 'PT Sinar Proliferasi',        listed: '2025-01-15', reason: 'WMD proliferation',      status: 'aktif', sync: '08/05 06:00' },
        { source: 'OFAC',   nama: 'Hezbollah Finance Cell',      listed: '2024-11-02', reason: 'Terrorism financing',    status: 'aktif', sync: '08/05 06:00' },
        { source: 'UN',     nama: 'DPRK Maritime Co.',           listed: '2025-04-05', reason: 'Sanctions evasion',      status: 'aktif', sync: '07/05 18:00' },
        { source: 'EU',     nama: 'Belarus State Bank',          listed: '2024-10-18', reason: 'Sanctions',              status: 'aktif', sync: '07/05 18:00' },
        { source: 'DTTOT',  nama: 'JAD Cell East Java',          listed: '2025-02-01', reason: 'Terrorism (domestic)',   status: 'nonaktif', sync: '08/05 06:00' },
        { source: 'OFAC',   nama: 'Wagner Logistics Network',    listed: '2025-03-10', reason: 'Sanctions evasion',      status: 'aktif', sync: '08/05 06:00' },
    ];

    const columns = [
        { key: 'source', label: 'Source', render: v => <Tag tone="soft">{v}</Tag> },
        { key: 'nama',   label: 'Nama',   render: v => <span style={{ fontWeight: 500, fontSize: 12.5 }}>{v}</span> },
        { key: 'listed', label: 'Tanggal Listed', render: v => <span className="mono" style={{ fontSize: 11.5 }}>{v}</span> },
        { key: 'reason', label: 'Alasan', render: v => <span style={{ fontSize: 12 }}>{v}</span> },
        { key: 'status', label: 'Status', render: v => <Badge status={v} /> },
        { key: 'sync',   label: 'Sync Terakhir', render: v => <span className="mono" style={{ fontSize: 11 }}>{v}</span> },
    ];

    return (
        <div className="card">
            <div className="card-head">
                <h3>Sanksi Internasional</h3>
                <Tag>{sanctions.length} entri</Tag>
            </div>
            <div className="card-body tight">
                <DataTable columns={columns} data={sanctions} wrapInCard={false} />
            </div>
        </div>
    );
}

function AuditLogView() {
    const events = [
        { time: '08/05 09:14:22', actor: 'M. Atikah',     action: 'Match Flagged', body: 'PT Karya Bersama → DPPSPM (78%)', type: 'warn' },
        { time: '08/05 06:00:12', actor: 'system',        action: 'Auto Sync',     body: 'DTTOT 412 entri · tidak ada perubahan', type: 'success' },
        { time: '08/05 06:00:08', actor: 'system',        action: 'Auto Sync',     body: 'DPPSPM 1.247 entri · +2 baru', type: 'success' },
        { time: '07/05 23:00:01', actor: 'system',        action: 'Auto Sync',     body: 'OFAC SDN +18 / -4', type: 'success' },
        { time: '07/05 14:32:47', actor: 'M. Atikah',     action: 'Entry Added',   body: 'PEP Domestik · "Erick Thohir"', type: 'info' },
        { time: '07/05 12:18:09', actor: 'I. Wahyu',      action: 'Manual Sync',   body: 'UN Consolidated · konfirmasi 1.019 entri', type: 'info' },
        { time: '07/05 11:42:18', actor: 'Y. Pramudya',   action: 'Match Flagged', body: 'Hartono Wijaya → PEP (96%)', type: 'danger' },
        { time: '07/05 09:11:00', actor: 'S. Adi',        action: 'False Positive', body: 'Linda Pratiwi cleared (Adverse)', type: 'info' },
        { time: '06/05 23:00:00', actor: 'system',        action: 'Auto Sync',     body: 'OFAC + UN + EU sukses', type: 'success' },
        { time: '06/05 14:30:11', actor: 'M. Atikah',     action: 'Entry Updated', body: 'PEP entry "Sri Mulyani" — posisi diperbarui', type: 'info' },
        { time: '05/05 12:00:00', actor: 'system',        action: 'Sync Failed',   body: 'UN Consolidated · timeout setelah 30s', type: 'danger' },
        { time: '05/05 09:48:22', actor: 'A. Grahadwisara', action: 'Entry Added', body: 'Internal watchlist · 3 entri ditambahkan', type: 'info' },
        { time: '04/05 16:08:30', actor: 'I. Wahyu',      action: 'Submit DTTOT',  body: 'Update DTTOT ke OJK · 412 entri', type: 'success' },
        { time: '04/05 11:14:00', actor: 'system',        action: 'Auto Sync',     body: 'EU Sanctions +12 baru', type: 'success' },
        { time: '03/05 09:22:18', actor: 'S. Adi',        action: 'Entry Removed', body: 'Adverse media · 2 entri arsip', type: 'info' },
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
                <h3>Audit Log Sinkronisasi</h3>
                <Tag>{items.length} event</Tag>
            </div>
            <div className="card-body">
                <Timeline items={items} />
            </div>
        </div>
    );
}

/* ---------- Local components ---------- */

/** Reference admin.jsx style toggle switch */
function ToggleSwitch({ on, onClick }) {
    return (
        <label
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
            onClick={(e) => {
                e.preventDefault();
                if (typeof onClick === 'function') onClick(e);
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
        </label>
    );
}
