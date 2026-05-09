import { useMemo, useState } from 'react';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/PageHeader';
import RightRail from '@/Components/RightRail';
import Tag from '@/Components/Tag';
import Badge from '@/Components/Badge';
import Avatar from '@/Components/Avatar';
import Timeline from '@/Components/Timeline';
import {
    ArrowLeft,
    Send,
    Download,
    RotateCcw,
    ChevronDown,
    ChevronRight,
    CheckCircle2,
    AlertTriangle,
} from 'lucide-react';

const TYPE_LABEL = {
    ltkt_harian:     'LTKT Harian',
    ltkm_insidental: 'LTKM Insidental',
    lap_bulanan:     'Laporan Bulanan',
    lap_triwulanan:  'Laporan Triwulanan',
    lap_semester:    'Laporan Semester',
    lap_tahunan:     'Laporan Tahunan',
    nasabah_baru:    'Nasabah Baru',
    komite:          'Komite Pemantau',
};

const SAMPLE_XML =
`<?xml version="1.0" encoding="UTF-8"?>
<ppatk:Submission xmlns:ppatk="urn:ppatk:ltkt:v2.4">
    <Header>
        <ReportingEntity code="PEGADAIAN" />
        <SubmissionId>LTKT-2026050614789</SubmissionId>
        <ReportPeriod>2026-05-06</ReportPeriod>
        <GeneratedAt>2026-05-06T16:14:08+07:00</GeneratedAt>
    </Header>
    <Records>
        <!-- 11.842 transaksi -->
        <Record>
            <CIF>CIF-7723014</CIF>
            <Amount currency="IDR">650000000</Amount>
            <ChannelCode>OUTLET-0114</ChannelCode>
            <TransactionTime>2026-05-06T09:42:18+07:00</TransactionTime>
            <Type code="GADAI_BARU" />
        </Record>
        <!-- ... -->
    </Records>
    <Validation>
        <SchemaVersion>2.4</SchemaVersion>
        <RecordCount>11842</RecordCount>
        <Checksum algo="SHA-256">a6f8…b13e</Checksum>
    </Validation>
</ppatk:Submission>`;

const SAMPLE_VALIDATIONS = [
    { ok: true,  label: 'Schema XSD v2.4 valid' },
    { ok: true,  label: 'Checksum SHA-256 cocok' },
    { ok: true,  label: 'CIF mapping seluruh record valid' },
    { ok: false, label: '4 record dengan amount = 0 (warning)' },
    { ok: true,  label: 'Mata uang IDR konsisten' },
];

const SAMPLE_AUDIT = [
    { time: '06/05 16:14:08', actor: 'I. Wahyu',  action: 'Submitted',     body: 'Submit ke PPATK · receipt diterima', type: 'success' },
    { time: '06/05 16:12:30', actor: 'I. Wahyu',  action: 'XML Generated', body: '11.842 record · checksum OK',         type: 'info' },
    { time: '06/05 16:10:00', actor: 'I. Wahyu',  action: 'Validate',      body: 'XSD v2.4 · 4 warning',                type: 'info' },
    { time: '06/05 16:00:00', actor: 'system',    action: 'Aggregate',     body: 'Pull 11.842 transaksi tunai > 500jt', type: 'info' },
];

/**
 * @param {{ report: object }} props
 */
