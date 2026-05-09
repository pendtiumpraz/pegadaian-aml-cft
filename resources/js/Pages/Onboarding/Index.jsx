import { useMemo } from 'react';
import { useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/PageHeader';
import Stepper from '@/Components/Stepper';
import Tag from '@/Components/Tag';
import Donut from '@/Components/Donut';
import FactorRow from '@/Components/FactorRow';
import {
    UserPlus, Save, Sparkles, Upload, FileText, IdCard,
    Camera, Receipt, ShieldCheck, AlertTriangle, CheckCircle2,
} from 'lucide-react';

function FormField({ label, error, children, required, hint, span }) {
    return (
        <div style={{ gridColumn: span ? `span ${span}` : undefined }}>
            <label style={{
                display: 'block',
                color: 'var(--fg-2)',
                fontSize: 12,
                fontWeight: 500,
                marginBottom: 6,
            }}>
                {label}{required && <span style={{ color: 'var(--red)' }}> *</span>}
            </label>
            {children}
            {hint && !error && (
                <p className="muted" style={{ fontSize: 11, margin: '4px 0 0' }}>{hint}</p>
            )}
            {error && (
                <p style={{ color: 'var(--red)', fontSize: 11, margin: '4px 0 0' }}>{error}</p>
            )}
        </div>
    );
}

function Dropzone({ icon: Icon, label, hint, file, onChange }) {
    return (
        <label style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
            padding: 18,
            border: '1.5px dashed var(--border)',
            borderRadius: 'var(--radius)',
            background: file ? 'var(--primary-soft, var(--surface-2))' : 'var(--surface-2)',
            cursor: 'pointer',
            textAlign: 'center',
            transition: 'background 0.15s',
        }}>
            {file ? (
                <CheckCircle2 size={26} strokeWidth={1.75} style={{ color: 'var(--primary)' }} />
            ) : (
                <Icon size={26} strokeWidth={1.5} style={{ color: 'var(--fg-3)' }} />
            )}
            <div>
                <div style={{ fontSize: 12.5, fontWeight: 600 }}>{label}</div>
                <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>
                    {file ? file.name : (hint ?? 'Klik untuk upload · JPG/PNG/PDF')}
                </div>
            </div>
            <input
                type="file"
                accept="image/*,application/pdf"
                style={{ display: 'none' }}
                onChange={(e) => onChange(e.target.files?.[0] ?? null)}
            />
        </label>
    );
}

function ScreeningTile({ name, status, count, onRun }) {
    const tone = status === 'clear' ? 'green' : status === 'pending' ? 'amber' : 'red';
    const Icon = status === 'clear' ? CheckCircle2 : status === 'pending' ? AlertTriangle : ShieldCheck;
    const color = status === 'clear' ? 'var(--primary)' : status === 'pending' ? 'var(--amber)' : 'var(--red)';

    return (
        <div style={{
            padding: 14,
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            background: 'var(--surface-2)',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: 12.5 }}>{name}</strong>
                <Tag tone={tone}>
                    {status === 'clear' ? '● Clear' : status === 'pending' ? '⚠ Pending' : '× Match'}
                </Tag>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon size={14} style={{ color }} />
                <span style={{ fontSize: 12 }}>
                    {status === 'clear'
                        ? `${count} record dipindai · 0 match`
                        : status === 'pending'
                            ? 'Belum dijalankan'
                            : `${count} potensi match — review`}
                </span>
            </div>
            <button
                type="button"
                className="btn"
                style={{ marginTop: 'auto', justifyContent: 'center', fontSize: 11.5, padding: '6px 10px' }}
                onClick={onRun}
            >
                <ShieldCheck size={12} /> Run Sekarang
            </button>
        </div>
    );
}

