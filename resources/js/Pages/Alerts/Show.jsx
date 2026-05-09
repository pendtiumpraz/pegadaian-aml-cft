import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/PageHeader';
import RightRail from '@/Components/RightRail';
import Donut from '@/Components/Donut';
import FactorRow from '@/Components/FactorRow';
import Timeline from '@/Components/Timeline';
import RiskPill from '@/Components/RiskPill';
import Badge from '@/Components/Badge';
import Tag from '@/Components/Tag';
import {
    ChevronLeft, Stethoscope, TrendingUp, UserCheck, XCircle,
} from 'lucide-react';

/* --------------------------------------------------------------------
   Helpers
   -------------------------------------------------------------------- */

const SEVERITY_LEVEL = {
    low:      'low',
    medium:   'med',
    high:     'high',
    critical: 'high',
};

const STATUS_BADGE = {
    new:            { status: 'baru',        label: 'Baru' },
    triage:         { status: 'investigasi', label: 'Triage' },
    reviewing:      { status: 'investigasi', label: 'Review' },
    investigating:  { status: 'investigasi', label: 'Investigasi' },
    escalated:      { status: 'eskalasi',    label: 'Eskalasi' },
    eskalasi:       { status: 'eskalasi',    label: 'Eskalasi' },
    closed:         { status: 'selesai',     label: 'Selesai' },
    selesai:        { status: 'selesai',     label: 'Selesai' },
    false_positive: { status: 'nonaktif',    label: 'False Positive' },
};

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
        day:   '2-digit',
        month: 'long',
        year:  'numeric',
    });
}

function severityScoreColor(score) {
    const n = Number(score) || 0;
    if (n >= 70) return 'var(--red)';
    if (n >= 50) return 'var(--amber)';
    return 'var(--primary)';
}

function deriveFactors(alert) {
    const factors = alert?.factors_json;
    if (Array.isArray(factors) && factors.length) {
        return factors.map(f => ({
            label:  f.label  ?? f.name  ?? 'Faktor',
            value:  f.value  ?? null,
            weight: Number(f.weight ?? f.score ?? 0),
            muted:  Boolean(f.muted),
        }));
    }
    return [
        { label: 'Skor Aturan',     value: 'Threshold tercapai', weight: 32 },
        { label: 'Profil Risiko',   value: 'IRA Tinggi',         weight: 24 },
        { label: 'Pola Geografi',   value: 'Multi-cabang',       weight: 14 },
        { label: 'Watchlist Match', value: 'Tidak ada',          weight: 0,  muted: true },
    ];
}

function deriveTimeline(alert) {
    const items = [];
    if (alert?.created_at) {
        items.push({ time: fmtDateTime(alert.created_at), title: 'Alert dipicu', body: alert.source ?? 'Engine deteksi', type: 'warn' });
    }
    if (alert?.assigned_at) {
        items.push({ time: fmtDateTime(alert.assigned_at), title: 'Di-assign', body: alert.assignedTo?.name ? `ke ${alert.assignedTo.name}` : null, type: 'info' });
    }
    if (alert?.closed_at) {
        items.push({ time: fmtDateTime(alert.closed_at), title: 'Alert ditutup', body: alert.close_reason ?? null, type: 'success' });
    }
    return items;
}

/* --------------------------------------------------------------------
   Page
   -------------------------------------------------------------------- */

/**
 * @param {{
 *   alert: object,
 *   transaction?: object | null,
 *   case?: object | null,
 * }} props
 */
