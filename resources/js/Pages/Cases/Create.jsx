import { Link, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/PageHeader';
import { Save, ChevronLeft } from 'lucide-react';

const inputCss = {
    width: '100%',
    padding: '6px 10px',
    fontSize: 12.5,
    background: 'var(--surface-2)',
    border: '1px solid var(--border)',
    borderRadius: 6,
    color: 'var(--fg)',
    outline: 'none',
    fontFamily: 'inherit',
};

function FormField({ label, error, required, children }) {
    return (
        <div>
            <label
                style={{
                    display: 'block',
                    fontSize: 11.5,
                    color: 'var(--fg-3)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: 6,
                    fontWeight: 500,
                }}
            >
                {label}{required && <span style={{ color: 'var(--red)' }}> *</span>}
            </label>
            {children}
            {error && (
                <p style={{ color: 'var(--red)', fontSize: 11, margin: '4px 0 0' }}>
                    {error}
                </p>
            )}
        </div>
    );
}

/**
 * @param {{
 *   customers?: Array<{ id: number, cif: string, name: string }>,
 *   alerts?:    Array<{ id: number, alert_id?: string, type?: string }>,
 * }} props
 */
export default function KasusCreate({ customers = [], alerts = [] }) {
    const { data, setData, post, processing, errors } = useForm({
        case_id:     '',
        alert_id:    '',
        customer_id: '',
        analyst_id:  '',
        state:       'open',
        decision:    '',
        narrative:   '',
        sla_due_at:  '',
    });

    function submit(e) {
        e.preventDefault();
        post(route('cases.store'));
    }

    return (
        <AppLayout title="Buat Kasus Baru">
            <PageHeader
                title="Buat Kasus Baru"
                subtitle="Buat kasus investigasi AML/CFT"
                actions={
                    <Link href={route('cases.index')} className="btn">
                        <ChevronLeft size={14} /> Kembali
                    </Link>
                }
            />

            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Identitas */}
                <div className="card">
                    <div className="card-head">
                        <h3>Identitas Kasus</h3>
                    </div>
                    <div className="card-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
                        <FormField label="Nomor Kasus" error={errors.case_id}>
                            <input
                                type="text"
                                value={data.case_id}
                                onChange={e => setData('case_id', e.target.value)}
                                placeholder="Auto-generate jika kosong"
                                style={inputCss}
                            />
                        </FormField>

                        <FormField label="Status" error={errors.state}>
                            <select
                                value={data.state}
                                onChange={e => setData('state', e.target.value)}
                                style={inputCss}
                            >
                                <option value="open">Terbuka</option>
                                <option value="investigating">Investigasi</option>
                                <option value="escalated">Eskalasi</option>
                                <option value="closed">Selesai</option>
                            </select>
                        </FormField>

                        <FormField label="SLA Due" error={errors.sla_due_at}>
                            <input
                                type="datetime-local"
                                value={data.sla_due_at}
                                onChange={e => setData('sla_due_at', e.target.value)}
                                style={inputCss}
                            />
                        </FormField>
                    </div>
                </div>

                {/* Keterkaitan */}
                <div className="card">
                    <div className="card-head">
                        <h3>Keterkaitan</h3>
                    </div>
                    <div className="card-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
                        <FormField label="Nasabah" error={errors.customer_id} required>
                            <select
                                value={data.customer_id}
                                onChange={e => setData('customer_id', e.target.value)}
                                style={inputCss}
                            >
                                <option value="">— Pilih Nasabah —</option>
                                {customers.map(c => (
                                    <option key={c.id} value={c.id}>
                                        {c.cif} — {c.name}
                                    </option>
                                ))}
                            </select>
                        </FormField>

                        <FormField label="Alert Terkait" error={errors.alert_id}>
                            <select
                                value={data.alert_id}
                                onChange={e => setData('alert_id', e.target.value)}
                                style={inputCss}
                            >
                                <option value="">— Opsional —</option>
                                {alerts.map(a => (
                                    <option key={a.id} value={a.alert_id ?? a.id}>
                                        {a.alert_id ?? `#${a.id}`}{a.type ? ` — ${a.type}` : ''}
                                    </option>
                                ))}
                            </select>
                        </FormField>

                        <FormField label="Decision" error={errors.decision}>
                            <input
                                type="text"
                                value={data.decision}
                                onChange={e => setData('decision', e.target.value)}
                                placeholder="mis. true_positive / false_positive"
                                style={inputCss}
                            />
                        </FormField>
                    </div>
                </div>

                {/* Narasi */}
                <div className="card">
                    <div className="card-head">
                        <h3>Narasi / Deskripsi</h3>
                    </div>
                    <div className="card-body">
                        <FormField label="Narrative" error={errors.narrative} required>
                            <textarea
                                value={data.narrative}
                                onChange={e => setData('narrative', e.target.value)}
                                placeholder="Uraikan kronologi dan latar belakang kasus…"
                                rows={6}
                                style={{ ...inputCss, resize: 'vertical', lineHeight: 1.55 }}
                            />
                        </FormField>
                    </div>
                </div>

                {/* Footer */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                    <Link href={route('cases.index')} className="btn">
                        Batal
                    </Link>
                    <button
                        type="submit"
                        className="btn primary"
                        disabled={processing}
                        style={{ opacity: processing ? 0.65 : 1 }}
                    >
                        <Save size={14} /> {processing ? 'Menyimpan…' : 'Buat Kasus'}
                    </button>
                </div>
            </form>
        </AppLayout>
    );
}
