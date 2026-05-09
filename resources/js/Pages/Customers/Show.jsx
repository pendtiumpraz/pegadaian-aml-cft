import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/PageHeader';
import Badge from '@/Components/Badge';
import RiskPill from '@/Components/RiskPill';
import Tag from '@/Components/Tag';
import Donut from '@/Components/Donut';
import FactorRow from '@/Components/FactorRow';
import StatCard from '@/Components/StatCard';
import RightRail from '@/Components/RightRail';
import Timeline from '@/Components/Timeline';
import {
    Pencil,
    Plus,
    FileSearch,
    ArrowLeftRight,
    Bell,
    Wallet,
    Activity,
    AlertOctagon,
} from 'lucide-react';

const RISK_LEVEL_KEY = (lvl) => {
    const k = String(lvl || '').toLowerCase();
    if (['high', 'critical', 'tinggi', 'kritis'].includes(k)) return 'high';
    if (['medium', 'med', 'sedang', 'menengah'].includes(k)) return 'med';
    return 'low';
};

const RISK_LABEL = { low: 'Rendah', medium: 'Sedang', high: 'Tinggi', critical: 'Kritis' };

const CURRENCY = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
const NUMBER = new Intl.NumberFormat('id-ID');

function fmtDate(d) {
    if (!d) return '—';
    try {
        return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    } catch {
        return String(d);
    }
}

function fmtShortDateTime(d) {
    if (!d) return '—';
    try {
        const dt = new Date(d);
        const dd = String(dt.getDate()).padStart(2, '0');
        const mm = String(dt.getMonth() + 1).padStart(2, '0');
        const hh = String(dt.getHours()).padStart(2, '0');
        const mi = String(dt.getMinutes()).padStart(2, '0');
        return `${dd}/${mm} ${hh}:${mi}`;
    } catch {
        return String(d);
    }
}

function fmtCompactIdr(n) {
    const v = Number(n) || 0;
    if (v >= 1e9) return `Rp ${(v / 1e9).toFixed(1)} M`;
    if (v >= 1e6) return `Rp ${(v / 1e6).toFixed(1)} Jt`;
    if (v >= 1e3) return `Rp ${(v / 1e3).toFixed(0)} Rb`;
    return CURRENCY.format(v);
}

/**
 * @param {{
 *   nasabah: object,
 *   transaksi_recent: object[],
 *   alerts_recent: object[],
 *   audit_trail?: object[],
 * }} props
 */
