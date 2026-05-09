import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/PageHeader';
import RightRail from '@/Components/RightRail';
import Donut from '@/Components/Donut';
import HBar from '@/Components/HBar';
import Tag from '@/Components/Tag';
import Badge from '@/Components/Badge';
import {
    ChevronLeft, AlertTriangle, CheckCircle2, Bell,
    User, Activity, ChevronRight,
} from 'lucide-react';

const CURRENCY = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

const STATUS_TONE = {
    normal:     'green',
    suspicious: 'red',
    flagged:    'amber',
    reviewed:   'blue',
};

const STATUS_LABEL = {
    normal:     'Normal',
    suspicious: 'Suspicious',
    flagged:    'Flagged',
    reviewed:   'Reviewed',
};

/**
 * @param {{
 *   transaksi: object,
 *   nasabah?: object,
 *   alerts?: object[],
 * }} props
 */
export default function TransaksiShow({ transaksi, nasabah, alerts = [] }) {
    const tone  = STATUS_TONE[transaksi.status]  ?? 'default';
    const label = STATUS_LABEL[transaksi.status] ?? transaksi.status;

    const formatDate = (val) => val
        ? new Date(val).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        : '—';

    /* Anomaly score breakdown — synthesised when not provided */
    const score = transaksi.suspicious_score ?? transaksi.risk_score ?? (transaksi.is_suspicious ? 75 : 0);
    const breakdown = transaksi.anomaly_breakdown ?? [
        { value: 30, color: 'var(--red)',     label: 'Pola transaksi' },
        { value: 25, color: 'var(--amber)',   label: 'Profil nasabah' },
        { value: 20, color: 'var(--primary)', label: 'Channel' },
        { value: 15, color: 'oklch(0.55 0.10 295)', label: 'Geografi' },
        { value: 10, color: 'var(--fg-3)',    label: 'Lain-lain' },
    ];

    return (
        <AppLayout title={`Transaksi: ${transaksi.nomor_transaksi ?? transaksi.txn_id ?? ''}`}>
            <PageHeader
                title="Detail Transaksi"
                subtitle={transaksi.nomor_transaksi ?? transaksi.txn_id}
                meta={<Tag tone={tone}>{label}</Tag>}
                actions={
                    <Link href={route('transactions.index')} className="btn">
                        <ChevronLeft size={14} /> Kembali
                    </Link>
                }
            />

            <RightRail railWidth="320px">
                {/* Main */}
                <>
                    <div className="card" style={{ marginBottom: 12 }}>
                        <div className="card-head">
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Activity size={14} /> Informasi Transaksi
                            </h3>
                        </div>
                        <div className="card-body">
                            <dl className="field-list">
                                <dt>No. Transaksi</dt>
                                <dd className="mono">{transaksi.nomor_transaksi ?? transaksi.txn_id ?? '—'}</dd>

                                <dt>Jenis</dt>
                                <dd>{transaksi.jenis_transaksi ?? transaksi.type ?? '—'}</dd>

                                <dt>Jumlah</dt>
                                <dd>
                                    <span className="mono" style={{ fontSize: 14, fontWeight: 700 }}>
                                        {transaksi.jumlah ? CURRENCY.format(transaksi.jumlah) : '—'}
                                    </span>
                                </dd>

                                <dt>Mata Uang</dt>
                                <dd>{transaksi.mata_uang ?? 'IDR'}</dd>

                                <dt>Tanggal</dt>
                                <dd className="mono">{formatDate(transaksi.tanggal_transaksi ?? transaksi.txn_time)}</dd>

                                <dt>Channel</dt>
                                <dd>{transaksi.channel ?? '—'}</dd>

                                <dt>Status</dt>
                                <dd><Badge tone={tone} label={label} /></dd>

                                <dt>Suspicious</dt>
                                <dd>
                                    {transaksi.is_suspicious
                                        ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--red)', fontWeight: 700 }}>
                                            <AlertTriangle size={13} /> Ya
                                          </span>
                                        : <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--primary)', fontWeight: 600 }}>
                                            <CheckCircle2 size={13} /> Tidak
                                          </span>
                                    }
                                </dd>

                                {transaksi.rule_triggered && (
                                    <>
                                        <dt>Rule Terpicu</dt>
                                        <dd><Tag tone="mono">{transaksi.rule_triggered}</Tag></dd>
                                    </>
                                )}

                                {transaksi.keterangan && (
                                    <>
                                        <dt>Keterangan</dt>
                                        <dd>{transaksi.keterangan}</dd>
                                    </>
                                )}
                            </dl>
                        </div>
                    </div>

                    {/* Anomaly score breakdown */}
                    <div className="card" style={{ marginBottom: 12 }}>
                        <div className="card-head">
                            <h3>Anomaly Score Breakdown</h3>
                            <Tag tone={score >= 75 ? 'red' : score >= 50 ? 'amber' : 'default'}>
                                Skor: <span className="mono" style={{ marginLeft: 4 }}>{score}</span>
                            </Tag>
                        </div>
                        <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                            <Donut
                                value={breakdown}
                                size={120}
                                thickness={14}
                                centerValue={<span className="mono">{score}</span>}
                                centerLabel="skor"
                            />
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {breakdown.map((b, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                                        <span
                                            style={{
                                                display: 'inline-block',
                                                width: 8,
                                                height: 8,
                                                borderRadius: 2,
                                                background: b.color,
                                            }}
                                        />
                                        <span style={{ flex: 1 }}>{b.label}</span>
                                        <span className="mono">{b.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Related alerts */}
                    <div className="card">
                        <div className="card-head">
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Bell size={14} /> Alert Terkait
                            </h3>
                            <Tag>{alerts.length}</Tag>
                        </div>

                        {alerts.length === 0 ? (
                            <div className="card-body" style={{ textAlign: 'center', color: 'var(--fg-3)', fontSize: 12, padding: '24px 16px' }}>
                                Tidak ada alert yang dikaitkan dengan transaksi ini.
                            </div>
                        ) : (
                            <div className="card-body tight">
                                {alerts.map(alert => {
                                    const aScore = alert.score ?? alert.risk_score ?? 0;
                                    const aColor = aScore >= 75 ? 'var(--red)' : aScore >= 50 ? 'var(--amber)' : 'var(--primary)';
                                    return (
                                        <div className="row" key={alert.id}>
                                            <div className="lead">
                                                <strong>
                                                    <Link href={route('alerts.show', alert.id)} style={{ color: 'var(--fg)' }}>
                                                        {alert.title ?? alert.name ?? `Alert ${alert.id}`}
                                                    </Link>
                                                </strong>
                                                {alert.description && <span>{alert.description}</span>}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 130 }}>
                                                <HBar value={aScore} color={aColor} style={{ width: 60 }} />
                                                <span className="mono" style={{ fontSize: 11.5, fontWeight: 600, color: aColor }}>
                                                    {aScore}
                                                </span>
                                            </div>
                                            {alert.severity && <Badge status={alert.severity} />}
                                            {alert.status   && <Badge status={alert.status} />}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </>

                {/* Right rail */}
                <>
                    {/* Nasabah */}
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
                                        <dt>Pekerjaan</dt>
                                        <dd>{nasabah.pekerjaan ?? '—'}</dd>
                                        {nasabah.risk_level && (
                                            <>
                                                <dt>Risk</dt>
                                                <dd><Badge status={nasabah.risk_level} /></dd>
                                            </>
                                        )}
                                    </dl>

                                    {(nasabah.is_pep || nasabah.is_blacklisted) && (
                                        <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                                            {nasabah.is_pep && <Tag tone="violet">PEP</Tag>}
                                            {nasabah.is_blacklisted && <Tag tone="red">Blacklisted</Tag>}
                                        </div>
                                    )}

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
                                    Data nasabah tidak ditemukan.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Channel info */}
                    <div className="card">
                        <div className="card-head">
                            <h3>Channel &amp; Outlet</h3>
                        </div>
                        <div className="card-body">
                            <dl className="field-list">
                                <dt>Channel</dt>
                                <dd>{transaksi.channel ?? '—'}</dd>
                                <dt>Outlet</dt>
                                <dd>{transaksi.outlet?.nama ?? transaksi.outlet_name ?? '—'}</dd>
                                {transaksi.outlet?.kota && (
                                    <>
                                        <dt>Kota</dt>
                                        <dd>{transaksi.outlet.kota}</dd>
                                    </>
                                )}
                                <dt>Reviewer</dt>
                                <dd>{transaksi.reviewed_by_user?.name ?? transaksi.reviewedBy?.name ?? '—'}</dd>
                                {transaksi.reviewed_at && (
                                    <>
                                        <dt>Direview</dt>
                                        <dd className="mono" style={{ fontSize: 11 }}>{formatDate(transaksi.reviewed_at)}</dd>
                                    </>
                                )}
                            </dl>
                        </div>
                    </div>
                </>
            </RightRail>
        </AppLayout>
    );
}
