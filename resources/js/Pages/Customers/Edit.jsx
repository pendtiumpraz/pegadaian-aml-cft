import { Link, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/PageHeader';
import Tag from '@/Components/Tag';
import RiskPill from '@/Components/RiskPill';
import { Save, ChevronLeft } from 'lucide-react';

function FormField({ label, error, children, required, hint, span }) {
    return (
        <div style={{ gridColumn: span ? `span ${span}` : undefined }}>
            <label
                style={{
                    display: 'block',
                    color: 'var(--fg-2)',
                    fontSize: 12,
                    fontWeight: 500,
                    marginBottom: 6,
                }}
            >
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

/**
 * @param {{ nasabah: object }} props
 */
export default function NasabahEdit({ nasabah }) {
    const { data, setData, put, processing, errors } = useForm({
        nama:           nasabah.nama           ?? '',
        nik:            nasabah.nik            ?? '',
        npwp:           nasabah.npwp           ?? '',
        tanggal_lahir:  nasabah.tanggal_lahir  ?? '',
        jenis_kelamin:  nasabah.jenis_kelamin  ?? '',
        pekerjaan:      nasabah.pekerjaan      ?? '',
        alamat:         nasabah.alamat         ?? '',
        risk_level:     nasabah.risk_level     ?? 'low',
        is_pep:         Boolean(nasabah.is_pep),
        is_blacklisted: Boolean(nasabah.is_blacklisted),
        status:         nasabah.status         ?? 'active',
    });

    function submit(e) {
        e.preventDefault();
        put(route('customers.update', nasabah.id));
    }

    const score = Number(nasabah.skor_ira ?? nasabah.risk_score ?? 0) || undefined;

    return (
        <AppLayout title={`Edit: ${nasabah.nama}`}>
            <PageHeader
                title="Edit Nasabah"
                subtitle={`${nasabah.nama} · No. ${nasabah.nomor_nasabah}${nasabah.nik ? ` · NIK ${nasabah.nik}` : ''}`}
                meta={
                    <>
                        <RiskPill level={data.risk_level} score={score} />
                        {data.is_pep && <Tag tone="soft">PEP</Tag>}
                    </>
                }
                actions={
                    <Link href={route('customers.show', nasabah.id)} className="btn">
                        <ChevronLeft size={14} />
                        Kembali
                    </Link>
                }
            />

            <form onSubmit={submit}>
                {/* Identitas */}
                <div className="card" style={{ marginBottom: 16 }}>
                    <div className="card-head">
                        <h3>Identitas Nasabah</h3>
                        <Tag>Wajib</Tag>
                    </div>
                    <div className="card-body">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                            <FormField label="Nama Lengkap" error={errors.nama} required span={2}>
                                <input
                                    type="text"
                                    className="input"
                                    value={data.nama}
                                    onChange={e => setData('nama', e.target.value)}
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

                            <FormField label="Tanggal Lahir" error={errors.tanggal_lahir} required>
                                <input
                                    type="date"
                                    className="input"
                                    value={data.tanggal_lahir}
                                    onChange={e => setData('tanggal_lahir', e.target.value)}
                                />
                            </FormField>

                            <FormField label="Jenis Kelamin" error={errors.jenis_kelamin} required>
                                <select
                                    className="input"
                                    value={data.jenis_kelamin}
                                    onChange={e => setData('jenis_kelamin', e.target.value)}
                                >
                                    <option value="">-- Pilih --</option>
                                    <option value="L">Laki-laki</option>
                                    <option value="P">Perempuan</option>
                                </select>
                            </FormField>

                            <FormField label="Pekerjaan" error={errors.pekerjaan}>
                                <input
                                    type="text"
                                    className="input"
                                    value={data.pekerjaan}
                                    onChange={e => setData('pekerjaan', e.target.value)}
                                    placeholder="Contoh: Wiraswasta — Perdagangan"
                                />
                            </FormField>

                            <FormField label="Alamat" error={errors.alamat} required span={2}>
                                <textarea
                                    className="input"
                                    value={data.alamat}
                                    onChange={e => setData('alamat', e.target.value)}
                                    placeholder="Alamat lengkap sesuai KTP"
                                    rows={3}
                                    style={{ resize: 'vertical' }}
                                />
                            </FormField>
                        </div>
                    </div>
                </div>

                {/* Dokumen */}
                <div className="card" style={{ marginBottom: 16 }}>
                    <div className="card-head">
                        <h3>Dokumen Pendukung</h3>
                        <Tag>Opsional</Tag>
                    </div>
                    <div className="card-body">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                            <FormField label="NPWP" error={errors.npwp} hint="Nomor NPWP tanpa titik/strip">
                                <input
                                    type="text"
                                    className="input mono"
                                    value={data.npwp}
                                    onChange={e => setData('npwp', e.target.value)}
                                    placeholder="00.000.000.0-000.000"
                                />
                            </FormField>
                        </div>
                    </div>
                </div>

                {/* Profil Risiko */}
                <div className="card" style={{ marginBottom: 16 }}>
                    <div className="card-head">
                        <h3>Profil Risiko APU PPT</h3>
                        <RiskPill level={data.risk_level} score={score} />
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

                            <FormField label="Status Akun" error={errors.status} required>
                                <select
                                    className="input"
                                    value={data.status}
                                    onChange={e => setData('status', e.target.value)}
                                >
                                    <option value="active">Aktif</option>
                                    <option value="inactive">Nonaktif</option>
                                    <option value="blocked">Diblokir</option>
                                </select>
                            </FormField>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, gridColumn: 'span 2' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 12.5 }}>
                                    <input
                                        type="checkbox"
                                        checked={data.is_pep}
                                        onChange={e => setData('is_pep', e.target.checked)}
                                        style={{ width: 14, height: 14, accentColor: 'var(--primary)', cursor: 'pointer' }}
                                    />
                                    <span style={{ color: 'var(--fg)', fontWeight: 500 }}>
                                        Politically Exposed Person (PEP)
                                    </span>
                                </label>

                                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 12.5 }}>
                                    <input
                                        type="checkbox"
                                        checked={data.is_blacklisted}
                                        onChange={e => setData('is_blacklisted', e.target.checked)}
                                        style={{ width: 14, height: 14, accentColor: 'var(--primary)', cursor: 'pointer' }}
                                    />
                                    <span style={{ color: 'var(--fg)', fontWeight: 500 }}>
                                        Masuk Daftar Hitam (Blacklisted)
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <div className="card">
                    <div className="card-body" style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                        <Link href={route('customers.show', nasabah.id)} className="btn">
                            Batal
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="btn primary"
                        >
                            <Save size={14} />
                            {processing ? 'Menyimpan…' : 'Simpan Perubahan'}
                        </button>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}