export default function LaporanShow({ report }) {
    const [xmlOpen, setXmlOpen] = useState(false);

    const r = report ?? {};
    const typeLabel = TYPE_LABEL[r.type] ?? r.type ?? 'Laporan';
    const xml = r.xml_payload || SAMPLE_XML;

    const validations = useMemo(() => {
        return SAMPLE_VALIDATIONS;
    }, []);

    const titleMeta = (
        <>
            <Tag tone="soft">{typeLabel}</Tag>
            <Tag tone="neutral">{r.recipient ?? 'PPATK'}</Tag>
            <Badge status={r.status ?? 'submitted'} />
        </>
    );

    return (
        <AppLayout title={`Laporan ${r.report_id ?? ''}`}>
            <PageHeader
                title={`Laporan ${r.report_id ?? '#—'}`}
                subtitle={`${typeLabel} · ${r.recipient ?? 'PPATK'} · periode ${r.period_start ?? '—'}`}
                meta={titleMeta}
                actions={
                    <>
                        <Link href={safeRoute('reports.index')} className="btn ghost">
                            <ArrowLeft size={14} /> Kembali
                        </Link>
                        <button type="button" className="btn">
                            <Download size={14} /> Unduh XML
                        </button>
                        {(r.status === 'draft' || r.status === 'review') && (
                            <button type="button" className="btn primary">
                                <Send size={14} /> Submit ke PPATK
                            </button>
                        )}
                        {r.status === 'rejected' && (
                            <button type="button" className="btn primary">
                                <RotateCcw size={14} /> Resubmit
                            </button>
                        )}
                    </>
                }
            />

            <RightRail
                main={
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {/* Summary card */}
                        <div className="card">
                            <div className="card-head">
                                <h3>Ringkasan Laporan</h3>
                                <Tag tone="soft">id: {r.report_id ?? '—'}</Tag>
                            </div>
                            <div className="card-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                                <Stat label="Tipe"               value={typeLabel} />
                                <Stat label="Penerima"           value={r.recipient ?? 'PPATK'} />
                                <Stat label="Periode"            value={`${fmtDate(r.period_start)} → ${fmtDate(r.period_end)}`} />
                                <Stat label="Total Records"      value={Number(r.item_count ?? 11842).toLocaleString('id-ID')} />
                                <Stat label="Progress"           value={`${r.pct_complete ?? 100}%`} />
                                <Stat label="Status"             value={<Badge status={r.status ?? 'submitted'} />} />
                                <Stat label="Submitted At"       value={r.submitted_at ? fmtDateTime(r.submitted_at) : '—'} />
                                <Stat label="PPATK Receipt"      value={r.ppatk_receipt ?? 'PPATK-LTKT-2026050614789'} />
                                <Stat label="Submitter"          value={r.submitted_by?.name ?? r.submittedBy?.name ?? 'I. Wahyu'} />
                            </div>
                        </div>

                        {/* XML preview (collapsible) */}
                        <div className="card">
                            <button
                                type="button"
                                onClick={() => setXmlOpen(o => !o)}
                                className="card-head"
                                style={{ width: '100%', cursor: 'pointer', background: 'none', border: 0, borderBottom: '1px solid var(--border)' }}
                            >
                                <h3 style={{ display: 'inline-flex', alignItems: 'center', gap: 8, margin: 0 }}>
                                    {xmlOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                    Pratinjau XML PPATK
                                </h3>
                                <Tag tone="mono">{xml.length.toLocaleString('id-ID')} char</Tag>
                            </button>
                            {xmlOpen && (
                                <div className="card-body" style={{ padding: 0 }}>
                                    <pre
                                        className="mono"
                                        style={{
                                            margin: 0,
                                            padding: 14,
                                            fontSize: 11.5,
                                            lineHeight: 1.55,
                                            background: 'var(--surface-2)',
                                            color: 'var(--fg)',
                                            overflowX: 'auto',
                                            whiteSpace: 'pre',
                                            borderBottomLeftRadius: 'var(--radius)',
                                            borderBottomRightRadius: 'var(--radius)',
                                        }}
                                    >
                                        {xml}
                                    </pre>
                                </div>
                            )}
                        </div>

                        {/* Validation results */}
                        <div className="card">
                            <div className="card-head"><h3>Hasil Validasi</h3>
                                <Tag tone={validations.every(v => v.ok) ? 'soft' : 'risk'}>
                                    {validations.filter(v => v.ok).length}/{validations.length} OK
                                </Tag>
                            </div>
                            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {validations.map((v, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5 }}>
                                        {v.ok
                                            ? <CheckCircle2 size={14} style={{ color: 'var(--primary-2, var(--primary))' }} />
                                            : <AlertTriangle size={14} style={{ color: 'var(--amber)' }} />
                                        }
                                        <span>{v.label}</span>
                                        <span style={{ marginLeft: 'auto' }}>
                                            <Tag tone={v.ok ? 'soft' : 'risk'}>{v.ok ? 'pass' : 'warn'}</Tag>
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                }
                rail={
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div className="card">
                            <div className="card-head"><h3>Detail Submisi</h3></div>
                            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
                                <DetailRow label="Report ID"  value={<span className="mono">{r.report_id ?? '—'}</span>} />
                                <DetailRow label="Channel"    value="API PPATK v2.1" />
                                <DetailRow label="Format"     value="XML / XSD 2.4" />
                                <DetailRow label="Due Date"   value={r.due_date ? fmtDate(r.due_date) : '—'} />
                                <DetailRow label="Receipt"    value={<span className="mono" style={{ fontSize: 11 }}>{r.ppatk_receipt ?? 'PPATK-LTKT-2026050614789'}</span>} />
                                <DetailRow label="PIC"        value={
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                        <Avatar name={r.submitted_by?.name ?? r.submittedBy?.name ?? 'I. Wahyu'} size={18} />
                                        <span>{r.submitted_by?.name ?? r.submittedBy?.name ?? 'I. Wahyu'}</span>
                                    </span>
                                } />
                            </div>
                        </div>

                        <div className="card">
                            <div className="card-head"><h3>Transaksi Terkait</h3></div>
                            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span className="muted">Total transaksi</span>
                                    <span className="mono num" style={{ fontWeight: 600 }}>{Number(r.item_count ?? 11842).toLocaleString('id-ID')}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span className="muted">Nasabah unik</span>
                                    <span className="mono">9.881</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span className="muted">Outlet sumber</span>
                                    <span className="mono">3.124</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span className="muted">Nilai total</span>
                                    <span className="mono">Rp 8,42 T</span>
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <div className="card-head"><h3>Audit Trail</h3></div>
                            <div className="card-body">
                                <Timeline
                                    items={SAMPLE_AUDIT.map(e => ({
                                        time:  <span className="mono" style={{ fontSize: 11 }}>{e.time}</span>,
                                        title: (
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                                <Tag size="sm">{e.action}</Tag>
                                                <span>{e.body}</span>
                                            </span>
                                        ),
                                        actor: (
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                                <Avatar name={e.actor} size={16} />
                                                <span style={{ fontSize: 11 }}>{e.actor}</span>
                                            </span>
                                        ),
                                        type: e.type,
                                    }))}
                                />
                            </div>
                        </div>
                    </div>
                }
            />
        </AppLayout>
    );
}

/* ---------- Helpers ---------- */

function Stat({ label, value }) {
    return (
        <div>
            <div className="kpi-label">{label}</div>
            <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>{value ?? '—'}</div>
        </div>
    );
}

function DetailRow({ label, value }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            <span className="muted">{label}</span>
            <span style={{ textAlign: 'right' }}>{value ?? '—'}</span>
        </div>
    );
}

function fmtDate(v) {
    if (!v) return '—';
    const d = typeof v === 'string' ? new Date(v) : v;
    if (Number.isNaN(d.getTime())) return String(v);
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtDateTime(v) {
    if (!v) return '—';
    const d = typeof v === 'string' ? new Date(v) : v;
    if (Number.isNaN(d.getTime())) return String(v);
    return d.toLocaleString('id-ID', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function safeRoute(name, ...args) {
    try { return route(name, ...args); }
    catch { return '#'; }
}
