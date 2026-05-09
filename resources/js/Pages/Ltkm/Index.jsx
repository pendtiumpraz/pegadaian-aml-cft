import { useState, useMemo } from 'react';
import { Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/PageHeader';
import StatCard from '@/Components/StatCard';
import MasterDetail from '@/Components/MasterDetail';
import Tag from '@/Components/Tag';
import Badge from '@/Components/Badge';
import {
    Plus, FileText, Eye, Send, Save, FileCog, ChevronRight,
    FilePlus2, Clock, CheckCircle2,
} from 'lucide-react';

const CURRENCY = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

const STATUS_TABS = [
    ['',                  'Semua'],
    ['draft',             'Draft'],
    ['analyst_review',    'Analyst Review'],
    ['supervisor_review', 'Supervisor Review'],
    ['submitted',         'Submitted'],
];

const STATUS_TAG_TONE = {
    draft:             'default',
    analyst_review:    'amber',
    supervisor_review: 'blue',
    submitted:         'green',
    rejected:          'red',
};

const STATUS_LABEL = {
    draft:             'Draft',
    analyst_review:    'Analyst',
    supervisor_review: 'Supervisor',
    submitted:         'Submitted',
    rejected:          'Ditolak',
};

/**
 * @param {{
 *   ltkms: { data: object[], links: object[], meta: object },
 *   filters: { search?: string, status?: string },
 *   summary: { draft?: number, review?: number, submitted?: number },
 * }} props
 */
export default function LtkmIndex({ ltkms, filters = {}, summary = {} }) {
    const rows = ltkms?.data ?? [];

    const [activeTab, setActiveTab]   = useState(filters.status ?? '');
    const [activeId, setActiveId]     = useState(rows[0]?.id ?? null);

    const filtered = useMemo(() => {
        if (!activeTab) return rows;
        return rows.filter(r => r.status === activeTab);
    }, [rows, activeTab]);

    const active = useMemo(
        () => filtered.find(r => r.id === activeId) ?? filtered[0] ?? null,
        [filtered, activeId],
    );

    function handleTab(id) {
        setActiveTab(id);
        const params = id ? { status: id } : {};
        router.get(route('ltkm.index'), params, { preserveState: true, replace: true, only: ['ltkms', 'filters'] });
    }

    return (
        <AppLayout title="LTKM Workspace">
            <PageHeader
                title="LTKM Workspace"
                subtitle="Laporan Transaksi Keuangan Mencurigakan · Format XML PPATK · Sebelum submit memerlukan approval Head AML/CFT"
                actions={
                    <>
                        <button type="button" className="btn">
                            <FileCog size={14} /> Template
                        </button>
                        <Link href={route('ltkm.create')} className="btn primary">
                            <Plus size={14} /> Draft Baru
                        </Link>
                    </>
                }
            />

            {/* KPI strip */}
            <div className="grid grid-3" style={{ marginBottom: 16 }}>
                <StatCard
                    title="Draft"
                    value={summary.draft ?? rows.filter(r => r.status === 'draft').length}
                    icon={FilePlus2}
                    delta="Belum direview"
                    deltaTone="flat"
                />
                <StatCard
                    title="Pending Review"
                    value={
                        summary.review
                        ?? rows.filter(r => r.status === 'analyst_review' || r.status === 'supervisor_review').length
                    }
                    icon={Clock}
                    delta="Analyst + Supervisor"
                    deltaTone="flat"
                />
                <StatCard
                    title="Submitted Bulan Ini"
                    value={summary.submitted ?? rows.filter(r => r.status === 'submitted').length}
                    icon={CheckCircle2}
                    delta="Sudah dikirim ke PPATK"
                    deltaTone="up"
                />
            </div>

            {/* Status tabs */}
            <div className="tabs">
                {STATUS_TABS.map(([id, label]) => {
                    const count = id ? rows.filter(r => r.status === id).length : rows.length;
                    return (
                        <button
                            key={id || 'all'}
                            type="button"
                            className={`tab ${activeTab === id ? 'active' : ''}`}
                            onClick={() => handleTab(id)}
                        >
                            {label} <span className="muted" style={{ marginLeft: 4, fontSize: 11 }}>{count}</span>
                        </button>
                    );
                })}
            </div>

            <MasterDetail masterWidth="300px">
                {/* Master — drafts list */}
                <div className="card">
                    <div className="card-head">
                        <h3>Drafts</h3>
                        <Tag>{filtered.length} entri</Tag>
                    </div>
                    <div className="card-body tight">
                        {filtered.length === 0 ? (
                            <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--fg-3)', fontSize: 12 }}>
                                Belum ada LTKM untuk status ini.
                            </div>
                        ) : filtered.map(it => {
                            const isActive = active?.id === it.id;
                            const completion = it.completion_pct ?? 0;
                            return (
                                <div
                                    key={it.id}
                                    className="row"
                                    style={{
                                        cursor: 'pointer',
                                        background: isActive ? 'var(--primary-soft)' : undefined,
                                    }}
                                    onClick={() => setActiveId(it.id)}
                                >
                                    <div className="lead">
                                        <strong style={{ fontSize: 12 }}>
                                            {it.nasabah?.nama ?? it.terlapor_name ?? '—'}
                                        </strong>
                                        <span className="mono">{it.nomor_ltkm ?? it.ltkm_id ?? `LTKM-${it.id}`}</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                                        <Tag tone={STATUS_TAG_TONE[it.status] ?? 'default'}>
                                            {STATUS_LABEL[it.status] ?? it.status}
                                        </Tag>
                                        {completion > 0 && (
                                            <span className="mono" style={{ fontSize: 10, color: 'var(--fg-3)' }}>
                                                {completion}% lengkap
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Detail — Section A-E layout */}
                {active ? (
                    <ActiveDraft ltkm={active} />
                ) : (
                    <div className="card">
                        <div className="card-body" style={{ minHeight: 320, display: 'grid', placeItems: 'center', color: 'var(--fg-3)' }}>
                            <div style={{ textAlign: 'center' }}>
                                <FileText size={32} strokeWidth={1.5} />
                                <div style={{ marginTop: 8, fontSize: 13, fontWeight: 600, color: 'var(--fg)' }}>
                                    Pilih Draft LTKM
                                </div>
                                <p style={{ marginTop: 4, fontSize: 12 }}>
                                    Klik salah satu draft di kiri untuk mulai mengedit, atau buat draft baru.
                                </p>
                                <Link href={route('ltkm.create')} className="btn primary" style={{ marginTop: 14 }}>
                                    <Plus size={14} /> Draft Baru
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </MasterDetail>
        </AppLayout>
    );
}

/* ---------- Active draft viewer ---------- */
function ActiveDraft({ ltkm }) {
    const completion = ltkm.completion_pct ?? 78;
    const tone = STATUS_TAG_TONE[ltkm.status] ?? 'default';
    const label = STATUS_LABEL[ltkm.status] ?? ltkm.status;
    const nasabah = ltkm.nasabah ?? {};

    const formatDate = (val) => val
        ? new Date(val).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
        : '—';

    return (
        <div className="card">
            <div className="card-head" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', flexWrap: 'wrap' }}>
                    <span className="mono" style={{ color: 'var(--fg-3)', fontSize: 12 }}>
                        {ltkm.nomor_ltkm ?? ltkm.ltkm_id ?? `LTKM-${ltkm.id}`}
                    </span>
                    <Tag tone={tone}>{label} · {completion}% lengkap</Tag>
                    <span style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                        <Link href={route('ltkm.show', ltkm.id)} className="btn">
                            <Eye size={14} /> Detail
                        </Link>
                        <button type="button" className="btn">
                            <FileText size={14} /> Pratinjau XML
                        </button>
                        <Link href={route('ltkm.show', ltkm.id)} className="btn primary">
                            <Send size={14} /> Submit
                        </Link>
                    </span>
                </div>
                <h3 style={{ fontSize: 15 }}>
                    LTKM — {nasabah.nama ?? ltkm.terlapor_name ?? '—'}
                    {ltkm.case_type && <span className="muted" style={{ marginLeft: 8 }}>· {ltkm.case_type}</span>}
                </h3>
            </div>

            <div className="card-body">
                <Section title="A. Identitas Pelapor">
                    <Field k="Nama PJK"  v={ltkm.pelapor_pjk ?? 'PT Pegadaian'} />
                    <Field k="No. Lap"   v={<span className="mono">{ltkm.nomor_ltkm ?? ltkm.ltkm_id ?? `LTKM-${ltkm.id}`}</span>} />
                    <Field k="Tanggal"   v={formatDate(ltkm.created_at)} />
                    <Field k="Pelapor"   v={ltkm.analyst?.name ?? ltkm.pelapor_name ?? '—'} />
                </Section>

                <Section title="B. Identitas Nasabah">
                    <Field k="Nama"      v={nasabah.nama ?? ltkm.terlapor_name ?? '—'} />
                    <Field k="NIK"       v={<span className="mono">{nasabah.nik ?? ltkm.terlapor_nik ?? '—'}</span>} />
                    <Field k="CIF"       v={<span className="mono">{nasabah.nomor_nasabah ?? ltkm.terlapor_cif ?? '—'}</span>} />
                    <Field k="Pekerjaan" v={nasabah.pekerjaan ?? ltkm.terlapor_occupation ?? '—'} />
                    <Field k="Alamat"    v={nasabah.alamat ?? ltkm.terlapor_address ?? '—'} />
                    <Field k="Telp"      v={<span className="mono">{nasabah.telepon ?? ltkm.terlapor_phone ?? '—'}</span>} />
                </Section>

                <Section title="C. Detail Transaksi" full>
                    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Tanggal</th>
                                    <th>Tipe</th>
                                    <th>Outlet</th>
                                    <th style={{ textAlign: 'right' }}>Nominal</th>
                                    <th>Pemicu</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(ltkm.transactions ?? []).length === 0 ? (
                                    <tr>
                                        <td colSpan={5} style={{ padding: '14px 12px', textAlign: 'center', color: 'var(--fg-3)', fontSize: 12 }}>
                                            <div>
                                                Total transaksi:{' '}
                                                <span className="mono" style={{ fontWeight: 600 }}>
                                                    {ltkm.jumlah_total ? CURRENCY.format(ltkm.jumlah_total) : '—'}
                                                </span>
                                            </div>
                                            <div style={{ marginTop: 4, fontSize: 11 }}>
                                                Detail transaksi diisi pada halaman edit.
                                            </div>
                                        </td>
                                    </tr>
                                ) : ltkm.transactions.map((tx, i) => (
                                    <tr key={i}>
                                        <td className="mono" style={{ fontSize: 11 }}>
                                            {tx.tanggal_transaksi
                                                ? new Date(tx.tanggal_transaksi).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: '2-digit' })
                                                : '—'}
                                        </td>
                                        <td>{tx.jenis_transaksi ?? '—'}</td>
                                        <td>{tx.outlet ?? tx.channel ?? '—'}</td>
                                        <td className="num">{tx.jumlah ? CURRENCY.format(tx.jumlah) : '—'}</td>
                                        <td className="mono" style={{ fontSize: 11 }}>{tx.rule_triggered ?? '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Section>

                <Section title="D. Indikasi Tindak Pidana" full>
                    <div
                        style={{
                            padding: 12,
                            fontSize: 12.5,
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius)',
                            background: 'var(--surface-2)',
                            color: 'var(--fg)',
                            minHeight: 120,
                            whiteSpace: 'pre-wrap',
                            lineHeight: 1.6,
                        }}
                    >
                        {ltkm.indikasi_tindak_pidana ?? ltkm.narrative ?? <span className="muted">Belum diisi.</span>}
                    </div>
                </Section>

                <Section title="E. Tindakan Pelaporan">
                    <Field k="Status"      v={<Tag tone={tone}>{label}</Tag>} />
                    <Field k="Analis"      v={ltkm.analyst?.name ?? '—'} />
                    <Field k="Supervisor"  v={ltkm.supervisor?.name ?? ltkm.approver?.name ?? '—'} />
                    <Field k="Submitted"   v={formatDate(ltkm.submitted_at)} />
                </Section>

                {/* Validation footer */}
                <div
                    style={{
                        display: 'flex',
                        gap: 8,
                        paddingTop: 16,
                        borderTop: '1px solid var(--border)',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                    }}
                >
                    <Tag tone="green">● Validasi schema PPATK OK</Tag>
                    <Tag tone={ltkm.status === 'supervisor_review' || ltkm.status === 'submitted' ? 'green' : 'amber'}>
                        {ltkm.status === 'supervisor_review' || ltkm.status === 'submitted' ? '✓ Approval Head' : '⚠ Memerlukan approval Head'}
                    </Tag>
                    <span style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                        <button type="button" className="btn">
                            <Save size={14} /> Simpan Draft
                        </button>
                        <button type="button" className="btn">
                            <FileText size={14} /> Preview XML
                        </button>
                        <Link href={route('ltkm.show', ltkm.id)} className="btn primary">
                            Submit ke PPATK <ChevronRight size={14} />
                        </Link>
                    </span>
                </div>
            </div>
        </div>
    );
}

/* ---------- Section / Field helpers ---------- */
function Section({ title, children, full }) {
    return (
        <div style={{ marginBottom: 18 }}>
            <div
                style={{
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: 0.06,
                    color: 'var(--fg-3)',
                    marginBottom: 10,
                }}
            >
                {title}
            </div>
            {full ? children : (
                <div className="field-list" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px 24px' }}>
                    {children}
                </div>
            )}
        </div>
    );
}

function Field({ k, v }) {
    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: '120px 1fr',
                gap: 8,
                fontSize: 12.5,
                padding: '5px 0',
                borderBottom: '1px solid var(--border)',
            }}
        >
            <span style={{ color: 'var(--fg-3)' }}>{k}</span>
            <span>{v ?? <span className="muted">—</span>}</span>
        </div>
    );
}
