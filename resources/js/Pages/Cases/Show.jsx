import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/PageHeader';
import RightRail from '@/Components/RightRail';
import KasusDetailPanel, {
    fmtDate, caseStatusBadgeStatus, caseStatusLabel, caseRiskLevel,
} from './_DetailPanel';
import RiskPill from '@/Components/RiskPill';
import Badge from '@/Components/Badge';
import { ChevronLeft } from 'lucide-react';

/**
 * Kasus show — standalone case detail page.
 *
 * @param {{ case: object }} props
 */
export default function KasusShow({ case: kasus }) {
    if (!kasus) return null;

    const customer = kasus.customer ?? null;
    const alert    = kasus.alert    ?? null;
    const score    = alert?.risk_score ?? kasus.risk_score ?? null;
    const riskLvl  = score != null ? caseRiskLevel(score) : null;

    return (
        <AppLayout title={`Kasus ${kasus.case_id ?? '#'+kasus.id}`}>
            <PageHeader
                title={`Kasus ${kasus.case_id ?? '#' + kasus.id}`}
                subtitle={customer?.name ? `Nasabah: ${customer.name}` : undefined}
                meta={
                    <>
                        <Badge
                            status={caseStatusBadgeStatus(kasus.state)}
                            label={caseStatusLabel(kasus.state)}
                        />
                        {riskLvl && <RiskPill level={riskLvl} score={score} />}
                    </>
                }
                actions={
                    <Link href={route('cases.index')} className="btn">
                        <ChevronLeft size={14} /> Kembali
                    </Link>
                }
            />

            <RightRail railWidth="320px">
                {/* MAIN */}
                <KasusDetailPanel kasus={kasus} variant="page" />

                {/* RAIL */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {/* Detail card */}
                    <div className="card">
                        <div className="card-head">
                            <h3>Detail</h3>
                        </div>
                        <div className="card-body">
                            <dl className="field-list">
                                <dt>Nomor</dt>
                                <dd className="mono">{kasus.case_id ?? '—'}</dd>
                                <dt>Status</dt>
                                <dd>
                                    <Badge
                                        status={caseStatusBadgeStatus(kasus.state)}
                                        label={caseStatusLabel(kasus.state)}
                                    />
                                </dd>
                                <dt>Decision</dt>
                                <dd>{kasus.decision ?? '—'}</dd>
                                <dt>PIC</dt>
                                <dd>{kasus.analyst?.name ?? <span className="muted">—</span>}</dd>
                                <dt>Approver</dt>
                                <dd>{kasus.approver?.name ?? <span className="muted">—</span>}</dd>
                                <dt>Tgl Buka</dt>
                                <dd>{fmtDate(kasus.created_at)}</dd>
                                <dt>SLA</dt>
                                <dd>{fmtDate(kasus.sla_due_at)}</dd>
                                {kasus.escalated_at && (<>
                                    <dt>Eskalasi</dt>
                                    <dd>{fmtDate(kasus.escalated_at)}</dd>
                                </>)}
                                {kasus.closed_at && (<>
                                    <dt>Ditutup</dt>
                                    <dd>{fmtDate(kasus.closed_at)}</dd>
                                </>)}
                            </dl>
                        </div>
                    </div>

                    {/* Customer card */}
                    {customer && (
                        <div className="card">
                            <div className="card-head">
                                <h3>Nasabah</h3>
                            </div>
                            <div className="card-body">
                                <dl className="field-list">
                                    <dt>Nama</dt>
                                    <dd>{customer.name ?? '—'}</dd>
                                    <dt>CIF</dt>
                                    <dd className="mono">{customer.cif ?? '—'}</dd>
                                    {customer.risk_level && (<>
                                        <dt>Risk Level</dt>
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

                    {/* Related Alerts */}
                    {alert && (
                        <div className="card">
                            <div className="card-head">
                                <h3>Related Alerts</h3>
                            </div>
                            <div className="card-body tight">
                                <Link
                                    href={route('alerts.show', alert.id)}
                                    style={{
                                        display: 'block',
                                        padding: '10px 14px',
                                        borderBottom: '1px solid var(--border)',
                                        textDecoration: 'none',
                                        color: 'var(--fg)',
                                    }}
                                >
                                    <div className="mono" style={{ fontSize: 11.5, color: 'var(--fg-3)' }}>
                                        {alert.alert_id ?? `#${alert.id}`}
                                    </div>
                                    <div style={{ fontSize: 12.5, marginTop: 2 }}>
                                        {alert.type ?? '—'}
                                    </div>
                                    <div style={{ marginTop: 6, display: 'flex', gap: 6, alignItems: 'center' }}>
                                        {alert.risk_score != null && (
                                            <RiskPill
                                                level={caseRiskLevel(alert.risk_score)}
                                                score={alert.risk_score}
                                            />
                                        )}
                                    </div>
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Related Transaksi */}
                    {alert?.txn_id && (
                        <div className="card">
                            <div className="card-head">
                                <h3>Related Transaksi</h3>
                            </div>
                            <div className="card-body">
                                <dl className="field-list">
                                    <dt>Txn</dt>
                                    <dd className="mono">{alert.txn_id}</dd>
                                </dl>
                            </div>
                        </div>
                    )}
                </div>
            </RightRail>
        </AppLayout>
    );
}