export default function AlertShow({ alert, transaction = null, case: linkedCase = null }) {
    const [showAssign, setShowAssign] = useState(false);
    const [assignTo,   setAssignTo]   = useState('');

    if (!alert) return null;

    const customer  = alert.customer ?? null;
    const score     = alert.risk_score ?? 0;
    const sevLevel  = SEVERITY_LEVEL[alert.severity] ?? 'low';
    const statusMap = STATUS_BADGE[alert.status] ?? { status: alert.status, label: alert.status };
    const isClosed  = ['closed', 'selesai', 'false_positive'].includes(alert.status);
    const factors   = deriveFactors(alert);
    const timeline  = deriveTimeline(alert);

    function triage() {
        if (!confirm('Tandai alert ini sebagai sedang di-triage?')) return;
        router.put(route('alerts.triage', alert.id));
    }

    function escalate() {
        if (!confirm('Eskalasi alert ini?')) return;
        router.put(route('alerts.escalate', alert.id));
    }

    function close() {
        const reason = prompt('Alasan penutupan alert?');
        if (!reason) return;
        router.put(route('alerts.close', alert.id), { close_reason: reason });
    }

    function submitAssign(e) {
        e.preventDefault();
        if (!assignTo.trim()) return;
        router.put(route('alerts.assign', alert.id), { assigned_to: assignTo }, {
            onSuccess: () => { setAssignTo(''); setShowAssign(false); },
        });
    }

    return (
        <AppLayout title={`Alert ${alert.alert_id ?? '#' + alert.id}`}>
            <PageHeader
                title={`Alert ${alert.alert_id ?? '#' + alert.id}`}
                subtitle={alert.type ?? alert.title ?? 'Detail alert AML/CFT'}
                meta={
                    <>
                        <Badge status={statusMap.status} label={statusMap.label} />
                        <RiskPill level={sevLevel} score={score} />
                    </>
                }
                actions={
                    <Link href={route('alerts.index')} className="btn">
                        <ChevronLeft size={14} /> Kembali
                    </Link>
                }
            />

            <RightRail railWidth="320px">
                {/* MAIN */}
                <div className="card">
                    <div className="card-head" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', flexWrap: 'wrap' }}>
                            <span className="mono" style={{ fontSize: 11.5, color: 'var(--fg-3)' }}>
                                {alert.alert_id ?? `#${alert.id}`}
                            </span>
                            <Badge status={statusMap.status} label={statusMap.label} />
                            <RiskPill level={sevLevel} score={score} />
                            {alert.priority && <Tag>Prioritas {alert.priority}</Tag>}
                        </div>
                        <h3 style={{ fontSize: 14, margin: 0 }}>{alert.type ?? '—'}</h3>
                    </div>

                    <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {/* Donut + meta */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                            <div>
                                <div className="kpi-label" style={{ marginBottom: 6 }}>Skor Alert</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <Donut
                                        value={score}
                                        size={88}
                                        thickness={10}
                                        color={severityScoreColor(score)}
                                        centerValue={
                                            <span className="mono" style={{ fontSize: 18, fontWeight: 600 }}>
                                                {score}
                                            </span>
                                        }
                                        centerLabel={<span style={{ fontSize: 10 }}>/ 100</span>}
                                    />
                                    <div style={{ fontSize: 12, color: 'var(--fg-3)' }}>
                                        <div>Severity: <strong style={{ color: 'var(--fg)' }}>{alert.severity ?? '—'}</strong></div>
                                        <div>Source: <strong style={{ color: 'var(--fg)' }}>{alert.source ?? 'Engine'}</strong></div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="kpi-label" style={{ marginBottom: 6 }}>Detail</div>
                                <dl className="field-list">
                                    <dt>Tipe</dt>
                                    <dd>{alert.type ?? '—'}</dd>
                                    <dt>Rule ID</dt>
                                    <dd className="mono">{alert.rule_id ?? '—'}</dd>
                                    <dt>Prioritas</dt>
                                    <dd>{alert.priority ?? '—'}</dd>
                                    <dt>Dibuat</dt>
                                    <dd>{fmtDateTime(alert.created_at)}</dd>
                                    <dt>SLA</dt>
                                    <dd>{fmtDateTime(alert.sla_due_at)}</dd>
                                </dl>
                            </div>
                        </div>

                        {/* Factors */}
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

                        {/* Action footer */}
                        {!isClosed && (
                            <div
                                style={{
                                    display: 'flex',
                                    gap: 8,
                                    paddingTop: 12,
                                    borderTop: '1px solid var(--border)',
                                    flexWrap: 'wrap',
                                    alignItems: 'center',
                                }}
                            >
                                <button type="button" className="btn primary" onClick={triage}>
                                    <Stethoscope size={14} /> Triage
                                </button>
                                <button
                                    type="button"
                                    className="btn"
                                    onClick={() => setShowAssign(v => !v)}
                                >
                                    <UserCheck size={14} /> Assign
                                </button>
                                <button type="button" className="btn" onClick={escalate}>
                                    <TrendingUp size={14} /> Escalate
                                </button>
                                <button
                                    type="button"
                                    className="btn ghost"
                                    style={{ marginLeft: 'auto' }}
                                    onClick={close}
                                >
                                    <XCircle size={14} /> Close
                                </button>

                                {showAssign && (
                                    <form
                                        onSubmit={submitAssign}
                                        style={{
                                            flex: '1 0 100%',
                                            display: 'flex',
                                            gap: 8,
                                            marginTop: 6,
                                        }}
                                    >
                                        <input
                                            type="text"
                                            value={assignTo}
                                            onChange={e => setAssignTo(e.target.value)}
                                            placeholder="User ID analis…"
                                            style={{
                                                flex: 1,
                                                padding: '6px 10px',
                                                fontSize: 12.5,
                                                background: 'var(--surface-2)',
                                                border: '1px solid var(--border)',
                                                borderRadius: 6,
                                                color: 'var(--fg)',
                                                outline: 'none',
                                            }}
                                        />
                                        <button type="submit" className="btn primary">Simpan</button>
                                    </form>
                                )}
                            </div>
                        )}

                        {/* Timeline */}
                        <div>
                            <div className="kpi-label" style={{ marginBottom: 8 }}>Riwayat Alert</div>
                            {timeline.length === 0 ? (
                                <div className="muted" style={{ fontSize: 12 }}>
                                    Belum ada aktivitas.
                                </div>
                            ) : (
                                <Timeline items={timeline} />
                            )}
                        </div>
                    </div>
                </div>

                {/* RAIL */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {customer && (
                        <div className="card">
                            <div className="card-head"><h3>Nasabah</h3></div>
                            <div className="card-body">
                                <dl className="field-list">
                                    <dt>Nama</dt>
                                    <dd>{customer.name ?? '—'}</dd>
                                    <dt>CIF</dt>
                                    <dd className="mono">{customer.cif ?? '—'}</dd>
                                    {customer.risk_level && (<>
                                        <dt>Risk</dt>
                                        <dd><Badge status={customer.risk_level} /></dd>
                                    </>)}
                                    {customer.pep_flag && (<>
                                        <dt>PEP</dt>
                                        <dd><Tag>Tier {customer.pep_tier ?? '—'}</Tag></dd>
                                    </>)}
                                </dl>
                                <div style={{ marginTop: 10 }}>
                                    <Link
                                        href={route('customers.show', customer.id)}
                                        style={{ color: 'var(--primary)', fontSize: 12, fontWeight: 600 }}
                                    >
                                        Lihat profil →
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}

                    {transaction && (
                        <div className="card">
                            <div className="card-head"><h3>Transaksi</h3></div>
                            <div className="card-body">
                                <dl className="field-list">
                                    <dt>Txn</dt>
                                    <dd className="mono">{transaction.txn_id ?? `#${transaction.id}`}</dd>
                                    {transaction.amount != null && (<>
                                        <dt>Jumlah</dt>
                                        <dd className="mono">
                                            Rp {Number(transaction.amount).toLocaleString('id-ID')}
                                        </dd>
                                    </>)}
                                    {transaction.channel && (<>
                                        <dt>Channel</dt>
                                        <dd>{transaction.channel}</dd>
                                    </>)}
                                    {transaction.created_at && (<>
                                        <dt>Tanggal</dt>
                                        <dd>{fmtDate(transaction.created_at)}</dd>
                                    </>)}
                                </dl>
                            </div>
                        </div>
                    )}

                    {linkedCase && (
                        <div className="card">
                            <div className="card-head"><h3>Kasus Terkait</h3></div>
                            <div className="card-body">
                                <dl className="field-list">
                                    <dt>Nomor</dt>
                                    <dd className="mono">{linkedCase.case_id ?? `#${linkedCase.id}`}</dd>
                                    <dt>State</dt>
                                    <dd>{linkedCase.state ?? '—'}</dd>
                                </dl>
                                <div style={{ marginTop: 10 }}>
                                    <Link
                                        href={route('cases.show', linkedCase.id)}
                                        style={{ color: 'var(--primary)', fontSize: 12, fontWeight: 600 }}
                                    >
                                        Buka kasus →
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </RightRail>
        </AppLayout>
    );
}
