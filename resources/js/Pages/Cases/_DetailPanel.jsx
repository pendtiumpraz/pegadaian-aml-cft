import { Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import Donut from '@/Components/Donut';
import FactorRow from '@/Components/FactorRow';
import Timeline from '@/Components/Timeline';
import Badge from '@/Components/Badge';
import RiskPill from '@/Components/RiskPill';
import Tag from '@/Components/Tag';
import {
    UserCheck, Flag, FileText, X, MoreHorizontal,
} from 'lucide-react';

/* --------------------------------------------------------------------
   Helpers
   -------------------------------------------------------------------- */

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

function caseStatusBadgeStatus(state) {
    return ({
        open:          'baru',
        investigating: 'investigasi',
        escalated:     'eskalasi',
        closed:        'selesai',
    })[caseStatusKey(state)];
}

function caseRiskLevel(score) {
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

function fmtDate(value) {
    if (!value) return '—';
    return new Date(value).toLocaleDateString('id-ID', {
        day:    '2-digit',
        month:  'long',
        year:   'numeric',
    });
}

function deriveFactors(c) {
    const fromAlert = c.alert?.factors_json;
    if (Array.isArray(fromAlert) && fromAlert.length) {
        return fromAlert.map(f => ({
            label:  f.label  ?? f.name  ?? 'Faktor',
            value:  f.value  ?? null,
            weight: Number(f.weight ?? f.score ?? 0),
            muted:  Boolean(f.muted),
        }));
    }
    // Default placeholder rows (same shape as the reference handoff)
    return [
        { label: 'Profil Risiko',    value: 'IRA Tinggi',         weight: 28 },
        { label: 'Pola Transaksi',   value: 'Smurfing terdeteksi', weight: 24 },
        { label: 'Geografi',         value: 'Outlet ≥ 5 kota',     weight: 18 },
        { label: 'Watchlist Match',  value: 'Tidak ada',           weight: 0,  muted: true },
        { label: 'Riwayat Alert',    value: '3 alert/30 hari',     weight: 11 },
    ];
}

function deriveTimeline(c) {
    const items = [];
    if (Array.isArray(c.activities) && c.activities.length) {
        c.activities.forEach(a => {
            items.push({
                time:  fmtDateTime(a.created_at),
                title: a.action ?? a.description ?? 'Aktivitas',
                body:  a.notes ?? null,
                actor: a.user?.name ?? a.actor ?? null,
                type:  a.kind === 'escalate' ? 'danger'
                       : a.kind === 'close'  ? 'success'
                       : 'info',
            });
        });
        return items;
    }
    if (c.created_at)   items.push({ time: fmtDateTime(c.created_at),   title: 'Kasus dibuka', type: 'info' });
    if (c.alert?.id)    items.push({ time: fmtDateTime(c.alert?.created_at ?? c.created_at), title: `Alert ${c.alert?.alert_id ?? ''} terhubung`, type: 'warn' });
    if (c.escalated_at) items.push({ time: fmtDateTime(c.escalated_at), title: 'Dieskalasi',  body: c.escalatedBy?.name ? `oleh ${c.escalatedBy.name}` : null, type: 'danger' });
    if (c.closed_at)    items.push({ time: fmtDateTime(c.closed_at),    title: 'Kasus ditutup', type: 'success' });
    return items;
}

/* --------------------------------------------------------------------
   Action helpers — preserve route names
   -------------------------------------------------------------------- */

function assignToMe(kasus) {
    if (!confirm('Tetapkan kasus ini ke saya?')) return;
    router.put(route('cases.update', kasus.id), { state: 'investigating' });
}

function escalate(kasus) {
    if (!confirm('Eskalasi kasus ini?')) return;
    router.put(route('cases.update', kasus.id), { state: 'escalated' });
}

function closeFalsePositive(kasus) {
    if (!confirm('Tutup sebagai false positive?')) return;
    router.put(route('cases.update', kasus.id), { state: 'closed', decision: 'false_positive' });
}

/* --------------------------------------------------------------------
   Detail panel
   -------------------------------------------------------------------- */

/**
 * @param {{
 *   kasus: object,
 *   variant?: 'panel' | 'page',  // panel = inside MasterDetail; page = standalone
 * }} props
 */
export default function KasusDetailPanel({ kasus, variant = 'panel' }) {
    if (!kasus) return null;

    const score      = kasus.alert?.risk_score ?? kasus.risk_score ?? null;
    const statusKey  = caseStatusKey(kasus.state);
    const statusLbl  = caseStatusLabel(kasus.state);
    const statusBdg  = caseStatusBadgeStatus(kasus.state);
    const riskLvl    = score != null ? caseRiskLevel(score) : null;
    const factors    = deriveFactors(kasus);
    const timeline   = deriveTimeline(kasus);
    const customer   = kasus.customer ?? null;

    const donutColor = riskLvl === 'high' ? 'var(--red)'
                     : riskLvl === 'med'  ? 'var(--amber)'
                     : 'var(--primary)';

    return (
        <div className="card" style={{ minHeight: variant === 'page' ? 0 : 600 }}>
            {/* Header */}
            <div
                className="card-head"
                style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', flexWrap: 'wrap' }}>
                    <span className="mono" style={{ fontSize: 11.5, color: 'var(--fg-3)' }}>
                        {kasus.case_id ?? `#${kasus.id}`}
                    </span>
                    <Badge status={statusBdg} label={statusLbl} />
                    {riskLvl && <RiskPill level={riskLvl} score={score} />}
                    {kasus.decision && <Tag>{kasus.decision}</Tag>}
                    <span style={{ marginLeft: 'auto' }}>
                        <button type="button" className="btn ghost" aria-label="Aksi lain">
                            <MoreHorizontal size={14} />
                        </button>
                    </span>
                </div>
                <h3 style={{ fontSize: 14, margin: 0 }}>
                    {customer?.name ?? '—'}
                    {customer?.cif && (
                        <span className="mono" style={{ color: 'var(--fg-3)', fontSize: 11.5, marginLeft: 6 }}>
                            · {customer.cif}
                        </span>
                    )}
                </h3>
            </div>

            <div
                className="card-body"
                style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
            >
                {/* Donut + meta */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div>
                        <div className="kpi-label" style={{ marginBottom: 6 }}>
                            Skor risiko alert
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <Donut
                                value={score ?? 0}
                                size={88}
                                thickness={10}
                                color={donutColor}
                                centerValue={
                                    <span className="mono" style={{ fontSize: 18, fontWeight: 600 }}>
                                        {score ?? '—'}
                                    </span>
                                }
                                centerLabel={
                                    <span style={{ fontSize: 10 }}>/ 100</span>
                                }
                            />
                            <div style={{ fontSize: 12, color: 'var(--fg-3)' }}>
                                <div>Threshold: <strong style={{ color: 'var(--fg)' }}>≥ 80 = Tinggi</strong></div>
                                <div>Model: <strong style={{ color: 'var(--fg)' }}>IRA-v2.3</strong></div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="kpi-label" style={{ marginBottom: 6 }}>Detail</div>
                        <dl className="field-list">
                            <dt>Nasabah</dt>
                            <dd>{customer?.name ?? '—'}</dd>
                            <dt>CIF</dt>
                            <dd className="mono">{customer?.cif ?? '—'}</dd>
                            <dt>Tipe</dt>
                            <dd>{kasus.alert?.type ?? kasus.decision ?? '—'}</dd>
                            <dt>Tgl Buka</dt>
                            <dd>{fmtDateTime(kasus.created_at)}</dd>
                            <dt>PIC</dt>
                            <dd>{kasus.analyst?.name ?? <span className="muted">Belum ditugaskan</span>}</dd>
                            <dt>SLA</dt>
                            <dd>{fmtDateTime(kasus.sla_due_at)}</dd>
                        </dl>
                    </div>
                </div>

                {/* Factor rows */}
                <div>
                    <div className="kpi-label" style={{ marginBottom: 8 }}>Faktor pemicu</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {factors.map((f, i) => (
                            <FactorRow
                                key={i}
                                label={f.label}
                                value={f.value}
                                weight={f.weight}
                                muted={f.muted}
                            />
                        ))}
                    </div>
                </div>

                {/* Timeline */}
                <div>
                    <div className="kpi-label" style={{ marginBottom: 8 }}>Linimasa</div>
                    {timeline.length === 0 ? (
                        <div className="muted" style={{ fontSize: 12, padding: '8px 0' }}>
                            Belum ada aktivitas.
                        </div>
                    ) : (
                        <Timeline items={timeline} />
                    )}
                </div>

                {/* Action footer */}
                {statusKey !== 'closed' && (
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
                            onClick={() => assignToMe(kasus)}
                        >
                            <UserCheck size={14} /> Tetapkan ke saya
                        </button>
                        <button
                            type="button"
                            className="btn"
                            onClick={() => escalate(kasus)}
                        >
                            <Flag size={14} /> Eskalasi
                        </button>
                        <Link
                            href={route('ltkm.create')}
                            className="btn"
                        >
                            <FileText size={14} /> Buat draft LTKM
                        </Link>
                        <button
                            type="button"
                            className="btn ghost"
                            style={{ marginLeft: 'auto' }}
                            onClick={() => closeFalsePositive(kasus)}
                        >
                            <X size={14} /> Tutup False Positive
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

/* Re-export helpers used by Show.jsx for the rail */
export {
    fmtDate,
    fmtDateTime,
    caseStatusKey,
    caseStatusLabel,
    caseStatusBadgeStatus,
    caseRiskLevel,
};
