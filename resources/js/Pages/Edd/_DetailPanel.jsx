import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import Stepper from '@/Components/Stepper';
import Avatar from '@/Components/Avatar';
import Badge from '@/Components/Badge';
import RiskPill from '@/Components/RiskPill';
import Tag from '@/Components/Tag';
import { Check, FileText, Upload, X, AlertCircle } from 'lucide-react';

/* --------------------------------------------------------------------
   Helpers
   -------------------------------------------------------------------- */

const STAGE_KEYS = ['trigger', 'profile', 'source_of_funds', 'beneficial_owner', 'approval'];
const STAGE_LABELS = {
    trigger:          'Trigger',
    profile:          'Profil',
    source_of_funds:  'Sumber Dana',
    beneficial_owner: 'Beneficial Owner',
    approval:         'Approval',
};

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

function fmtDateTime(value) {
    if (!value) return '—';
    return new Date(value).toLocaleString('id-ID', {
        day:    '2-digit',
        month:  'short',
        year:   'numeric',
        hour:   '2-digit',
        minute: '2-digit',
    });
}

function buildSteps(currentStage, status) {
    const idx = Math.max(0, STAGE_KEYS.indexOf(String(currentStage ?? '').toLowerCase()));
    const isFinished = ['approved', 'completed', 'rejected'].includes(status);
    const finalIdx = isFinished ? STAGE_KEYS.length : idx;

    return STAGE_KEYS.map((k, i) => ({
        label: STAGE_LABELS[k],
        status:
            i < finalIdx ? 'done' :
            i === finalIdx ? 'current' :
            'pending',
    }));
}

/**
 * Build a default QA list keyed by stage. Real data should arrive via
 * `edd.questionnaireAnswers` from the backend.
 */
function deriveQaCards(edd) {
    const fromBackend = edd?.questionnaireAnswers ?? edd?.questionnaire_answers;
    if (Array.isArray(fromBackend) && fromBackend.length) {
        return fromBackend.map(q => ({
            question: q.question ?? q.label ?? '—',
            answer:   q.answer   ?? '',
            note:     q.note     ?? q.reviewer_note ?? '',
            stage:    q.stage    ?? null,
            status:   q.status   ?? (q.answer ? 'done' : 'pending'),
        }));
    }
    return [
        { question: 'Sumber dana untuk transaksi',  answer: 'Hasil usaha perdagangan',     status: 'done' },
        { question: 'Bukti pendukung penghasilan',  answer: 'SPT 2024 + rekening koran',   status: 'done' },
        { question: 'Tujuan transaksi',             answer: 'Modal kerja musiman',         status: 'in_progress' },
        { question: 'Beneficial owner usaha',       answer: 'Belum diverifikasi',          status: 'in_progress' },
        { question: 'Hubungan dengan PEP',          answer: 'Tidak diketahui',             status: 'pending' },
    ];
}

function deriveDocuments(edd) {
    const docs = edd?.documents;
    if (Array.isArray(docs) && docs.length) {
        return docs.map(d => ({
            name:     d.name ?? d.title ?? d.document_name ?? 'Dokumen',
            uploaded: !!(d.path ?? d.file_path ?? d.uploaded_at),
            uploader: d.uploader ?? d.uploaded_by ?? null,
        }));
    }
    return [
        { name: 'KTP + KK',                          uploaded: true,  uploader: { name: 'Y. Pramudya' } },
        { name: 'NPWP',                              uploaded: true,  uploader: { name: 'Y. Pramudya' } },
        { name: 'SPT Tahunan',                       uploaded: true,  uploader: { name: 'M. Atikah' } },
        { name: 'SIUP / NIB',                        uploaded: false, uploader: null },
        { name: 'Rekening koran 6 bulan',            uploaded: true,  uploader: { name: 'M. Atikah' } },
        { name: 'Surat keterangan domisili',         uploaded: false, uploader: null },
    ];
}

/* --------------------------------------------------------------------
   Action helpers
   -------------------------------------------------------------------- */

function approve(edd) {
    if (!confirm('Approve EDD ini?')) return;
    router.put(route('edd.update', edd.id), {
        status:            'approved',
        approval_decision: 'approved',
    });
}

function reject(edd) {
    const reason = prompt('Alasan penolakan?');
    if (!reason) return;
    router.put(route('edd.update', edd.id), {
        status:            'rejected',
        approval_decision: 'rejected',
        rejection_reason:  reason,
    });
}

function sendBack(edd) {
    if (!confirm('Kembalikan ke analyst untuk revisi?')) return;
    router.put(route('edd.update', edd.id), {
        status: 'in_progress',
        stage:  'profile',
    });
}

/* --------------------------------------------------------------------
   QA Card
   -------------------------------------------------------------------- */

function QaBorderColor(status) {
    return ({
        done:        'var(--primary)',
        approved:    'var(--primary)',
        in_progress: 'var(--amber)',
        review:      'var(--amber)',
        pending:     'var(--surface-3)',
    })[String(status ?? '').toLowerCase()] ?? 'var(--surface-3)';
}

