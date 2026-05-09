import { Link, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/PageHeader';
import Stepper from '@/Components/Stepper';
import Tag from '@/Components/Tag';
import { Save, ChevronLeft, UserPlus } from 'lucide-react';

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

export default function NasabahCreate() {
    const { data, setData, post, processing, errors } = useForm({
        nama:           '',
        nik:            '',
        npwp:           '',
        tanggal_lahir:  '',
        jenis_kelamin:  '',
        pekerjaan:      '',
        alamat:         '',
        risk_level:     'low',
        is_pep:         false,
        is_blacklisted: false,
    });

    function submit(e) {
        e.preventDefault();
        post(route('customers.store'));
    }

    const steps = [
        { label: 'Identitas',     sub: 'Data pribadi & KTP',          status: 'current' },
        { label: 'Dokumen',       sub: 'NPWP & pendukung',            status: 'pending' },
        { label: 'Profil Risiko', sub: 'IRA + flag PEP',              status: 'pending' },
        { label: 'Screening',     sub: 'DTTOT/DPPSPM/PEP',            status: 'pending' },
        { label: 'Konfirmasi',    sub: 'Review & simpan',             status: 'pending' },
    ];

    return (
        <AppLayout title="Onboarding Nasabah">
            <PageHeader
                title="Onboarding & CDD"
                subtitle="Customer Due Diligence — daftarkan calon nasabah baru ke dalam sistem AML/CFT"
                meta={<Tag tone="soft">Draft</Tag>}
                actions={
                    <Link href={route('customers.index')} className="btn">
                        <ChevronLeft size={14} />
                        Kembali
                    </Link>
                }
            />

            {/* Stepper */}
            <div className="card" style={{ padding: '16px 20px', marginBottom: 16 }}>
                <Stepper steps={steps} />
            </div>

            <form onSubmit={submit}>
                {/* Step 1 — Identitas */}
                <div className="card" style={{ marginBottom: 16 }}>
                    <div className="card-head">
                        <h3>1. Identitas Nasabah</h3>
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

                {/* Step 2 — Dokumen */}
                <div className="card" style={{ marginBottom: 16 }}>
                    <div className="card-head">
                        <h3>2. Dokumen Pendukung</h3>
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

                {/* Step 3 — Profil Risiko */}
                <div className="card" style={{ marginBottom: 16 }}>
                    <div className="card-head">
                        <h3>3. Profil Risiko APU PPT</h3>
                        <Tag tone="soft">IRA Awal</Tag>
                    </div>
                    <div className="card-body">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                            <FormField label="Risk Level Awal" error={errors.risk_level} required hint="IRA akan dihitung otomatis dari pola transaksi">
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

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'flex-end', paddingBottom: 4 }}>
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
                        {(errors.is_pep || errors.is_blacklisted) && (
                            <p style={{ color: 'var(--red)', fontSize: 11, marginTop: 8 }}>
                                {errors.is_pep || errors.is_blacklisted}
                            </p>
                        )}
                    </div>
                </div>

                {/* Step 4 — Screening (read-only placeholder) */}
                <div className="card" style={{ marginBottom: 16 }}>
                    <div className="card-head">
                        <h3>4. Screening Watchlist</h3>
                        <Tag>Otomatis pasca-simpan</Tag>
                    </div>
                    <div className="card-body">
                        <p className="muted" style={{ fontSize: 12.5, margin: 0 }}>
                            Screening DTTOT, DPPSPM, PEP database, dan sanksi internasional akan dijalankan otomatis
                            setelah data identitas tersimpan. Hasil screening akan tampil pada halaman detail nasabah.
                        </p>
                        <div className="divider" />
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                            {['DTTOT', 'DPPSPM', 'PEP Database', 'Sanksi Internasional'].map((s) => (
                                <div
                                    key={s}
                                    style={{
                                        padding: '10px 12px',
                                        border: '1px solid var(--border)',
                                        borderRadius: 'var(--radius)',
                                        background: 'var(--surface-2)',
                                    }}
                                >
                                    <strong style={{ fontSize: 12 }}>{s}</strong>
                                    <div className="muted" style={{ fontSize: 11, marginTop: 4 }}>
                                        Pending screening
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Step 5 — Konfirmasi (submit) */}
                <div className="card" style={{ marginBottom: 16 }}>
                    <div className="card-head">
                        <h3>5. Konfirmasi &amp; Simpan</h3>
                    </div>
                    <div className="card-body">
                        <p className="muted" style={{ fontSize: 12.5, margin: '0 0 12px' }}>
                            Pastikan seluruh data sudah benar sebelum menyimpan. Sistem akan men-generate Nomor Nasabah
                            dan menjalankan screening watchlist secara otomatis.
                        </p>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                            <Link href={route('customers.index')} className="btn">
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="btn primary"
                            >
                                <Save size={14} />
                                {processing ? 'Menyimpan…' : 'Simpan Nasabah'}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}
