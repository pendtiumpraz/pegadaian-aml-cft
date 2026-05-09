import { useState, useCallback, useMemo } from 'react';
import { Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/PageHeader';
import DataTable from '@/Components/DataTable';
import StatCard from '@/Components/StatCard';
import HBar from '@/Components/HBar';
import Avatar from '@/Components/Avatar';
import Tag from '@/Components/Tag';
import Badge from '@/Components/Badge';
import {
    Plus, Eye, Users, Award, BookOpen, GraduationCap, Download,
} from 'lucide-react';

const STATUS_TONE = {
    planned:   'blue',
    ongoing:   'amber',
    completed: 'green',
    cancelled: 'default',
};

const STATUS_LABEL = {
    planned:   'Direncanakan',
    ongoing:   'Berjalan',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
};

const JENIS_TONE = {
    online:   'blue',
    offline:  'amber',
    seminar:  'violet',
    workshop: 'green',
};

const JENIS_LABEL = {
    online:   'Online',
    offline:  'Offline',
    seminar:  'Seminar',
    workshop: 'Workshop',
};

/* Hard-coded sample data for "expiring certifications" panel + "kampanye awareness" cards
   until backend exposes them. Same shape as reference training.jsx. */
const EXPIRING = [
    { name: 'Susetyo Adi',         cert: 'CAMS · ACAMS',         days: 12, tone: 'amber' },
    { name: 'Yugo Pramudya M.',    cert: 'CFCS · ACFCS',         days: 21, tone: 'amber' },
    { name: 'Mucharromatul A.',    cert: 'Internal AML L2',      days:  8, tone: 'red'   },
    { name: 'Agastya G.',          cert: 'PEP Specialist',       days: 26, tone: 'amber' },
    { name: 'Reni Halimah',        cert: 'Internal AML L1',      days: 30, tone: 'amber' },
];

const CAMPAIGNS = [
    { title: 'Kenali Red Flag Smurfing',    channel: 'Email + Poster outlet', reach: '18.4k', status: 'Berlangsung', end: '20 Mei 2026' },
    { title: 'Update DTTOT Bulan Mei',      channel: 'Internal portal',       reach: '20.1k', status: 'Berlangsung', end: '31 Mei 2026' },
    { title: 'Workshop Pegadaian Digital',  channel: 'Webinar live',          reach: '1.2k',  status: 'Mendatang',   end: '15 Mei 2026' },
];

/**
 * @param {{
 *   trainings: { data: object[], links: object[], meta: object },
 *   filters: { search?: string, status?: string, jenis?: string },
 *   summary?: { trained?: number, frontliner?: number, certs?: number, modules?: number },
 * }} props
 */
export default function PelatihanIndex({ trainings, filters = {}, summary = {} }) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [jenis, setJenis]   = useState(filters.jenis  ?? '');

    const applyFilters = useCallback((overrides = {}) => {
        const params = {
            search: overrides.search ?? search,
            status: overrides.status ?? status,
            jenis:  overrides.jenis  ?? jenis,
        };
        Object.keys(params).forEach(k => { if (!params[k]) delete params[k]; });
        router.get(route('training.index'), params, { preserveState: true, replace: true });
    }, [search, status, jenis]);

    const rows = trainings?.data ?? [];

    const computed = useMemo(() => ({
        trained:    summary.trained    ?? 18224,
        frontliner: summary.frontliner ?? 11802,
        certs:      summary.certs      ?? 847,
        modules:    summary.modules    ?? rows.length,
    }), [summary, rows.length]);

    const columns = [
        {
            key: 'judul',
            label: 'Modul',
            render: (val, row) => (
                <div>
                    <Link href={route('training.show', row.id)} style={{ fontWeight: 500, color: 'var(--fg)', fontSize: 12.5 }}>
                        {val ?? row.name ?? '—'}
                    </Link>
                    {row.penyelenggara && (
                        <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>{row.penyelenggara}</div>
                    )}
                </div>
            ),
        },
        {
            key: 'jenis',
            label: 'Jenis',
            render: (val) => val
                ? <Tag tone={JENIS_TONE[val] ?? 'default'}>{JENIS_LABEL[val] ?? val}</Tag>
                : <span className="muted">—</span>,
        },
        {
            key: 'tanggal',
            label: 'Tanggal',
            render: (val) => val
                ? <span className="mono" style={{ fontSize: 11.5 }}>{new Date(val).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                : <span className="muted">—</span>,
        },
        {
            key: 'durasi_jam',
            label: 'Durasi',
            render: (val) => val != null
                ? <span className="num">{val} jam</span>
                : <span className="muted">—</span>,
        },
        {
            key: 'penyelenggara',
            label: 'Penyelenggara',
            render: (val) => val ?? <span className="muted">—</span>,
        },
        {
            key: 'peserta_json',
            label: 'Peserta',
            render: (val, row) => {
                let count = row.peserta_count;
                if (count == null) {
                    try {
                        const arr = Array.isArray(val) ? val : JSON.parse(val ?? '[]');
                        count = arr.length;
                    } catch { count = 0; }
                }
                return (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                        <Users size={12} style={{ color: 'var(--fg-3)' }} />
                        <span className="mono">{count}</span>
                    </span>
                );
            },
        },
        {
            key: 'status',
            label: 'Status',
            render: (val) => val
                ? <Badge tone={STATUS_TONE[val]} label={STATUS_LABEL[val] ?? val} />
                : <span className="muted">—</span>,
        },
        {
            key: 'completion_pct',
            label: 'Progress',
            render: (val) => {
                const pct = val ?? 0;
                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 130 }}>
                        <HBar
                            value={pct}
                            color={pct >= 90 ? 'var(--primary)' : 'var(--amber)'}
                            style={{ width: 80 }}
                        />
                        <span className="mono" style={{ fontSize: 11.5, fontWeight: 600 }}>
                            {pct}%
                        </span>
                    </div>
                );
            },
        },
        {
            key: 'id',
            label: 'Aksi',
            render: (_val, row) => (
                <Link
                    href={route('training.show', row.id)}
                    className="btn ghost"
                    style={{ padding: '3px 8px', fontSize: 11.5 }}
                >
                    <Eye size={12} /> Detail
                </Link>
            ),
        },
    ];

    return (
        <AppLayout title="Pelatihan & Awareness">
            <PageHeader
                title="Pelatihan & Awareness APU PPT"
                subtitle="Program pelatihan, sertifikasi, dan kampanye awareness untuk seluruh karyawan Pegadaian"
                actions={
                    <>
                        <button type="button" className="btn">
                            <Download size={14} /> Laporan Kepatuhan
                        </button>
                        <Link href={route('training.create')} className="btn primary">
                            <Plus size={14} /> Modul Baru
                        </Link>
                    </>
                }
            />

            {/* KPI strip */}
            <div className="grid grid-4" style={{ marginBottom: 16 }}>
                <StatCard
                    title="Karyawan Terlatih"
                    value={computed.trained.toLocaleString('id-ID')}
                    icon={GraduationCap}
                    delta="92.4% completion"
                    deltaTone="up"
                />
                <StatCard
                    title="Frontliner Outlet"
                    value={computed.frontliner.toLocaleString('id-ID')}
                    icon={Users}
                    delta="98.1% completion"
                    deltaTone="up"
                />
                <StatCard
                    title="Sertifikasi Aktif"
                    value={computed.certs.toLocaleString('id-ID')}
                    icon={Award}
                    delta={`${EXPIRING.length} expiring 30 hr`}
                    deltaTone="down"
                />
                <StatCard
                    title="Modul Aktif"
                    value={computed.modules}
                    icon={BookOpen}
                    delta="3 baru kuartal ini"
                    deltaTone="up"
                />
            </div>

            {/* 2-col grid: training table + expiring certifications */}
            <div className="grid" style={{ gridTemplateColumns: '1.6fr 1fr', marginBottom: 16 }}>
                {/* Modul training table */}
                <div className="card">
                    <div className="card-head">
                        <h3>Modul Pelatihan</h3>
                        <Tag>{rows.length} modul</Tag>
                    </div>

                    <div className="card-body" style={{ paddingBottom: 8 }}>
                        <div
                            className="toolbar"
                            style={{ margin: 0, padding: '8px 0', background: 'transparent', border: 0, borderRadius: 0 }}
                        >
                            <input
                                type="search"
                                className="input"
                                placeholder="Cari judul atau penyelenggara…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && applyFilters({ search: e.target.value })}
                                style={{ minWidth: 200, flex: 1 }}
                            />

                            <select
                                className="input"
                                value={status}
                                onChange={e => { setStatus(e.target.value); applyFilters({ status: e.target.value }); }}
                                style={{ width: 'auto' }}
                            >
                                <option value="">Semua Status</option>
                                <option value="planned">Direncanakan</option>
                                <option value="ongoing">Berjalan</option>
                                <option value="completed">Selesai</option>
                                <option value="cancelled">Dibatalkan</option>
                            </select>

                            <select
                                className="input"
                                value={jenis}
                                onChange={e => { setJenis(e.target.value); applyFilters({ jenis: e.target.value }); }}
                                style={{ width: 'auto' }}
                            >
                                <option value="">Semua Jenis</option>
                                <option value="online">Online</option>
                                <option value="offline">Offline</option>
                                <option value="seminar">Seminar</option>
                                <option value="workshop">Workshop</option>
                            </select>
                        </div>
                    </div>

                    <div className="card-body tight">
                        <DataTable
                            columns={columns}
                            data={rows}
                            wrapInCard={false}
                            empty="Belum ada modul pelatihan."
                        />
                    </div>
                </div>

                {/* Expiring certifications */}
                <div className="card">
                    <div className="card-head">
                        <h3>Sertifikasi Mendekati Kadaluarsa</h3>
                        <Tag tone="amber">{EXPIRING.length}</Tag>
                    </div>
                    <div className="card-body tight">
                        {EXPIRING.map((it, i) => (
                            <div className="row" key={i}>
                                <Avatar name={it.name} size={28} />
                                <div className="lead">
                                    <strong>{it.name}</strong>
                                    <span>{it.cert}</span>
                                </div>
                                <Tag tone={it.tone === 'red' ? 'red' : 'amber'}>
                                    {it.days} hari
                                </Tag>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Kampanye Awareness — 3-col mini cards */}
            <div className="card" style={{ marginBottom: 16 }}>
                <div className="card-head">
                    <h3>Kampanye Awareness Aktif</h3>
                    <Tag>{CAMPAIGNS.length} kampanye</Tag>
                </div>
                <div className="card-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                    {CAMPAIGNS.map((c, i) => (
                        <div
                            key={i}
                            style={{
                                padding: 14,
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-lg)',
                                background: 'var(--surface-2)',
                            }}
                        >
                            <Tag tone={c.status === 'Berlangsung' ? 'green' : 'blue'}>{c.status}</Tag>
                            <div style={{ fontWeight: 600, marginTop: 8, fontSize: 13 }}>{c.title}</div>
                            <div style={{ fontSize: 11.5, color: 'var(--fg-3)', marginTop: 4 }}>{c.channel}</div>
                            <div className="divider" style={{ margin: '10px 0' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5 }}>
                                <span className="muted">Reach</span>
                                <span className="mono" style={{ fontWeight: 600 }}>{c.reach}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, marginTop: 4 }}>
                                <span className="muted">Berakhir</span>
                                <span>{c.end}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Pagination for trainings */}
            {trainings?.links?.length > 3 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16, flexWrap: 'wrap' }}>
                    {trainings.links.map((link, i) => (
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

            {trainings?.meta && (
                <p style={{ textAlign: 'center', marginTop: 8, fontSize: 11.5, color: 'var(--fg-3)' }}>
                    Menampilkan {trainings.meta.from ?? 0}–{trainings.meta.to ?? 0} dari {trainings.meta.total ?? 0} pelatihan
                </p>
            )}
        </AppLayout>
    );
}
