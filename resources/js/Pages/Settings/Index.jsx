import { useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Save, Check, Settings as SettingsIcon } from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/PageHeader';

/* --------------------------------------------------------------------
   Helpers
   -------------------------------------------------------------------- */
function asBoolean(v) {
    return v === true || v === 'true' || v === 1 || v === '1';
}

function humanizeKey(key) {
    return String(key)
        .replace(/[._-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

function humanizeGroup(g) {
    return humanizeKey(g);
}

function inferType(setting) {
    if (setting.type) return String(setting.type).toLowerCase();
    const v = setting.value;
    if (typeof v === 'boolean') return 'boolean';
    if (typeof v === 'number') return 'integer';
    if (v && typeof v === 'object') return 'json';
    if (typeof v === 'string') {
        const t = v.trim();
        if (t === 'true' || t === 'false') return 'boolean';
        if (/^-?\d+$/.test(t)) return 'integer';
        if ((t.startsWith('{') && t.endsWith('}')) || (t.startsWith('[') && t.endsWith(']'))) return 'json';
    }
    return 'string';
}

function valueToString(v) {
    if (v == null) return '';
    if (typeof v === 'object') {
        try { return JSON.stringify(v, null, 2); } catch { return String(v); }
    }
    return String(v);
}

/* --------------------------------------------------------------------
   Toggle switch (matches reference settings tables)
   -------------------------------------------------------------------- */
function ToggleSwitch({ on, onChange, disabled }) {
    return (
        <span
            role="switch"
            aria-checked={on}
            tabIndex={disabled ? -1 : 0}
            onClick={() => !disabled && onChange(!on)}
            onKeyDown={(e) => {
                if (disabled) return;
                if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    onChange(!on);
                }
            }}
            style={{
                width: 36,
                height: 20,
                borderRadius: 10,
                background: on ? 'var(--primary)' : 'var(--surface-3, var(--border))',
                position: 'relative',
                display: 'inline-block',
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'background 160ms',
                opacity: disabled ? 0.55 : 1,
                outline: 'none',
                flexShrink: 0,
            }}
        >
            <span
                style={{
                    position: 'absolute',
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    background: '#fff',
                    top: 2,
                    left: on ? 18 : 2,
                    transition: 'left 160ms',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.18)',
                }}
            />
        </span>
    );
}

/* --------------------------------------------------------------------
   Single setting field row
   -------------------------------------------------------------------- */
function SettingField({ setting, value, onChange }) {
    const type = inferType(setting);
    const label = setting.label ?? humanizeKey(setting.key);
    const description = setting.description ?? null;

    let input;
    if (type === 'boolean') {
        const checked = asBoolean(value);
        input = (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                <ToggleSwitch on={checked} onChange={(next) => onChange(next)} />
                <span style={{ fontSize: 12, color: 'var(--fg-3)', fontWeight: 500 }}>
                    {checked ? 'Aktif' : 'Nonaktif'}
                </span>
            </div>
        );
    } else if (type === 'integer') {
        input = (
            <input
                type="number"
                className="input mono"
                value={value ?? ''}
                onChange={(e) => onChange(e.target.value)}
                style={{ fontFamily: 'var(--font-mono)' }}
            />
        );
    } else if (type === 'json') {
        input = (
            <textarea
                className="input mono"
                value={typeof value === 'string' ? value : valueToString(value)}
                onChange={(e) => onChange(e.target.value)}
                rows={6}
                spellCheck={false}
                style={{
                    resize: 'vertical',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 12,
                    lineHeight: 1.5,
                }}
            />
        );
    } else {
        input = (
            <input
                type="text"
                className="input"
                value={value ?? ''}
                onChange={(e) => onChange(e.target.value)}
            />
        );
    }

    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1.4fr',
                gap: 18,
                alignItems: 'start',
                padding: '14px 0',
                borderBottom: '1px solid var(--border)',
            }}
        >
            <div>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--fg)' }}>
                    {label}
                </div>
                {description && (
                    <div style={{ fontSize: 11.5, color: 'var(--fg-3)', marginTop: 4, lineHeight: 1.5 }}>
                        {description}
                    </div>
                )}
                <code
                    className="mono"
                    style={{
                        fontSize: 10.5,
                        color: 'var(--fg-3)',
                        marginTop: 6,
                        display: 'inline-block',
                        background: 'var(--surface-2, transparent)',
                    }}
                >
                    {setting.key}
                </code>
            </div>
            <div>{input}</div>
        </div>
    );
}

