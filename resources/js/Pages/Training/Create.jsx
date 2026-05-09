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

export default function PelatihanCreate() {
    const { data, setData, post, processing, errors } = useForm({
        judul:         '',
        deskripsi:     '',
        jenis:         'online',
        tanggal:       '',
        durasi_jam:    '',
        penyelenggara: '',
        status:        'planned',
    });

    function submit(e) {
        e.preventDefault();
        post(route('training.store'));
    }

    return (
        <AppLayout title="Tambah Pelatihan">
            <PageHeader
                title="Tambah Modul Pelatihan"
                subtitle="Daftarkan program pelatihan AML/CFT baru ke dalam sistem"
                actions={
                    <Link href={route('training.index')} className="btn">
                        <ChevronLeft size={14} /> Kembali
                    </Link>
                }
            />

            <form onSubmit={submit}>
                <div className="card" style={{ marginBottom: 16 }}>
                    <div className="card-head">
                        <h3>Informasi Pelatihan</h3>
                    </div>
                    <div className="card-body">
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                                gap: 14,
                            }}
                        >
                            <div style={{ gridColumn: '1 / -1' }}>
                                <FormField label="Judul Pelatihan" error={errors.judul} required>
                                    <input
                                        type="text"
                                        className="input"
                                        value={data.judul}
                                        onChange={e => setData('judul', e.target.value)}
                                        placeholder="Mis: Pelatihan Dasar AML/CFT 2026"
                                    />
                                </FormField>
                            </div>

                            <FormField label="Jenis Pelatihan" error={errors.jenis} required>
                                <select
                                    className="input"
                                    value={data.jenis}
                                    onChange={e => setData('jenis', e.target.value)}
                                >
                                    <option value="online">Online</option>
                                    <option value="offline">Offline</option>
                                    <option value="seminar">Seminar</option>
                                    <option value="workshop">Workshop</option>
                                </select>
                            </FormField>

                            <FormField label="Status Awal" error={errors.status} required>
                                <select
                                    className="input"
                                    value={data.status}
                                    onChange={e => setData('status', e.target.value)}
                                >
                                    <option value="planned">Direncanakan</option>
                                    <option value="ongoing">Berjalan</option>
                                    <option value="completed">Selesai</option>
                                    <option value="cancelled">Dibatalkan</option>
                                </select>
                            </FormField>

                            <FormField label="Tanggal Pelaksanaan" error={errors.tanggal} required>
                                <input
                                    type="date"
                                    className="input"
                                    value={data.tanggal}
                                    onChange={e => setData('tanggal', e.target.value)}
                                />
                            </FormField>

                            <FormField label="Durasi (jam)" error={errors.durasi_jam} required hint="Gunakan kelipatan 0.5 untuk setengah jam">
                                <input
                                    type="number"
                                    min={0.5}
                                    step={0.5}
                                    className="input mono"
                                    value={data.durasi_jam}
                                    onChange={e => setData('durasi_jam', e.target.value)}
                                    placeholder="Mis: 8"
                                    style={{ fontFamily: 'var(--font-mono)' }}
                                />
                            </FormField>

                            <FormField label="Penyelenggara" error={errors.penyelenggara}>
                                <input
                                    type="text"
                                    className="input"
                                    value={data.penyelenggara}
                                    onChange={e => setData('penyelenggara', e.target.value)}
                                    placeholder="Mis: OJK, PPATK, Internal"
                                />
                            </FormField>

                            <div style={{ gridColumn: '1 / -1' }}>
                                <FormField label="Deskripsi" error={errors.deskripsi}>
                                    <textarea
                                        className="input"
                                        value={data.deskripsi}
                                        onChange={e => setData('deskripsi', e.target.value)}
                                        placeholder="Uraikan materi, tujuan, dan sasaran pelatihan…"
                                        rows={4}
                                        style={{ resize: 'vertical' }}
                                    />
                                </FormField>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                    <Link href={route('training.index')} className="btn">Batal</Link>
                    <button
                        type="submit"
                        disabled={processing}
                        className="btn primary"
                        style={{ opacity: processing ? 0.65 : 1 }}
                    >
                        <Save size={14} />
                        {processing ? 'Menyimpan…' : 'Simpan Pelatihan'}
                    </button>
                </div>
            </form>
        </AppLayout>
    );
}