function QaCard({ q, a, note, status }) {
    return (
        <div
            style={{
                padding: 12,
                background: 'var(--surface-2)',
                borderRadius: 'var(--radius)',
                borderLeft: `3px solid ${QaBorderColor(status)}`,
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
            }}
        >
            <div
                className="kpi-label"
                style={{ fontSize: 10.5 }}
            >
                {q}
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--fg)' }}>{a || <span className="muted">—</span>}</div>
            {note && (
                <div className="muted" style={{ fontSize: 11.5, fontStyle: 'italic' }}>
                    Catatan: {note}
                </div>
            )}
        </div>
    );
}

/* --------------------------------------------------------------------
   Detail panel
   -------------------------------------------------------------------- */

/**
 * @param {{
 *   edd: object,
 *   variant?: 'panel' | 'page',
 * }} props
 */
export default function EddDetailPanel({ edd, variant = 'panel' }) {
    if (!edd) return null;

    const customer  = edd.customer ?? null;
    const score     = edd.risk_score ?? 0;
    const sev       = eddRiskLevel(score);
    const statusMap = STATUS_BADGE[edd.status] ?? { status: edd.status, label: edd.status };
    const isFinal   = ['approved', 'completed', 'rejected'].includes(edd.status);

    const steps     = buildSteps(edd.stage, edd.status);
    const qaCards   = deriveQaCards(edd);
    const documents = deriveDocuments(edd);

    return (
        <div className="card" style={{ minHeight: variant === 'page' ? 0 : 600 }}>
            {/* Header */}
            <div className="card-head" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        width: '100%',
                        flexWrap: 'wrap',
                    }}
                >
                    <span className="mono" style={{ fontSize: 11.5, color: 'var(--fg-3)' }}>
                        {edd.edd_id ?? `#${edd.id}`}
                    </span>
                    <Badge status={statusMap.status} label={statusMap.label} />
                    <RiskPill level={sev} score={score} />
                    {edd.stage && <Tag>{STAGE_LABELS[edd.stage] ?? edd.stage}</Tag>}
                </div>
                <h3 style={{ fontSize: 14, margin: 0 }}>
                    {customer?.name ?? '—'}
                    {customer?.cif && (
                        <span className="mono" style={{ color: 'var(--fg-3)', fontSize: 11.5, marginLeft: 6 }}>
                            · {customer.cif}
                        </span>
                    )}
                </h3>
                {edd.trigger_reason && (
                    <div className="muted" style={{ fontSize: 12 }}>
                        Trigger: {edd.trigger_reason}
                    </div>
                )}
            </div>

            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Stepper */}
                <Stepper steps={steps} />

                {/* QA Cards */}
                <div>
                    <div className="kpi-label" style={{ marginBottom: 8 }}>Pertanyaan EDD</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {qaCards.map((c, i) => (
                            <QaCard
                                key={i}
                                q={c.question}
                                a={c.answer}
                                note={c.note}
                                status={c.status}
                            />
                        ))}
                    </div>
                </div>

                {/* Document checklist */}
                <div>
                    <div className="kpi-label" style={{ marginBottom: 8 }}>Dokumen Pendukung</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {documents.map((d, i) => (
                            <div
                                key={i}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    padding: '8px 12px',
                                    background: 'var(--surface-2)',
                                    borderRadius: 'var(--radius)',
                                    fontSize: 12,
                                }}
                            >
                                <span
                                    style={{
                                        width: 18,
                                        height: 18,
                                        borderRadius: '50%',
                                        background: d.uploaded ? 'var(--primary-soft)' : 'var(--surface-3)',
                                        color:      d.uploaded ? 'var(--primary-2)'   : 'var(--fg-3)',
                                        display: 'inline-grid',
                                        placeItems: 'center',
                                        flexShrink: 0,
                                    }}
                                >
                                    {d.uploaded ? <Check size={11} /> : <AlertCircle size={11} />}
                                </span>
                                <FileText size={12} style={{ color: 'var(--fg-3)' }} />
                                <span style={{ flex: 1 }}>{d.name}</span>
                                {d.uploader
                                    ? <Avatar name={d.uploader.name ?? d.uploader} size={20} />
                                    : <span className="muted" style={{ fontSize: 11 }}>Pending</span>}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer actions */}
                {!isFinal && (
                    <div
                        style={{
                            display: 'flex',
                            gap: 8,
                            paddingTop: 12,
                            borderTop: '1px solid var(--border)',
                            flexWrap: 'wrap',
                        }}
                    >
                        <button
                            type="button"
                            className="btn primary"
                            onClick={() => approve(edd)}
                        >
                            <Check size={14} /> Approve
                        </button>
                        <button
                            type="button"
                            className="btn"
                            onClick={() => sendBack(edd)}
                        >
                            <Upload size={14} /> Send Back
                        </button>
                        <button
                            type="button"
                            className="btn ghost"
                            style={{ marginLeft: 'auto' }}
                            onClick={() => reject(edd)}
                        >
                            <X size={14} /> Reject
                        </button>
                    </div>
                )}
                <div style={{ fontSize: 11, color: 'var(--fg-3)' }}>
                    Direview: {fmtDateTime(edd.completed_at)} · SLA: {fmtDateTime(edd.sla_due_at)}
                </div>
            </div>
        </div>
    );
}

export {
    eddRiskLevel,
    STATUS_BADGE as EDD_STATUS_BADGE,
    fmtDateTime,
    buildSteps,
};