/* --------------------------------------------------------------------
   One section card with batch save-per-section
   -------------------------------------------------------------------- */
function SettingSection({ groupKey, items }) {
    const [values, setValues] = useState(() => {
        const init = {};
        items.forEach((s) => { init[s.key] = s.value; });
        return init;
    });
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [dirty, setDirty] = useState(false);

    function handleChange(key, val) {
        setValues((prev) => ({ ...prev, [key]: val }));
        setDirty(true);
        setSaved(false);
    }

    function handleSave() {
        setSaving(true);

        // Batch by chaining one PUT per key to settings.update.
        const keys = Object.keys(values);
        let chain = Promise.resolve();
        keys.forEach((key) => {
            chain = chain.then(
                () => new Promise((resolve) => {
                    router.put(
                        route('settings.update', key),
                        { value: values[key] },
                        {
                            preserveState: true,
                            preserveScroll: true,
                            onFinish: resolve,
                        },
                    );
                }),
            );
        });
        chain.then(() => {
            setSaving(false);
            setSaved(true);
            setDirty(false);
            setTimeout(() => setSaved(false), 3000);
        });
    }

    return (
        <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-head">
                <h3>{humanizeGroup(groupKey)}</h3>
                <span className="sub">{items.length} pengaturan</span>
                <div style={{ marginLeft: 'auto' }}>
                    <button
                        type="button"
                        className="btn primary"
                        onClick={handleSave}
                        disabled={saving || !dirty}
                        style={{ opacity: saving || !dirty ? 0.65 : 1 }}
                    >
                        {saved ? (
                            <>
                                <Check size={14} /> Tersimpan
                            </>
                        ) : saving ? (
                            <>Menyimpan…</>
                        ) : (
                            <>
                                <Save size={14} /> Simpan
                            </>
                        )}
                    </button>
                </div>
            </div>
            <div className="card-body">
                {items.map((s) => (
                    <SettingField
                        key={s.key}
                        setting={s}
                        value={values[s.key]}
                        onChange={(val) => handleChange(s.key, val)}
                    />
                ))}
            </div>
        </div>
    );
}

/* --------------------------------------------------------------------
   Page
   -------------------------------------------------------------------- */
/**
 * @param {{
 *   settings: Record<string, Array<{ key: string, value: any, group?: string, type?: string, label?: string, description?: string }>>
 * }} props
 *
 * Controller passes a Laravel collection grouped by `group`.
 * On the JS side that arrives as `{ groupKey: [setting, setting, …] }`.
 */
export default function SettingsIndex({ settings = {} }) {
    const groups = useMemo(() => {
        if (!settings) return [];
        // Settings come as an object keyed by group, each value is an array of rows.
        // Defensively handle the case where it's a flat array.
        if (Array.isArray(settings)) {
            const map = {};
            settings.forEach((s) => {
                const g = s.group ?? 'umum';
                if (!map[g]) map[g] = [];
                map[g].push(s);
            });
            return Object.entries(map);
        }
        return Object.entries(settings);
    }, [settings]);

    return (
        <AppLayout title="Pengaturan Sistem">
            <PageHeader
                title="Pengaturan Sistem"
                subtitle="Konfigurasi operasional aplikasi AML/CFT. Setiap section disimpan secara terpisah."
            />

            {groups.length === 0 ? (
                <div className="card">
                    <div
                        className="card-body"
                        style={{ textAlign: 'center', padding: 48 }}
                    >
                        <div
                            style={{
                                width: 56,
                                height: 56,
                                margin: '0 auto 14px',
                                borderRadius: 56,
                                background: 'var(--surface-2, var(--border))',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--fg-3)',
                            }}
                        >
                            <SettingsIcon size={24} strokeWidth={1.75} />
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--fg-3)' }}>
                            Belum ada pengaturan yang terdaftar.
                        </div>
                    </div>
                </div>
            ) : (
                groups.map(([groupKey, items]) => (
                    <SettingSection
                        key={groupKey}
                        groupKey={groupKey}
                        items={items}
                    />
                ))
            )}
        </AppLayout>
    );
}