export default function OnboardingIndex() {
    const { data, setData, post, processing, errors, transform } = useForm({
        // Identitas
        name:             '',
        nik:              '',
        npwp:             '',
        dob:              '',
        pob:              '',
        gender:           '',
        occupation:       '',
        address:          '',
        nationality:      'Indonesia',
        // Dokumen — files held client-side; not posted to backend in this mock
        doc_ktp:          null,
        doc_npwp:         null,
        doc_selfie:       null,
        doc_income:       null,
        // Profil Risiko
        risk_level:       'low',
        pep_flag:         false,
        is_blacklisted:   false,
        edd_required:     false,
        // Hidden derived fields
        ira_score:        45,
    });

    /* IRA score breakdown — derived */
    const factors = useMemo(() => {
        const profile  = data.pep_flag ? 78 : 42;
        const geo      = 35;
        const product  = 48;
        const txnPattern = data.risk_level === 'high' || data.risk_level === 'critical' ? 75 : 52;
        const channel  = 50;
        return [
            { label: 'Profil Nasabah',    detail: data.occupation || 'Belum diisi',        score: profile,    weight: 20 },
            { label: 'Geografi',           detail: data.address ? data.address.slice(0, 40) : 'Belum diisi', score: geo,        weight: 15 },
            { label: 'Produk',             detail: 'Gadai emas · default',                  score: product,    weight: 25 },
            { label: 'Pola Transaksi (estimasi)', detail: 'Estimasi awal',                  score: txnPattern, weight: 30 },
            { label: 'Channel',            detail: 'Outlet + Digital',                      score: channel,    weight: 10 },
        ];
    }, [data.pep_flag, data.occupation, data.address, data.risk_level]);

    const iraScore = useMemo(() => {
        let total = 0;
        for (const f of factors) total += (f.score * f.weight) / 100;
        return Math.round(total);
    }, [factors]);

    const iraColor =
        iraScore >= 70 ? 'var(--red)' :
        iraScore >= 50 ? 'var(--amber)' :
                         'var(--primary)';

    const iraTier =
        iraScore >= 70 ? 'Tinggi' :
        iraScore >= 50 ? 'Menengah' :
                         'Rendah';

    function submit(e) {
        e.preventDefault();
        // Inject derived ira_score and strip File objects (controller does not consume uploads in this mock).
        transform((d) => {
            const { doc_ktp, doc_npwp, doc_selfie, doc_income, ...rest } = d;
            return { ...rest, ira_score: iraScore };
        });
        post(route('onboarding.store'));
    }

    const steps = [
        { label: 'Identitas',     sub: 'Data pribadi & NIK',        status: data.name && data.nik ? 'done' : 'current' },
        { label: 'Dokumen',       sub: 'KTP/NPWP/Selfie',           status: data.doc_ktp ? 'done' : 'pending' },
        { label: 'Profil Risiko', sub: 'Level + flag PEP',          status: data.risk_level ? 'done' : 'pending' },
        { label: 'Screening',     sub: 'DTTOT/DPPSPM/OFAC',         status: 'pending' },
        { label: 'Konfirmasi',    sub: `IRA ${iraScore}/100`,       status: 'pending' },
    ];

    return (
        <AppLayout title="Onboarding Nasabah">
            <PageHeader
                title="Onboarding Nasabah Baru"
                subtitle="Customer Due Diligence · 5 langkah · IRA dihitung otomatis"
                meta={
                    <Tag tone="soft" style={{ background: 'oklch(0.92 0.06 85)', color: 'oklch(0.40 0.12 75)' }}>
                        <Sparkles size={11} style={{ marginRight: 4 }} /> NEW
                    </Tag>
                }
                actions={
                    <button type="button" className="btn">
                        <FileText size={14} /> Simpan Draft
                    </button>
                }
            />

            {/* Stepper */}
            <div className="card" style={{ padding: '16px 20px', marginBottom: 16 }}>
                <Stepper steps={steps} />
            </div>

            {/* AI Suggestion callout */}
            <div className="card" style={{
                marginBottom: 16,
                padding: '14px 18px',
                background: 'oklch(0.95 0.04 85 / 0.4)',
                border: '1px dashed oklch(0.70 0.10 85)',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
            }}>
                <Sparkles size={18} style={{ color: 'oklch(0.50 0.14 75)', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600 }}>
                        AI: Auto-fill data dari foto KTP
                    </div>
                    <div className="muted" style={{ fontSize: 11.5, marginTop: 2 }}>
                        Upload foto KTP untuk mengisi NIK, nama, alamat, tanggal lahir, dan jenis kelamin secara otomatis.
                    </div>
                </div>
                <button type="button" className="btn">
                    <Upload size={14} /> Upload KTP
                </button>
            </div>

            <form onSubmit={submit}>
                {/* 1. Identitas */}
                <div className="card" style={{ marginBottom: 16 }}>
                    <div className="card-head">
                        <h3>1. Identitas</h3>
                        <Tag>Wajib</Tag>
                    </div>
                    <div className="card-body">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                            <FormField label="Nama Lengkap" error={errors.name} required span={2}>
                                <input
                                    type="text"
                                    className="input"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    placeholder="Sesuai KTP"
                                />
                            </FormField>

                            <FormField label="NIK (No. KTP)" error={errors.nik} required hint="16 digit angka">
                                <input
                                    type="text"
                                    className="input mono"
                                    value={data.nik}
                                    onChange={e => setData('nik', e.target.value)}
                                    placeholder="3174060103820001"
                                    maxLength={16}
                                    inputMode="numeric"
                                />
                            </FormField>

                            <FormField label="NPWP" error={errors.npwp} hint="Opsional">
                                <input
                                    type="text"
                                    className="input mono"
                                    value={data.npwp}
                                    onChange={e => setData('npwp', e.target.value)}
                                    placeholder="00.000.000.0-000.000"
                                />
                            </FormField>

                            <FormField label="Tanggal Lahir" error={errors.dob} required>
                                <input
                                    type="date"
                                    className="input"
                                    value={data.dob}
                                    onChange={e => setData('dob', e.target.value)}
                                />
                            </FormField>

                            <FormField label="Jenis Kelamin" error={errors.gender} required>
                                <div style={{ display: 'flex', gap: 16, alignItems: 'center', height: 38 }}>
                                    {[['M', 'Laki-laki'], ['F', 'Perempuan']].map(([v, label]) => (
                                        <label key={v} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, cursor: 'pointer' }}>
                                            <input
                                                type="radio"
                                                name="gender"
                                                value={v}
                                                checked={data.gender === v}
                                                onChange={e => setData('gender', e.target.value)}
                                                style={{ accentColor: 'var(--primary)', cursor: 'pointer' }}
                                            />
                                            {label}
                                        </label>
                                    ))}
                                </div>
                            </FormField>

                            <FormField label="Pekerjaan" error={errors.occupation}>
                                <input
                                    type="text"
                                    className="input"
                                    value={data.occupation}
                                    onChange={e => setData('occupation', e.target.value)}
                                    placeholder="Contoh: Karyawan swasta"
                                />
                            </FormField>

                            <FormField label="Kebangsaan" error={errors.nationality}>
                                <input
                                    type="text"
                                    className="input"
                                    value={data.nationality}
                                    onChange={e => setData('nationality', e.target.value)}
                                    placeholder="Indonesia"
                                />
                            </FormField>

                            <FormField label="Alamat" error={errors.address} required span={2}>
                                <textarea
                                    className="input"
                                    value={data.address}
                                    onChange={e => setData('address', e.target.value)}
                                    rows={3}
                                    placeholder="Alamat lengkap sesuai KTP"
                                    style={{ resize: 'vertical' }}
                                />
                            </FormField>
                        </div>
                    </div>
                </div>

                {/* 2. Dokumen */}
                <div className="card" style={{ marginBottom: 16 }}>
                    <div className="card-head">
                        <h3>2. Dokumen</h3>
                        <Tag>4 dokumen</Tag>
                    </div>
                    <div className="card-body">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
                            <Dropzone
                                icon={IdCard}
                                label="KTP"
                                hint="Foto KTP yang jelas"
                                file={data.doc_ktp}
                                onChange={(f) => setData('doc_ktp', f)}
                            />
                            <Dropzone
                                icon={FileText}
                                label="NPWP"
                                hint="Kartu NPWP (opsional)"
                                file={data.doc_npwp}
                                onChange={(f) => setData('doc_npwp', f)}
                            />
                            <Dropzone
                                icon={Camera}
                                label="Selfie + KTP"
                                hint="Pegang KTP dekat wajah"
                                file={data.doc_selfie}
                                onChange={(f) => setData('doc_selfie', f)}
                            />
                            <Dropzone
                                icon={Receipt}
                                label="Bukti Penghasilan"
                                hint="Slip gaji / SPT (opsional)"
                                file={data.doc_income}
                                onChange={(f) => setData('doc_income', f)}
                            />
                        </div>
                    </div>
                </div>

                {/* 3. Profil Risiko */}
                <div className="card" style={{ marginBottom: 16 }}>
                    <div className="card-head">
                        <h3>3. Profil Risiko</h3>
                        <Tag tone="soft">APU PPT</Tag>
                    </div>
                    <div className="card-body">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                            <FormField label="Risk Level" error={errors.risk_level} required>
                                <select
                                    className="input"
                                    value={data.risk_level}
                                    onChange={e => setData('risk_level', e.target.value)}
                                >
                                    <option value="low">Rendah (Low)</option>
                                    <option value="medium">Sedang (Medium)</option>
                                    <option value="high">Tinggi (High)</option>
                                    <option value="critical">Kritis (Critical)</option>
                                </select>
                            </FormField>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'flex-end' }}>
                                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 12.5 }}>
                                    <input
                                        type="checkbox"
                                        checked={data.pep_flag}
                                        onChange={e => setData('pep_flag', e.target.checked)}
                                        style={{ width: 14, height: 14, accentColor: 'var(--primary)', cursor: 'pointer' }}
                                    />
                                    <span style={{ fontWeight: 500 }}>Politically Exposed Person (PEP)</span>
                                </label>

                                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 12.5 }}>
                                    <input
                                        type="checkbox"
                                        checked={data.is_blacklisted}
                                        onChange={e => setData('is_blacklisted', e.target.checked)}
                                        style={{ width: 14, height: 14, accentColor: 'var(--primary)', cursor: 'pointer' }}
                                    />
                                    <span style={{ fontWeight: 500 }}>Masuk Daftar Hitam (Blacklisted)</span>
                                </label>

                                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 12.5 }}>
                                    <input
                                        type="checkbox"
                                        checked={data.edd_required || data.pep_flag || data.risk_level === 'high' || data.risk_level === 'critical'}
                                        onChange={e => setData('edd_required', e.target.checked)}
                                        style={{ width: 14, height: 14, accentColor: 'var(--primary)', cursor: 'pointer' }}
                                    />
                                    <span style={{ fontWeight: 500 }}>EDD Required</span>
                                    <Tag tone="soft" style={{ marginLeft: 'auto', fontSize: 10 }}>Auto-derived</Tag>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. Screening */}
                <div className="card" style={{ marginBottom: 16 }}>
                    <div className="card-head">
                        <h3>4. Screening Watchlist</h3>
                        <Tag>4 sumber</Tag>
                    </div>
                    <div className="card-body">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
                            <ScreeningTile
                                name="DTTOT"
                                status="clear"
                                count="412k"
                                onRun={() => alert('Re-run DTTOT screening')}
                            />
                            <ScreeningTile
                                name="DPPSPM"
                                status="clear"
                                count="38k"
                                onRun={() => alert('Re-run DPPSPM screening')}
                            />
                            <ScreeningTile
                                name="OFAC"
                                status="clear"
                                count="89k"
                                onRun={() => alert('Re-run OFAC screening')}
                            />
                            <ScreeningTile
                                name="Internal Watchlist"
                                status="pending"
                                count={0}
                                onRun={() => alert('Run internal watchlist screening')}
                            />
                        </div>
                    </div>
                </div>

                {/* 5. Konfirmasi & IRA */}
                <div className="card" style={{ marginBottom: 16 }}>
                    <div className="card-head">
                        <h3>5. Konfirmasi &amp; Skoring IRA</h3>
                        <Tag tone={iraScore >= 70 ? 'red' : iraScore >= 50 ? 'amber' : 'green'}>
                            {iraTier} · {iraScore}/100
                        </Tag>
                    </div>
                    <div className="card-body">
                        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24, alignItems: 'center' }}>
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                <Donut
                                    value={iraScore}
                                    size={200}
                                    thickness={16}
                                    color={iraColor}
                                    centerValue={iraScore}
                                    centerLabel={`${iraTier} risiko`}
                                />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                <div className="kpi-label" style={{ marginBottom: 4 }}>
                                    Komponen IRA (Individual Risk Assessment)
                                </div>
                                {factors.map((f) => (
                                    <FactorRow
                                        key={f.label}
                                        label={
                                            <div>
                                                <div style={{ fontWeight: 500, fontSize: 12.5 }}>{f.label}</div>
                                                <div className="muted" style={{ fontSize: 11 }}>
                                                    {f.detail} · bobot {f.weight}%
                                                </div>
                                            </div>
                                        }
                                        value={`${f.score}/100`}
                                        weight={f.score}
                                    />
                                ))}
                            </div>
                        </div>

                        <div style={{
                            marginTop: 16,
                            padding: 14,
                            background: 'var(--surface-2)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius)',
                            fontSize: 12.5,
                            lineHeight: 1.6,
                        }}>
                            <strong style={{ display: 'block', marginBottom: 4 }}>Ringkasan Onboarding</strong>
                            <span className="muted">
                                Calon nasabah <strong>{data.name || '—'}</strong> ({data.nik || 'NIK belum diisi'}) akan
                                disimpan dengan profil risiko <strong>{iraTier.toLowerCase()}</strong> (IRA {iraScore}/100).
                                {data.pep_flag && ' Status PEP terdeteksi — EDD wajib.'}
                                {data.risk_level === 'high' || data.risk_level === 'critical'
                                    ? ' Persetujuan Supervisor Cabang diperlukan untuk transaksi > Rp 100jt.'
                                    : ' Persetujuan standar.'}
                            </span>
                        </div>

                        <div style={{
                            marginTop: 16,
                            paddingTop: 14,
                            borderTop: '1px solid var(--border)',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: 8,
                        }}>
                            <button
                                type="submit"
                                disabled={processing}
                                className="btn primary"
                                style={{ padding: '10px 20px', fontSize: 13 }}
                            >
                                <UserPlus size={14} />
                                {processing ? 'Menyimpan…' : 'Submit & Buat Nasabah'}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}
