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
 *   cases?:     Array<{ id: number, case_id?: string }>,
 * }} props
 */
export default function EddCreate({ customers = [], cases = [] }) {
    const { data, setData, post, processing, errors } = useForm({
        edd_id:         '',
        customer_id:    '',
        case_id:        '',
        trigger_reason: '',
        risk_score:     50,
        stage:          'trigger',
        status:         'pending',
        sla_due_at:     '',
    });

    function submit(e) {
        e.preventDefault();
        post(route('edd.store'));
    }

    return (
        <AppLayout title="Buat EDD Baru">
            <PageHeader
                title="Buat Enhanced Due Diligence"
                subtitle="Inisiasi proses EDD untuk nasabah berisiko tinggi"
                actions={
                    <Link href={route('edd.index')} className="btn">
                        <ChevronLeft size={14} /> Kembali
                    </Link>
                }
            />

            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="card">
                    <div className="card-head">
                        <h3>Identitas EDD</h3>
                    </div>
                    <div
                        className="card-body"
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                            gap: 14,
                        }}
                    >
                        <FormField label="EDD ID" error={errors.edd_id}>
                            <input
                                type="text"
                                value={data.edd_id}
                                onChange={e => setData('edd_id', e.target.value)}
                                placeholder="Auto-generate jika kosong"
                                style={inputCss}
                            />
                        </FormField>

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

                        <FormField label="Kasus Terkait" error={errors.case_id}>
                            <select
                                value={data.case_id}
                                onChange={e => setData('case_id', e.target.value)}
                                style={inputCss}
                            >
                                <option value="">— Opsional —</option>
                                {cases.map(c => (
                                    <option key={c.id} value={c.id}>
                                        {c.case_id ?? `#${c.id}`}
                                    </option>
                                ))}
                            </select>
                        </FormField>
                    </div>
                </div>

                <div className="card">
                    <div className="card-head">
                        <h3>Trigger & Risk</h3>
                    </div>
                    <div
                        className="card-body"
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                            gap: 14,
                        }}
                    >
                        <FormField label="Risk Score (0–100)" error={errors.risk_score} required>
                            <input
                                type="number"
                                min={0}
                                max={100}
                                value={data.risk_score}
                                onChange={e => setData('risk_score', Number(e.target.value))}
                                style={inputCss}
                            />
                        </FormField>

                        <FormField label="Stage Awal" error={errors.stage}>
                            <select
                                value={data.stage}
                                onChange={e => setData('stage', e.target.value)}
                                style={inputCss}
                            >
                                <option value="trigger">Trigger</option>
                                <option value="profile">Profil</option>
                                <option value="source_of_funds">Sumber Dana</option>
                                <option value="beneficial_owner">Beneficial Owner</option>
                                <option value="approval">Approval</option>
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

                        <div style={{ gridColumn: '1 / -1' }}>
                            <FormField label="Alasan EDD / Trigger Reason" error={errors.trigger_reason} required>
                                <textarea
                                    value={data.trigger_reason}
                                    onChange={e => setData('trigger_reason', e.target.value)}
                                    placeholder="Jelaskan alasan EDD dilakukan untuk nasabah ini…"
                                    rows={4}
                                    style={{ ...inputCss, resize: 'vertical', lineHeight: 1.55 }}
                                />
                            </FormField>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                    <Link href={route('edd.index')} className="btn">
                        Batal
                    </Link>
                    <button
                        type="submit"
                        className="btn primary"
                        disabled={processing}
                        style={{ opacity: processing ? 0.65 : 1 }}
                    >
                        <Save size={14} /> {processing ? 'Menyimpan…' : 'Buat EDD'}
                    </button>
                </div>
            </form>
        </AppLayout>
    );
}
