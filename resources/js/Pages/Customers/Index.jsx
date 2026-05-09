import { useState, useCallback, useMemo } from 'react';
import { Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/PageHeader';
import DataTable from '@/Components/DataTable';
import Badge from '@/Components/Badge';
import RiskPill from '@/Components/RiskPill';
import StatCard from '@/Components/StatCard';
import Tag from '@/Components/Tag';
import {
    Eye,
    Pencil,
    Trash2,
    UserCheck,
    Users,
    ShieldAlert,
    Flame,
    FileSearch,
    Download,
} from 'lucide-react';

const RISK_LABEL = { low: 'Rendah', medium: 'Sedang', high: 'Tinggi', critical: 'Kritis' };
const STATUS_LABEL = { active: 'Aktif', inactive: 'Nonaktif', blocked: 'Diblokir' };

/**
 * @param {{
 *   nasabah: { data: object[], links: object[], meta: object },
 *   filters: { search?: string, risk_level?: string, status?: string },
 *   summary?: { total_active?: number, pep?: number, high_risk?: number, edd_required?: number },
 * }} props
 */
export default function NasabahIndex({ nasabah, filters = {}, summary = {} }) {
    const [search, setSearch]       = useState(filters.search     ?? '');
    const [riskLevel, setRiskLevel] = useState(filters.risk_level ?? '');
    const [status, setStatus]       = useState(filters.status     ?? '');

    const applyFilters = useCallback((overrides = {}) => {
        const params = {
            search:     overrides.search     ?? search,
            risk_level: overrides.risk_level ?? riskLevel,
            status:     overrides.status     ?? status,
        };
        Object.keys(params).forEach(k => { if (!params[k]) delete params[k]; });
        router.get(route('customers.index'), params, { preserveState: true, replace: true });
    }, [search, riskLevel, status]);

    function handleDelete(id, nama) {
        if (!confirm(`Hapus nasabah "${nama}"? Tindakan ini tidak dapat dibatalkan.`)) return;
        router.delete(route('customers.destroy', id));
    }

    // Derived counts (fallback if controller doesn't supply summary)
    const computed = useMemo(() => {
        const rows = nasabah?.data ?? [];
        return {
            total_active: summary.total_active ?? rows.filter(r => r.status === 'active').length,
            pep:          summary.pep          ?? rows.filter(r => r.is_pep).length,
            high_risk:    summary.high_risk    ?? rows.filter(r => ['high', 'critical'].includes(r.risk_level)).length,
            edd_required: summary.edd_required ?? rows.filter(r => r.edd_required).length,
        };
    }, [nasabah?.data, summary]);

    const total = nasabah?.meta?.total ?? (nasabah?.data?.length ?? 0);

    const columns = [
        {
            key: 'nomor_nasabah',
            label: 'No. Nasabah',
            render: (val, row) => (
                <Link
                    href={route('customers.show', row.id)}
                    className="mono"
                    style={{ color: 'var(--primary)', fontWeight: 600 }}
                >
                    {val}
                </Link>
            ),
        },
        {
            key: 'nama',
            label: 'Nama',
            render: (val, row) => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span style={{ fontWeight: 500, color: 'var(--fg)' }}>{val}</span>
                    {row.pekerjaan && (
                        <span className="muted" style={{ fontSize: 11 }}>{row.pekerjaan}</span>
                    )}
                </div>
            ),
        },
        {
            key: 'nik',
            label: 'NIK',
            render: (val) => <span className="mono" style={{ fontSize: 11.5 }}>{val ?? '—'}</span>,
        },
        {
            key: 'risk_level',
            label: 'Risiko',
            render: (val, row) => (
                <RiskPill
                    level={val}
                    score={row.risk_score ?? row.skor_ira}
                    label={RISK_LABEL[val] ?? val}
                />
            ),
        },
        {
            key: 'is_pep',
            label: 'PEP',
            render: (val) => val
                ? <Tag tone="neutral" leading={<ShieldAlert size={11} style={{ color: 'var(--red)' }} />}>PEP</Tag>
                : <span className="muted">—</span>,
        },
        {
            key: 'status',
            label: 'Status',
            render: (val) => (
                <Badge
                    status={val === 'active' ? 'aktif' : val === 'inactive' ? 'nonaktif' : 'eskalasi'}
                    label={STATUS_LABEL[val] ?? val}
                />
            ),
        },
        {
            key: 'id',
            label: 'Aksi',
            render: (_val, row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Link
                        href={route('customers.show', row.id)}
                        style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center' }}
                        title="Lihat detail"
                    >
                        <Eye size={15} />
                    </Link>
                    <Link
                        href={route('customers.edit', row.id)}
                        style={{ color: 'var(--fg-3)', display: 'flex', alignItems: 'center' }}
                        title="Edit"
                    >
                        <Pencil size={15} />
                    </Link>
                    <button
                        onClick={() => handleDelete(row.id, row.nama)}
                        style={{ color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
                        title="Hapus"
                    >
                        <Trash2 size={15} />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <AppLayout title="Nasabah / CDD">
            <PageHeader
                title="Nasabah / CDD"
                subtitle="Customer Due Diligence — daftar nasabah dengan profil risiko AML/CFT"
                actions={
                    <>
                        <button type="button" className="btn">
                            <Download size={14} />
                            Ekspor
                        </button>
                        <Link href={route('customers.create')} className="btn primary">
                            <UserCheck size={14} />
                            Tambah Nasabah
                        </Link>
                    </>
                }
            />

            {/* KPI strip */}
            <div className="grid grid-4" style={{ marginBottom: 16 }}>
                <StatCard
                    title="Nasabah Aktif"
                    value={computed.total_active}
                    icon={Users}
                    delta={`${total} total terdaftar`}
                    deltaTone="flat"
                />
                <StatCard
                    title="PEP Aktif"
                    value={computed.pep}
                    icon={ShieldAlert}
                    delta="Politically Exposed"
                    deltaTone="flat"
                />
                <StatCard
                    title="Risiko Tinggi"
                    value={computed.high_risk}
                    icon={Flame}
                    delta="High + Critical"
                    deltaTone="flat"
                />
                <StatCard
                    title="EDD Required"
                    value={computed.edd_required}
                    icon={FileSearch}
                    delta="Enhanced DD"
                    deltaTone="flat"
                />
            </div>

            {/* Toolbar + table card */}
            <div className="card">
                <div className="card-head">
                    <h3>Daftar Nasabah</h3>
                    <Tag>{total} nasabah</Tag>
                </div>

                <div className="card-body" style={{ paddingBottom: 8 }}>
                    <div
                        className="toolbar"
                        style={{ margin: 0, padding: '8px 0', background: 'transparent', border: 0, borderRadius: 0 }}
                    >
                        <input
                            type="search"
                            className="input"
                            placeholder="Cari nama, NIK, nomor nasabah…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && applyFilters({ search: e.target.value })}
                            style={{ minWidth: 240, flex: 1 }}
                        />

                        <select
                            className="input"
                            value={riskLevel}
                            onChange={e => { setRiskLevel(e.target.value); applyFilters({ risk_level: e.target.value }); }}
                            style={{ width: 'auto' }}
                        >
                            <option value="">Semua Risk Level</option>
                            <option value="low">Rendah</option>
                            <option value="medium">Sedang</option>
                            <option value="high">Tinggi</option>
                            <option value="critical">Kritis</option>
                        </select>

                        <select
                            className="input"
                            value={status}
                            onChange={e => { setStatus(e.target.value); applyFilters({ status: e.target.value }); }}
                            style={{ width: 'auto' }}
                        >
                            <option value="">Semua Status</option>
                            <option value="active">Aktif</option>
                            <option value="inactive">Nonaktif</option>
                            <option value="blocked">Diblokir</option>
                        </select>

                        <button type="button" onClick={() => applyFilters()} className="btn primary">
                            Cari
                        </button>
                    </div>
                </div>

                <div className="card-body tight">
                    <DataTable
                        columns={columns}
                        data={nasabah?.data ?? []}
                        wrapInCard={false}
                        empty="Belum ada nasabah yang sesuai dengan filter."
                    />
                </div>
            </div>

            {/* Pagination */}
            {nasabah?.links?.length > 3 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16, flexWrap: 'wrap' }}>
                    {nasabah.links.map((link, i) => (
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

            {nasabah?.meta && (
                <p style={{ textAlign: 'center', marginTop: 8, fontSize: 11.5, color: 'var(--fg-3)' }}>
                    Menampilkan {nasabah.meta.from ?? 0}–{nasabah.meta.to ?? 0} dari {nasabah.meta.total ?? 0} nasabah
                </p>
            )}
        </AppLayout>
    );
}
