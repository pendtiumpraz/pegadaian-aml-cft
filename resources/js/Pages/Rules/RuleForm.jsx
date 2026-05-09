import { Link } from '@inertiajs/react';
import { Save } from 'lucide-react';

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
 * Shared rule form used by Create + Edit pages.
 *
 * @param {{
 *   data: object,
 *   setData: (key: string, value: any) => void,
 *   errors: object,
 *   processing: boolean,
 *   onSubmit: (e: React.FormEvent) => void,
 *   cancelHref: string,
 *   submitLabel: string,
 * }} props
 */
export default function RuleForm({
    data,
    setData,
    errors,
    processing,
    onSubmit,
    cancelHref,
    submitLabel,
}) {
    return (
        <form onSubmit={onSubmit}>
            {/* Identitas */}
            <div className="card" style={{ marginBottom: 16 }}>
                <div className="card-head">
                    <h3>Identitas Aturan</h3>
                </div>
                <div className="card-body">
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                            gap: 14,
                        }}
                    >
                        <FormField label="Nama Aturan" error={errors.nama_aturan} required>
                            <input
                                type="text"
                                className="input"
                                value={data.nama_aturan}
                                onChange={e => setData('nama_aturan', e.target.value)}
                                placeholder="Mis: Tunai Harian > Rp 500jt"
                            />
                        </FormField>

                        <FormField label="Kategori" error={errors.category} required>
                            <select
                                className="input"
                                value={data.category}
                                onChange={e => setData('category', e.target.value)}
                            >
                                <option value="transaction">Transaksi</option>
                                <option value="customer">Nasabah</option>
                                <option value="watchlist">Watchlist</option>
                                <option value="pattern">Pola</option>
                                <option value="ltkt">LTKT</option>
                                <option value="anomaly">Anomaly</option>
                                <option value="risk">Risk</option>
                                <option value="pep">PEP</option>
                                <option value="sanctions">Sanctions</option>
                            </select>
                        </FormField>

                        <FormField label="Aksi" error={errors.action} required>
                            <select
                                className="input"
                                value={data.action}
                                onChange={e => setData('action', e.target.value)}
                            >
                                <option value="alert">Alert</option>
                                <option value="block">Blokir</option>
                                <option value="flag">Flag</option>
                                <option value="review">Review</option>
                            </select>
                        </FormField>

                        <FormField label="Severity" error={errors.severity} required>
                            <select
                                className="input"
                                value={data.severity}
                                onChange={e => setData('severity', e.target.value)}
                            >
                                <option value="low">Rendah (Low)</option>
                                <option value="medium">Sedang (Medium)</option>
                                <option value="high">Tinggi (High)</option>
                                <option value="critical">Kritis (Critical)</option>
                            </select>
                        </FormField>

                        <FormField label="Threshold" error={errors.threshold} hint="Nilai numerik atau ekspresi pemicu (mis: 500000000)">
                            <input
                                type="number"
                                className="input mono"
                                value={data.threshold}
                                onChange={e => setData('threshold', e.target.value)}
                                placeholder="0"
                                style={{ fontFamily: 'var(--font-mono)' }}
                            />
                        </FormField>

                        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                            <ToggleSwitchField
                                label="Aturan Aktif"
                                on={data.is_active}
                                onChange={val => setData('is_active', val)}
                            />
                        </div>

                        <div style={{ gridColumn: '1 / -1' }}>
                            <FormField label="Deskripsi" error={errors.deskripsi}>
                                <textarea
                                    className="input"
                                    value={data.deskripsi}
                                    onChange={e => setData('deskripsi', e.target.value)}
                                    placeholder="Jelaskan tujuan dan cara kerja aturan ini…"
                                    rows={3}
                                    style={{ resize: 'vertical' }}
                                />
                            </FormField>
                        </div>
                    </div>
                </div>
            </div>

            {/* Kondisi */}
            <div className="card" style={{ marginBottom: 16 }}>
                <div className="card-head">
                    <h3>Kondisi (JSON)</h3>
                    <span className="sub">Diparse dan dievaluasi oleh anomaly engine</span>
                </div>
                <div className="card-body">
                    <FormField
                        error={errors.conditions_json}
                        hint='Mis: {"field":"jumlah","operator":"gt","value":100000000}'
                    >
                        <textarea
                            className="input mono"
                            value={data.conditions_json}
                            onChange={e => setData('conditions_json', e.target.value)}
                            rows={8}
                            spellCheck={false}
                            style={{
                                resize: 'vertical',
                                fontFamily: 'var(--font-mono)',
                                fontSize: 12,
                                lineHeight: 1.5,
                            }}
                        />
                    </FormField>
                </div>
            </div>

            {/* Submit */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <Link href={cancelHref} className="btn">Batal</Link>
                <button
                    type="submit"
                    disabled={processing}
                    className="btn primary"
                    style={{ opacity: processing ? 0.65 : 1 }}
                >
                    <Save size={14} />
                    {processing ? 'Menyimpan…' : submitLabel}
                </button>
            </div>
        </form>
    );
}

/* ---------- Toggle switch with label ---------- */
function ToggleSwitchField({ label, on, onChange }) {
    return (
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <span
                onClick={() => onChange(!on)}
                style={{
                    width: 28,
                    height: 16,
                    borderRadius: 8,
                    background: on ? 'var(--primary)' : 'var(--surface-3)',
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
                        left: on ? 14 : 2,
                        transition: 'left 0.15s',
                    }}
                />
            </span>
            <input
                type="checkbox"
                checked={on}
                onChange={e => onChange(e.target.checked)}
                style={{ display: 'none' }}
            />
            <span style={{ fontSize: 12.5, color: 'var(--fg)', fontWeight: 500 }}>{label}</span>
        </label>
    );
}
