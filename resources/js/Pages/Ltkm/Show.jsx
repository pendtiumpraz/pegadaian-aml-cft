import { Link, router, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/PageHeader';
import RightRail from '@/Components/RightRail';
import Stepper from '@/Components/Stepper';
import Tag from '@/Components/Tag';
import Badge from '@/Components/Badge';
import {
    ChevronLeft, FileText, Send, UserCheck, Save,
    ChevronRight, FolderOpen, User,
} from 'lucide-react';

const CURRENCY = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

const STATUS_TONE = {
    draft:             'default',
    analyst_review:    'amber',
    supervisor_review: 'blue',
    submitted:         'green',
    rejected:          'red',
};

const STATUS_LABEL = {
    draft:             'Draft',
    analyst_review:    'Review Analis',
    supervisor_review: 'Review Supervisor',
    submitted:         'Terkirim ke PPATK',
    rejected:          'Ditolak',
};

/**
 * @param {{ ltkm: object, nasabah?: object, kasus?: object }} props
 */
export default function LtkmShow({ ltkm, nasabah, kasus }) {
    const { auth } = usePage().props;
    const authId = auth?.user?.id;

    const tone  = STATUS_TONE[ltkm.status]  ?? 'default';
    const label = STATUS_LABEL[ltkm.status] ?? ltkm.status;

    const isAnalyst = authId && ltkm.analyst_id && authId === ltkm.analyst_id;

    const canSendToAnalystReview = ltkm.status === 'draft'           && isAnalyst;
    const canSendToSupervisor    = ltkm.status === 'analyst_review'  && isAnalyst;
    const canSubmitToPpatk       = ltkm.status === 'supervisor_review' && authId !== ltkm.analyst_id;

    function updateStatus(newStatus) {
        const labels = {
            analyst_review:    'Kirim ke Review Analis?',
            supervisor_review: 'Kirim ke Supervisor untuk review?',
            submitted:         'Submit LTKM ini ke PPATK? Tindakan ini tidak dapat dibatalkan.',
        };
        if (!confirm(labels[newStatus] ?? `Ubah status ke ${newStatus}?`)) return;
        router.put(route('ltkm.update', ltkm.id), { status: newStatus });
    }

    function submitToPpatk() {
        if (!confirm('Submit LTKM ini ke PPATK? Tindakan ini tidak dapat dibatalkan.')) return;
        router.post(route('ltkm.submit', ltkm.id));
    }

    const formatDate = (val, withTime = false) => {
        if (!val) return '—';
        const d = new Date(val);
        return d.toLocaleDateString('id-ID', {
            day: '2-digit', month: 'long', year: 'numeric',
            ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
        });
    };

    const isFinished = ltkm.status === 'submitted' || ltkm.status === 'rejected';

    /* 4-eyes approval steps */
    const steps = [
        {
            label: 'Penyusunan Analis',
            sub: ltkm.analyst?.name ?? 'Menunggu',
            status: ['analyst_review', 'supervisor_review', 'submitted'].includes(ltkm.status)
                ? 'done'
                : (ltkm.status === 'draft' ? 'current' : 'pending'),
        },
        {
            label: 'Review Supervisor',
            sub: ltkm.supervisor?.name ?? ltkm.approver?.name ?? 'Menunggu',
            status: ['supervisor_review', 'submitted'].includes(ltkm.status)
                ? 'done'
                : (ltkm.status === 'analyst_review' ? 'current' : 'pending'),
        },
        {
            label: 'Dikirim ke PPATK',
            sub: ltkm.submitted_at ? formatDate(ltkm.submitted_at) : 'Menunggu',
            status: ltkm.status === 'submitted' ? 'done' : (ltkm.status === 'supervisor_review' ? 'current' : 'pending'),
        },
    ];

    return (
        <AppLayout title={`LTKM ${ltkm.nomor_ltkm ?? ltkm.ltkm_id ?? ''}`}>
            <PageHeader
                title={`LTKM ${ltkm.nomor_ltkm ?? ltkm.ltkm_id ?? ''}`}
                subtitle={`Laporan Transaksi Keuangan Mencurigakan${nasabah?.nama ? ` — ${nasabah.nama}` : ''}`}
                meta={<Tag tone={tone}>{label}</Tag>}
                actions={
                    <Link href={route('ltkm.index')} className="btn">
                        <ChevronLeft size={14} /> Kembali
                    </Link>
                }
            />

            {/* Approval flow */}
            <div className="card" style={{ marginBottom: 16 }}>
                <div className="card-head">
                    <h3>Alur Persetujuan (4-eyes)</h3>
                    <Tag tone={tone}>{label}</Tag>
                </div>
                <div className="card-body">
                    <Stepper steps={steps} />

                    {!isFinished && (
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                            {canSendToAnalystReview && (
                                <button type="button" className="btn primary" onClick={() => updateStatus('analyst_review')}>
                                    <UserCheck size={14} /> Kirim ke Review
                                </button>
                            )}
                            {canSendToSupervisor && (
                                <button type="button" className="btn primary" onClick={() => updateStatus('supervisor_review')}>
                                    <UserCheck size={14} /> Kirim ke Supervisor
                                </button>
                            )}
                            {canSubmitToPpatk && (
                                <button type="button" className="btn primary" onClick={submitToPpatk}>
                                    <Send size={14} /> Submit ke PPATK
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <RightRail railWidth="320px">
                {/* Main: Section A-E layout */}
                <div className="card">
                    <div className="card-head" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', flexWrap: 'wrap' }}>
                            <span className="mono" style={{ color: 'var(--fg-3)', fontSize: 12 }}>
                                {ltkm.nomor_ltkm ?? ltkm.ltkm_id ?? `LTKM-${ltkm.id}`}
                            </span>
                            <Tag tone={tone}>{label}</Tag>
                            <span style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                                <button type="button" className="btn">
                                    <FileText size={14} /> Pratinjau XML
                                </button>
                            </span>
                        </div>
                        <h3 style={{ fontSize: 15 }}>
                            LTKM — {nasabah?.nama ?? ltkm.terlapor_name ?? '—'}
                        </h3>
                    </div>

                    <div className="card-body">
                        <Section title="A. Identitas Pelapor">
                            <Field k="Nama PJK" v={ltkm.pelapor_pjk ?? 'PT Pegadaian'} />
                            <Field k="No. Lap"  v={<span className="mono">{ltkm.nomor_ltkm ?? ltkm.ltkm_id ?? '—'}</span>} />
                            <Field k="Tanggal"  v={formatDate(ltkm.created_at)} />
                            <Field k="Pelapor"  v={ltkm.analyst?.name ?? ltkm.pelapor_name ?? '—'} />
                        </Section>

                        <Section title="B. Identitas Nasabah">
                            <Field k="Nama"      v={nasabah?.nama ?? ltkm.terlapor_name ?? '—'} />
                            <Field k="NIK"       v={<span className="mono">{nasabah?.nik ?? ltkm.terlapor_nik ?? '—'}</span>} />
                            <Field k="CIF"       v={<span className="mono">{nasabah?.nomor_nasabah ?? ltkm.terlapor_cif ?? '—'}</span>} />
                            <Field k="Pekerjaan" v={nasabah?.pekerjaan ?? ltkm.terlapor_occupation ?? '—'} />
                            <Field k="Alamat"    v={nasabah?.alamat ?? ltkm.terlapor_address ?? '—'} />
                            <Field k="Telp"      v={<span className="mono">{nasabah?.telepon ?? ltkm.terlapor_phone ?? '—'}</span>} />
                        </Section>

                        <Section title="C. Detail Transaksi" full>
                            <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Tanggal</th>
                                            <th>Tipe</th>
                                            <th>Outlet/Channel</th>
                                            <th style={{ textAlign: 'right' }}>Nominal</th>
                                            <th>Pemicu</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(ltkm.transactions ?? []).length === 0 ? (
                                            <tr>
                                                <td colSpan={5} style={{ padding: '14px 12px', textAlign: 'center', color: 'var(--fg-3)', fontSize: 12 }}>
                                                    Total: <span className="mono" style={{ fontWeight: 600 }}>
                                                        {ltkm.jumlah_total ? CURRENCY.format(ltkm.jumlah_total) : '—'}
                                                    </span>
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

                        {ltkm.ringkasan_transaksi && (
                            <Section title="D.1 Ringkasan Transaksi" full>
                                <div
                                    style={{
                                        padding: 12,
                                        fontSize: 12.5,
                                        border: '1px solid var(--border)',
                                        borderRadius: 'var(--radius)',
                                        background: 'var(--surface-2)',
                                        whiteSpace: 'pre-wrap',
                                        lineHeight: 1.6,
                                    }}
                                >
                                    {ltkm.ringkasan_transaksi}
                                </div>
                            </Section>
                        )}

                        <Section title="E. Tindakan Pelaporan">
                            <Field k="Status"     v={<Tag tone={tone}>{label}</Tag>} />
                            <Field k="Analis"     v={ltkm.analyst?.name ?? '—'} />
                            <Field k="Supervisor" v={ltkm.supervisor?.name ?? ltkm.approver?.name ?? '—'} />
                            <Field k="Submitted"  v={formatDate(ltkm.submitted_at, true)} />
                            {ltkm.periode_mulai && ltkm.periode_selesai && (
                                <Field
                                    k="Periode"
                                    v={`${formatDate(ltkm.periode_mulai)} – ${formatDate(ltkm.periode_selesai)}`}
                                />
                            )}
                            {ltkm.jumlah_total && (
                                <Field
                                    k="Jumlah Total"
                                    v={<span className="mono" style={{ fontWeight: 600 }}>{CURRENCY.format(ltkm.jumlah_total)}</span>}
                                />
                            )}
                        </Section>

                        {/* Footer actions */}
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
                            <Tag tone={['supervisor_review', 'submitted'].includes(ltkm.status) ? 'green' : 'amber'}>
                                {['supervisor_review', 'submitted'].includes(ltkm.status) ? '✓ Approval Head' : '⚠ Memerlukan approval Head'}
                            </Tag>
                            <span style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                                {!isFinished && (
                                    <button type="button" className="btn">
                                        <Save size={14} /> Simpan Draft
                                    </button>
                                )}
                                {canSubmitToPpatk && (
                                    <button type="button" className="btn primary" onClick={submitToPpatk}>
                                        Submit ke PPATK <ChevronRight size={14} />
                                    </button>
                                )}
                            </span>
                        </div>
                    </div>
                </div>

                {/* RightRail */}
                <>
                    {/* Nasabah card */}
                    <div className="card" style={{ marginBottom: 12 }}>
                        <div className="card-head">
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <User size={14} /> Nasabah
                            </h3>
                        </div>
                        <div className="card-body">
                            {nasabah ? (
                                <>
                                    <dl className="field-list">
                                        <dt>No. Nasabah</dt>
                                        <dd className="mono">{nasabah.nomor_nasabah ?? '—'}</dd>
                                        <dt>Nama</dt>
                                        <dd>{nasabah.nama ?? '—'}</dd>
                                        <dt>NIK</dt>
                                        <dd className="mono">{nasabah.nik ?? '—'}</dd>
                                        {nasabah.risk_level && (
                                            <>
                                                <dt>Risk</dt>
                                                <dd><Badge status={nasabah.risk_level} /></dd>
                                            </>
                                        )}
                                    </dl>
                                    <Link
                                        href={route('customers.show', nasabah.id)}
                                        className="btn ghost"
                                        style={{ marginTop: 10, width: '100%', justifyContent: 'space-between' }}
                                    >
                                        Lihat profil <ChevronRight size={14} />
                                    </Link>
                                </>
                            ) : (
                                <p className="muted" style={{ fontSize: 12 }}>
                                    Data nasabah tidak tersedia.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Kasus terkait */}
                    {kasus && (
                        <div className="card">
                            <div className="card-head">
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <FolderOpen size={14} /> Kasus Terkait
                                </h3>
                            </div>
                            <div className="card-body">
                                <dl className="field-list">
                                    <dt>Nomor</dt>
                                    <dd className="mono">{kasus.nomor_kasus ?? '—'}</dd>
                                    <dt>Jenis</dt>
                                    <dd>{kasus.jenis_kasus ?? '—'}</dd>
                                    <dt>Status</dt>
                                    <dd><Badge status={kasus.status} /></dd>
                                </dl>
                                <Link
                                    href={route('cases.show', kasus.id)}
                                    className="btn ghost"
                                    style={{ marginTop: 10, width: '100%', justifyContent: 'space-between' }}
                                >
                                    Lihat kasus <ChevronRight size={14} />
                                </Link>
                            </div>
                        </div>
                    )}
                </>
            </RightRail>
        </AppLayout>
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
