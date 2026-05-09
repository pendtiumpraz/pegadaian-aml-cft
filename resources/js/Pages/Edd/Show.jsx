import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/PageHeader';
import RightRail from '@/Components/RightRail';
import Donut from '@/Components/Donut';
import FactorRow from '@/Components/FactorRow';
import RiskPill from '@/Components/RiskPill';
import Badge from '@/Components/Badge';
import EddDetailPanel, {
    eddRiskLevel,
    EDD_STATUS_BADGE,
    fmtDateTime,
} from './_DetailPanel';
import { ChevronLeft } from 'lucide-react';

function deriveFactors(edd) {
    const factors = edd?.factors_json ?? edd?.risk_factors;
    if (Array.isArray(factors) && factors.length) {
        return factors.map(f => ({
            label:  f.label  ?? f.name  ?? 'Faktor',
            value:  f.value  ?? null,
            weight: Number(f.weight ?? f.score ?? 0),
            muted:  Boolean(f.muted),
        }));
    }
    return [
        { label: 'Profil Risiko',    value: 'IRA Tinggi',          weight: 28 },
        { label: 'Sumber Dana',      value: 'Tidak terverifikasi', weight: 22 },
        { label: 'Beneficial Owner', value: 'Belum lengkap',       weight: 18 },
        { label: 'Geografi',         value: 'Berisiko',            weight: 12 },
    ];
}

/**
 * @param {{ edd: object }} props
 */
export default function EddShow({ edd }) {
    if (!edd) return null;

    const customer  = edd.customer ?? null;
    const linkedCase = edd.case ?? null;
    const score     = edd.risk_score ?? 0;
    const sev       = eddRiskLevel(score);
    const statusMap = EDD_STATUS_BADGE[edd.status] ?? { status: edd.status, label: edd.status };
    const factors   = deriveFactors(edd);

    const donutColor = sev === 'high' ? 'var(--red)'
                     : sev === 'med'  ? 'var(--amber)'
                     : 'var(--primary)';

    return (
        <AppLayout title={`EDD ${edd.edd_id ?? '#' + edd.id}`}>
            <PageHeader
                title={`EDD ${edd.edd_id ?? '#' + edd.id}`}
                subtitle={customer?.name ? `Nasabah: ${customer.name}` : undefined}
                meta={
                    <>
                        <Badge status={statusMap.status} label={statusMap.label} />
                        <RiskPill level={sev} score={score} />
                    </>
                }
                actions={
                    <Link href={route('edd.index')} className="btn">
                        <ChevronLeft size={14} /> Kembali
                    </Link>
                }
            />

            <RightRail railWidth="320px">
                <EddDetailPanel edd={edd} variant="page" />

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

                    <div className="card">
                        <div className="card-head"><h3>Risk Score</h3></div>
                        <div
                            className="card-body"
                            style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    paddingBottom: 4,
                                }}
                            >
                                <Donut
                                    value={score}
                                    size={120}
                                    thickness={14}
                                    color={donutColor}
                                    centerValue={
                                        <span className="mono" style={{ fontSize: 22, fontWeight: 600 }}>
                                            {score}
                                        </span>
                                    }
                                    centerLabel={<span style={{ fontSize: 11 }}>/ 100</span>}
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
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
                    </div>

                    {/* Audit / Detail */}
                    <div className="card">
                        <div className="card-head"><h3>Audit</h3></div>
                        <div className="card-body">
                            <dl className="field-list">
                                <dt>Trigger</dt>
                                <dd>{edd.trigger_reason ?? '—'}</dd>
                                <dt>Stage</dt>
                                <dd>{edd.stage ?? '—'}</dd>
                                <dt>Analyst</dt>
                                <dd>{edd.analyst?.name ?? <span className="muted">—</span>}</dd>
                                <dt>Approver</dt>
                                <dd>{edd.approver?.name ?? <span className="muted">—</span>}</dd>
                                <dt>Dibuat</dt>
                                <dd>{fmtDateTime(edd.created_at)}</dd>
                                <dt>SLA</dt>
                                <dd>{fmtDateTime(edd.sla_due_at)}</dd>
                                {edd.completed_at && (<>
                                    <dt>Selesai</dt>
                                    <dd>{fmtDateTime(edd.completed_at)}</dd>
                                </>)}
                                {edd.approval_decision && (<>
                                    <dt>Decision</dt>
                                    <dd>{edd.approval_decision}</dd>
                                </>)}
                                {edd.rejection_reason && (<>
                                    <dt>Reason</dt>
                                    <dd>{edd.rejection_reason}</dd>
                                </>)}
                            </dl>
                        </div>
                    </div>

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