export default function NasabahShow({
    nasabah,
    transaksi_recent = [],
    alerts_recent = [],
    audit_trail = [],
}) {
    const riskKey = RISK_LEVEL_KEY(nasabah.risk_level);
    const score = Number(nasabah.skor_ira ?? nasabah.risk_score ?? 0) || 0;
    const donutColor =
        riskKey === 'high' ? 'var(--red)' :
        riskKey === 'med'  ? 'var(--amber)' :
                             'var(--primary)';

    // IRA factor breakdown (read from nasabah if present, otherwise sensible defaults)
    const factors = [
        {
            label: 'Profil Risiko',
            weight: 25,
            score: Number(nasabah.factor_profil ?? (riskKey === 'high' ? 78 : riskKey === 'med' ? 55 : 32)),
        },
        {
            label: 'Geografi',
            weight: 20,
            score: Number(nasabah.factor_geografi ?? (riskKey === 'high' ? 64 : riskKey === 'med' ? 48 : 28)),
        },
        {
            label: 'Pekerjaan',
            weight: 20,
            score: Number(nasabah.factor_pekerjaan ?? (riskKey === 'high' ? 70 : riskKey === 'med' ? 50 : 30)),
        },
        {
            label: 'Pola Transaksi',
            weight: 25,
            score: Number(nasabah.factor_pola_transaksi ?? (riskKey === 'high' ? 88 : riskKey === 'med' ? 60 : 35)),
        },
        {
            label: 'Alert History',
            weight: 10,
            score: Number(nasabah.factor_alert_history ?? Math.min(100, (alerts_recent.length || 0) * 18 + (riskKey === 'high' ? 40 : 10))),
        },
    ];

    // KPI: 30-day transaction count + outstanding
    const tx30Count = transaksi_recent.length;
    const tx30Total = transaksi_recent.reduce((sum, t) => sum + (Number(t.jumlah) || 0), 0);
    const outstanding = nasabah.outstanding ?? nasabah.outstanding_loan ?? tx30Total;
    const alertLifetime = nasabah.alert_count ?? alerts_recent.length;

    // Audit trail fallback if controller doesn't provide
    const trail = audit_trail.length > 0 ? audit_trail : [
        nasabah.updated_at && {
            type: 'info',
            time: fmtDate(nasabah.updated_at),
            title: 'Profil diperbarui',
            body: 'Data nasabah disinkronkan',
        },
        nasabah.created_at && {
            type: 'success',
            time: fmtDate(nasabah.created_at),
            title: 'Nasabah didaftarkan',
            body: `CDD onboarding · No. ${nasabah.nomor_nasabah}`,
        },
    ].filter(Boolean);

    return (
        <AppLayout title={`Nasabah: ${nasabah.nama}`}>
            <PageHeader
                title={nasabah.nama}
                subtitle={`No. Nasabah ${nasabah.nomor_nasabah} · NIK ${nasabah.nik ?? '—'}${nasabah.alamat ? ` · ${nasabah.alamat}` : ''}`}
                meta={
                    <>
                        <RiskPill level={nasabah.risk_level} score={score || undefined} />
                        {nasabah.is_pep && <Tag tone="soft" leading={<AlertOctagon size={11} />}>PEP</Tag>}
                        {nasabah.is_blacklisted && <Tag tone="risk" leading={<span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--red)' }} />}>Blacklisted</Tag>}
                        {nasabah.edd_required && <Tag>EDD Diperlukan</Tag>}
                    </>
                }
                actions={
                    <>
                        <Link href={route('customers.edit', nasabah.id)} className="btn">
                            <Pencil size={14} />
                            Edit
                        </Link>
                        <Link
                            href={route('edd.create') + `?nasabah_id=${nasabah.id}`}
                            className="btn"
                        >
                            <FileSearch size={14} />
                            Buat EDD
                        </Link>
                        <Link
                            href={route('cases.create') + `?nasabah_id=${nasabah.id}`}
                            className="btn primary"
                        >
                            <Plus size={14} />
                            Buat Kasus
                        </Link>
                    </>
                }
            />

            {/* KPI strip */}
            <div className="grid grid-4" style={{ marginBottom: 16 }}>
                <StatCard
                    title="Skor IRA"
                    value={score || '—'}
                    unit={score ? '/100' : undefined}
                    icon={Activity}
                    delta={RISK_LABEL[nasabah.risk_level] ?? 'Risiko'}
                    deltaTone={riskKey === 'high' ? 'down' : riskKey === 'med' ? 'flat' : 'up'}
                />
                <StatCard
                    title="Outstanding"
                    value={fmtCompactIdr(outstanding)}
                    icon={Wallet}
                    delta={`${tx30Count} tx 30 hari`}
                    deltaTone="flat"
                />
                <StatCard
                    title="Tx 30 Hari"
                    value={NUMBER.format(tx30Count)}
                    icon={ArrowLeftRight}
                    delta={tx30Count > 0 ? `Total ${fmtCompactIdr(tx30Total)}` : 'Tidak ada transaksi'}
                    deltaTone={tx30Count > 0 ? 'up' : 'flat'}
                />
                <StatCard
                    title="Alert Lifetime"
                    value={NUMBER.format(alertLifetime)}
                    icon={Bell}
                    delta={alerts_recent.length > 0 ? `${alerts_recent.length} aktif` : 'Tidak ada aktif'}
                    deltaTone={alerts_recent.length > 0 ? 'down' : 'flat'}
                />
            </div>

            <RightRail
                main={
                    <>
                        {/* Profil Card */}
                        <div className="card" style={{ marginBottom: 16 }}>
                            <div className="card-head">
                                <h3>Profil & Identitas</h3>
                                <Tag tone="soft">Verified</Tag>
                            </div>
                            <div className="card-body">
                                <dl className="field-list">
                                    <dt>Nama</dt>
                                    <dd>{nasabah.nama ?? '—'}</dd>

                                    <dt>NIK</dt>
                                    <dd className="mono">{nasabah.nik ?? '—'}</dd>

                                    <dt>NPWP</dt>
                                    <dd className="mono">{nasabah.npwp ?? '—'}</dd>

                                    <dt>Tgl Lahir</dt>
                                    <dd>{fmtDate(nasabah.tanggal_lahir)}</dd>

                                    <dt>Jenis Kelamin</dt>
                                    <dd>
                                        {nasabah.jenis_kelamin === 'L' ? 'Laki-laki'
                                            : nasabah.jenis_kelamin === 'P' ? 'Perempuan'
                                            : (nasabah.jenis_kelamin ?? '—')}
                                    </dd>

                                    <dt>Pekerjaan</dt>
                                    <dd>{nasabah.pekerjaan ?? '—'}</dd>

                                    <dt>Alamat</dt>
                                    <dd>{nasabah.alamat ?? '—'}</dd>

                                    <dt>PEP</dt>
                                    <dd>
                                        {nasabah.is_pep
                                            ? <span style={{ color: 'var(--red)', fontWeight: 600 }}>Ya</span>
                                            : <span className="muted">Tidak</span>}
                                    </dd>

                                    <dt>Blacklisted</dt>
                                    <dd>
                                        {nasabah.is_blacklisted
                                            ? <span style={{ color: 'var(--red)', fontWeight: 600 }}>Ya</span>
                                            : <span className="muted">Tidak</span>}
                                    </dd>

                                    <dt>Status</dt>
                                    <dd>
                                        <Badge
                                            status={nasabah.status === 'active' ? 'aktif' : nasabah.status === 'inactive' ? 'nonaktif' : 'eskalasi'}
                                            label={nasabah.status === 'active' ? 'Aktif' : nasabah.status === 'inactive' ? 'Nonaktif' : 'Diblokir'}
                                        />
                                    </dd>
                                </dl>
                            </div>
                        </div>

                        {/* Komposisi IRA Card */}
                        <div className="card" style={{ marginBottom: 16 }}>
                            <div className="card-head">
                                <h3>Komposisi Skor IRA</h3>
                                <Tag tone={riskKey === 'high' ? 'risk' : 'neutral'}>
                                    {RISK_LABEL[nasabah.risk_level] ?? '—'}
                                    {score ? ` · ${score}` : ''}
                                </Tag>
                            </div>
                            <div className="card-body">
                                <div style={{ display: 'flex', gap: 24, alignItems: 'center', marginBottom: 18, flexWrap: 'wrap' }}>
                                    <Donut
                                        value={score}
                                        size={120}
                                        thickness={14}
                                        color={donutColor}
                                        centerValue={score || '—'}
                                        centerLabel="IRA"
                                    />
                                    <div style={{ flex: 1, minWidth: 240, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        {factors.map((f) => (
                                            <FactorRow
                                                key={f.label}
                                                label={
                                                    <span>
                                                        {f.label} <span className="muted">w{f.weight}%</span>
                                                    </span>
                                                }
                                                value={f.score}
                                                weight={f.score}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="divider" />

                                <div className="kpi-label" style={{ marginBottom: 8 }}>Penjelasan</div>
                                <p className="muted" style={{ fontSize: 12, margin: 0 }}>
                                    Skor IRA dihitung dari 5 faktor terbobot. Profil &amp; pola transaksi memberikan kontribusi terbesar.
                                    {riskKey === 'high' && ' Disarankan EDD lanjutan dan supervisor approval untuk transaksi nominal besar.'}
                                    {riskKey === 'med'  && ' Konfirmasi sumber dana wajib untuk transaksi di atas Rp 100 juta.'}
                                    {riskKey === 'low'  && ' Profil risiko rendah — monitoring rutin sesuai jadwal CDD.'}
                                </p>
                            </div>
                        </div>

                        {/* 30-Day Transactions sub-table */}
                        <div className="card">
                            <div className="card-head">
                                <h3>Aktivitas Transaksi (30 hari)</h3>
                                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                    {alerts_recent.length > 0 && (
                                        <Tag tone="risk" leading={<span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--red)' }} />}>
                                            {alerts_recent.length} alert aktif
                                        </Tag>
                                    )}
                                    <Link
                                        href={route('transactions.index') + `?nasabah_id=${nasabah.id}`}
                                        className="btn ghost"
                                        style={{ fontSize: 12 }}
                                    >
                                        Lihat semua
                                    </Link>
                                </div>
                            </div>
                            <div className="card-body tight">
                                {transaksi_recent.length === 0 ? (
                                    <p className="muted" style={{ textAlign: 'center', padding: '24px 16px', fontSize: 12.5 }}>
                                        Belum ada transaksi.
                                    </p>
                                ) : (
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Tanggal</th>
                                                <th>No. Transaksi</th>
                                                <th>Jenis</th>
                                                <th style={{ textAlign: 'right' }}>Nominal</th>
                                                <th>Status</th>
                                                <th>Flag</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {transaksi_recent.slice(0, 5).map((t) => (
                                                <tr key={t.id}>
                                                    <td className="mono" style={{ fontSize: 11.5 }}>
                                                        {fmtShortDateTime(t.tanggal_transaksi)}
                                                    </td>
                                                    <td>
                                                        <Link
                                                            href={route('transactions.show', t.id)}
                                                            className="mono"
                                                            style={{ color: 'var(--primary)', fontWeight: 500 }}
                                                        >
                                                            {t.nomor_transaksi}
                                                        </Link>
                                                    </td>
                                                    <td>{t.jenis_transaksi}</td>
                                                    <td className="num">{CURRENCY.format(t.jumlah)}</td>
                                                    <td><Badge status={t.status} label={t.status} /></td>
                                                    <td>
                                                        {t.flagged || t.is_suspicious
                                                            ? <Tag tone="risk" leading={<span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--red)' }} />}>Alert</Tag>
                                                            : <span className="muted">—</span>}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </>
                }
                rail={
                    <>
                        {/* Recent Alerts */}
                        <div className="card" style={{ marginBottom: 16 }}>
                            <div className="card-head">
                                <h3>Alert Terbaru</h3>
                                <Link
                                    href={route('alerts.index') + `?nasabah_id=${nasabah.id}`}
                                    className="btn ghost"
                                    style={{ fontSize: 11.5 }}
                                >
                                    Semua
                                </Link>
                            </div>
                            <div className="card-body">
                                {alerts_recent.length === 0 ? (
                                    <p className="muted" style={{ textAlign: 'center', fontSize: 12, margin: '12px 0' }}>
                                        Tidak ada alert.
                                    </p>
                                ) : (
                                    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        {alerts_recent.slice(0, 5).map((a) => (
                                            <li
                                                key={a.id}
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: 4,
                                                    padding: '8px 0',
                                                    borderBottom: '1px solid var(--border)',
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                                                    <Link
                                                        href={route('alerts.show', a.id)}
                                                        style={{ color: 'var(--fg)', fontWeight: 500, fontSize: 12.5, textDecoration: 'none' }}
                                                    >
                                                        {a.title}
                                                    </Link>
                                                    <Badge status={a.severity} label={a.severity} />
                                                </div>
                                                <div className="muted" style={{ fontSize: 11 }}>
                                                    {fmtDate(a.created_at)} · <Badge status={a.status} label={a.status} />
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>

                        {/* Disposisi / Audit Trail */}
                        <div className="card">
                            <div className="card-head">
                                <h3>Disposisi &amp; Audit</h3>
                                <Tag>Riwayat</Tag>
                            </div>
                            <div className="card-body">
                                {trail.length === 0 ? (
                                    <p className="muted" style={{ textAlign: 'center', fontSize: 12, margin: '12px 0' }}>
                                        Tidak ada riwayat.
                                    </p>
                                ) : (
                                    <Timeline items={trail} />
                                )}
                            </div>
                        </div>
                    </>
                }
            />
        </AppLayout>
    );
}
