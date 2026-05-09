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

export default function WatchlistCreate() {
    const { data, setData, transform, post, processing, errors } = useForm({
        jenis:          'internal',
        nama:           '',
        alias_json:     '',
        nik:            '',
        npwp:           '',
        tanggal_lahir:  '',
        kebangsaan:     '',
        keterangan:     '',
        sumber:         '',
        is_active:      true,
        tanggal_masuk:  '',
    });

    /* Convert alias_json from comma-separated string to array on submit */
    transform(d => ({
        ...d,
        alias_json: d.alias_json
            ? d.alias_json.split(',').map(s => s.trim()).filter(Boolean)
            : [],
    }));

    function submit(e) {
        e.preventDefault();
        post(route('watchlist.store'));
    }

    return (
        <AppLayout title="Tambah Entri Watchlist">
            <PageHeader
                title="Tambah Entri Watchlist"
                subtitle="Daftarkan entitas baru ke dalam daftar pantau"
                actions={
                    <Link href={route('watchlist.index')} className="btn">
                        <ChevronLeft size={14} /> Kembali
                    </Link>
                }
            />

            <form onSubmit={submit}>
                {/* Identitas */}
                <div className="card" style={{ marginBottom: 16 }}>
                    <div className="card-head">
                        <h3>Identitas Entitas</h3>
                    </div>
                    <div className="card-body">
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                                gap: 14,
                            }}
                        >
                            <FormField label="Jenis Watchlist" error={errors.jenis} required>
                                <select
                                    className="input"
                                    value={data.jenis}
                                    onChange={e => setData('jenis', e.target.value)}
                                >
                                    <option value="internal">Internal</option>
                                    <option value="pep">PEP (Politically Exposed Person)</option>
                                    <option value="sanctions">Sanksi</option>
                                    <option value="terrorist">Teroris</option>
                                </select>
                            </FormField>

                            <FormField label="Nama Lengkap" error={errors.nama} required>
                                <input
                                    type="text"
                                    className="input"
                                    value={data.nama}
                                    onChange={e => setData('nama', e.target.value)}
                                    placeholder="Nama lengkap entitas"
                                />
                            </FormField>

                            <FormField
                                label="Alias"
                                error={errors.alias_json}
                                hint="Pisahkan beberapa alias dengan koma, mis: Ali, Al-Habib, A. Rahman"
                            >
                                <input
                                    type="text"
                                    className="input"
                                    value={data.alias_json}
                                    onChange={e => setData('alias_json', e.target.value)}
                                    placeholder="Alias 1, Alias 2, …"
                                />
                            </FormField>

                            <FormField label="NIK" error={errors.nik}>
                                <input
                                    type="text"
                                    className="input mono"
                                    value={data.nik}
                                    onChange={e => setData('nik', e.target.value)}
                                    placeholder="Nomor Induk Kependudukan"
                                    maxLength={16}
                                    style={{ fontFamily: 'var(--font-mono)' }}
                                />
                            </FormField>

                            <FormField label="NPWP" error={errors.npwp}>
                                <input
                                    type="text"
                                    className="input"
                                    value={data.npwp}
                                    onChange={e => setData('npwp', e.target.value)}
                                    placeholder="Nomor NPWP (opsional)"
                                    style={{ fontFamily: 'var(--font-mono)' }}
                                />
                            </FormField>

                            <FormField label="Tanggal Lahir" error={errors.tanggal_lahir}>
                                <input
                                    type="date"
                                    className="input"
                                    value={data.tanggal_lahir}
                                    onChange={e => setData('tanggal_lahir', e.target.value)}
                                />
                            </FormField>

                            <FormField label="Kebangsaan" error={errors.kebangsaan}>
                                <input
                                    type="text"
                                    className="input"
                                    value={data.kebangsaan}
                                    onChange={e => setData('kebangsaan', e.target.value)}
                                    placeholder="Mis: Indonesia, Malaysia"
                                />
                            </FormField>
                        </div>
                    </div>
                </div>

                {/* Sumber & Status */}
                <div className="card" style={{ marginBottom: 16 }}>
                    <div className="card-head">
                        <h3>Sumber &amp; Status</h3>
                    </div>
                    <div className="card-body">
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                                gap: 14,
                            }}
                        >
                            <FormField label="Sumber Data" error={errors.sumber}>
                                <input
                                    type="text"
                                    className="input"
                                    value={data.sumber}
                                    onChange={e => setData('sumber', e.target.value)}
                                    placeholder="Mis: PPATK, UN Security Council, OJK"
                                />
                            </FormField>

                            <FormField label="Tanggal Masuk" error={errors.tanggal_masuk}>
                                <input
                                    type="date"
                                    className="input"
                                    value={data.tanggal_masuk}
                                    onChange={e => setData('tanggal_masuk', e.target.value)}
                                />
                            </FormField>

                            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                                    <span
                                        style={{
                                            width: 28,
                                            height: 16,
                                            borderRadius: 8,
                                            background: data.is_active ? 'var(--primary)' : 'var(--surface-3)',
                                            position: 'relative',
                                            display: 'inline-block',
                                            transition: 'background 0.15s',
                                        }}
                                    >
                                        <span
                                            style={{
                                                position: 'absolute',
                                                width: 12,
                                                height: 12,
                                                borderRadius: '50%',
                                                background: '#fff',
                                                top: 2,
                                                left: data.is_active ? 14 : 2,
                                                transition: 'left 0.15s',
                                            }}
                                        />
                                    </span>
                                    <input
                                        type="checkbox"
                                        checked={data.is_active}
                                        onChange={e => setData('is_active', e.target.checked)}
                                        style={{ display: 'none' }}
                                    />
                                    <span style={{ fontSize: 12.5, color: 'var(--fg)', fontWeight: 500 }}>
                                        Entri Aktif
                                    </span>
                                </label>
                            </div>

                            <div style={{ gridColumn: '1 / -1' }}>
                                <FormField label="Keterangan" error={errors.keterangan}>
                                    <textarea
                                        className="input"
                                        value={data.keterangan}
                                        onChange={e => setData('keterangan', e.target.value)}
                                        placeholder="Keterangan tambahan tentang entitas ini…"
                                        rows={3}
                                        style={{ resize: 'vertical' }}
                                    />
                                </FormField>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                    <Link href={route('watchlist.index')} className="btn">Batal</Link>
                    <button
                        type="submit"
                        disabled={processing}
                        className="btn primary"
                        style={{ opacity: processing ? 0.65 : 1 }}
                    >
                        <Save size={14} />
                        {processing ? 'Menyimpan…' : 'Simpan Entri'}
                    </button>
                </div>
            </form>
        </AppLayout>
    );
}
