import { Link, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/PageHeader';
import { Save, ChevronLeft } from 'lucide-react';

function FormField({ label, error, children, required, hint }) {
    return (
        <div>
            <label
                style={{
                    display: 'block',
                    color: 'var(--fg-2)',
                    fontSize: 11.5,
                    fontWeight: 500,
                    marginBottom: 6,
                }}
            >
                {label}{required && <span style={{ color: 'var(--red)' }}> *</span>}
            </label>
            {children}
            {hint && <p style={{ color: 'var(--fg-3)', fontSize: 11, marginTop: 4 }}>{hint}</p>}
            {error && <p style={{ color: 'var(--red)', fontSize: 11.5, marginTop: 4 }}>{error}</p>}
        </div>
    );
}

/**
 * @param {{
 *   nasabah?: Array<{ id: number, nama: string, nomor_nasabah: string }>,
 *   kasus?:   Array<{ id: number, nomor_kasus: string, jenis_kasus: string }>,
 * }} props
 */
export default function LtkmCreate({ nasabah = [], kasus = [] }) {
    const { data, setData, post, processing, errors } = useForm({
        nasabah_id:             '',
        kasus_id:               '',
        jumlah_total:           '',
        periode_mulai:          '',
        periode_selesai:        '',
        ringkasan_transaksi:    '',
        indikasi_tindak_pidana: '',
    });

    function submit(e) {
        e.preventDefault();
        post(route('ltkm.store'));
    }

    return (
        <AppLayout title="Buat LTKM Baru">
            <PageHeader
                title="Buat Laporan LTKM"
                subtitle="Susun laporan transaksi keuangan mencurigakan untuk dikirim ke PPATK · Format XML PPATK"
                actions={
                    <Link href={route('ltkm.index')} className="btn">
                        <ChevronLeft size={14} /> Kembali
                    </Link>
                }
            />

            <form onSubmit={submit}>
                {/* Section A — Identitas Pelapor */}
                <div className="card" style={{ marginBottom: 16 }}>
                    <div className="card-head">
                        <h3>A. Identitas Pelapor</h3>
                        <span className="sub">Otomatis terisi dari profil PJK</span>
                    </div>
                    <div className="card-body">
                        <dl className="field-list">
                            <dt>Nama PJK</dt>
                            <dd>PT Pegadaian</dd>
                            <dt>Pelapor</dt>
                            <dd>Diambil dari user login</dd>
                            <dt>Tanggal Lap.</dt>
                            <dd className="mono">{new Date().toLocaleDateString('id-ID')}</dd>
                        </dl>
                    </div>
                </div>

                {/* Section B — Identitas Nasabah / Kasus */}
                <div className="card" style={{ marginBottom: 16 }}>
                    <div className="card-head">
                        <h3>B. Identitas Nasabah &amp; Kasus</h3>
                    </div>
                    <div className="card-body">
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                                gap: 14,
                            }}
                        >
                            <FormField label="Nasabah" error={errors.nasabah_id} required>
                                <select
                                    className="input"
                                    value={data.nasabah_id}
                                    onChange={e => setData('nasabah_id', e.target.value)}
                                >
                                    <option value="">— Pilih Nasabah —</option>
                                    {nasabah.map(n => (
                                        <option key={n.id} value={n.id}>
                                            {n.nomor_nasabah} — {n.nama}
                                        </option>
                                    ))}
                                </select>
                            </FormField>

                            <FormField label="Kasus Terkait (opsional)" error={errors.kasus_id}>
                                <select
                                    className="input"
                                    value={data.kasus_id}
                                    onChange={e => setData('kasus_id', e.target.value)}
                                >
                                    <option value="">— Pilih Kasus —</option>
                                    {kasus.map(k => (
                                        <option key={k.id} value={k.id}>
                                            {k.nomor_kasus} — {k.jenis_kasus}
                                        </option>
                                    ))}
                                </select>
                            </FormField>
                        </div>
                    </div>
                </div>

                {/* Section C — Detail Transaksi */}
                <div className="card" style={{ marginBottom: 16 }}>
                    <div className="card-head">
                        <h3>C. Periode &amp; Jumlah Transaksi</h3>
                    </div>
                    <div className="card-body">
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                                gap: 14,
                            }}
                        >
                            <FormField label="Periode Mulai" error={errors.periode_mulai} required>
                                <input
                                    type="date"
                                    className="input"
                                    value={data.periode_mulai}
                                    onChange={e => setData('periode_mulai', e.target.value)}
                                />
                            </FormField>

                            <FormField label="Periode Selesai" error={errors.periode_selesai} required>
                                <input
                                    type="date"
                                    className="input"
                                    value={data.periode_selesai}
                                    onChange={e => setData('periode_selesai', e.target.value)}
                                />
                            </FormField>

                            <FormField label="Jumlah Total (IDR)" error={errors.jumlah_total} required>
                                <input
                                    type="number"
                                    min={0}
                                    className="input mono"
                                    value={data.jumlah_total}
                                    onChange={e => setData('jumlah_total', e.target.value)}
                                    placeholder="0"
                                    style={{ fontFamily: 'var(--font-mono)' }}
                                />
                            </FormField>
                        </div>
                    </div>
                </div>

                {/* Section D — Indikasi Tindak Pidana */}
                <div className="card" style={{ marginBottom: 16 }}>
                    <div className="card-head">
                        <h3>D. Narasi Laporan</h3>
                        <span className="sub">Akan diserialisasi ke XML PPATK</span>
                    </div>
                    <div className="card-body" style={{ display: 'grid', gap: 14 }}>
                        <FormField label="Ringkasan Transaksi" error={errors.ringkasan_transaksi} required>
                            <textarea
                                className="input"
                                value={data.ringkasan_transaksi}
                                onChange={e => setData('ringkasan_transaksi', e.target.value)}
                                placeholder="Uraikan ringkasan transaksi yang mencurigakan…"
                                rows={5}
                                style={{ resize: 'vertical' }}
                            />
                        </FormField>

                        <FormField label="Indikasi Tindak Pidana" error={errors.indikasi_tindak_pidana} required>
                            <textarea
                                className="input"
                                value={data.indikasi_tindak_pidana}
                                onChange={e => setData('indikasi_tindak_pidana', e.target.value)}
                                placeholder="Sebutkan pasal/indikasi tindak pidana yang relevan…"
                                rows={5}
                                style={{ resize: 'vertical' }}
                            />
                        </FormField>
                    </div>
                </div>

                {/* Submit */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                    <Link href={route('ltkm.index')} className="btn">Batal</Link>
                    <button
                        type="submit"
                        disabled={processing}
                        className="btn primary"
                        style={{ opacity: processing ? 0.65 : 1 }}
                    >
                        <Save size={14} />
                        {processing ? 'Menyimpan…' : 'Simpan Draft LTKM'}
                    </button>
                </div>
            </form>
        </AppLayout>
    );
}
