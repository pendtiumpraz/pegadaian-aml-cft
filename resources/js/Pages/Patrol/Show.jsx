import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/PageHeader';
import RightRail from '@/Components/RightRail';
import DataTable from '@/Components/DataTable';
import Tag from '@/Components/Tag';
import Badge from '@/Components/Badge';
import {
    Sparkles, Bolt, ChevronLeft, ChevronDown, ChevronUp,
    Database, Clock, Calendar, User, DollarSign, Eye, Flag,
} from 'lucide-react';

function fmtDateTime(d) {
    if (!d) return '—';
    try {
        const dt = new Date(d);
        return dt.toLocaleString('id-ID', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    } catch {
        return String(d);
    }
}

function fmtCompactIdr(n) {
    const v = Number(n) || 0;
    if (v >= 1e9) return `Rp ${(v / 1e9).toFixed(1)} M`;
    if (v >= 1e6) return `Rp ${(v / 1e6).toFixed(0)} jt`;
    if (v >= 1e3) return `Rp ${(v / 1e3).toFixed(0)} rb`;
    return `Rp ${v.toLocaleString('id-ID')}`;
}

const STATUS_TONE = {
    draft:     'default',
    generated: 'blue',
    executed:  'green',
    failed:    'red',
};

const STATUS_LABEL = {
    draft:     'Draft',
    generated: 'Generated',
    executed:  'Executed',
    failed:    'Failed',
};

function SqlBlock({ text }) {
    const KW = /\b(SELECT|FROM|WHERE|JOIN|LEFT|RIGHT|INNER|OUTER|GROUP BY|ORDER BY|WITH|AS|AND|OR|SUM|COUNT|CASE|WHEN|THEN|ELSE|END|EXISTS|IN|BETWEEN|USING|INTERVAL|NOW|DATE|CURDATE|TRUE|FALSE|NULL|DISTINCT|HAVING|LIMIT|ON)\b/g;
    const lines = (text ?? '').split('\n');
    return (
        <pre className="mono" style={{
            margin: 0,
            padding: 14,
            fontSize: 11.5,
            lineHeight: 1.6,
            background: 'var(--surface-2)',
            color: 'var(--fg)',
            borderRadius: 'var(--radius)',
            overflow: 'auto',
            maxHeight: 360,
            border: '1px solid var(--border)',
        }}>
            {lines.map((ln, i) => {
                if (ln.trim().startsWith('--')) {
                    return <div key={i} style={{ color: 'var(--fg-3)', fontStyle: 'italic' }}>{ln || ' '}</div>;
                }
                const parts = [];
                let last = 0;
                let mm;
                const re = new RegExp(KW.source, 'g');
                while ((mm = re.exec(ln))) {
                    if (mm.index > last) parts.push(ln.slice(last, mm.index));
                    parts.push(
                        <span key={`${i}-${mm.index}`} style={{ color: 'var(--primary)', fontWeight: 600 }}>
                            {mm[0]}
                        </span>
                    );
                    last = mm.index + mm[0].length;
                }
                if (last < ln.length) parts.push(ln.slice(last));
                return <div key={i}>{parts.length ? parts : (ln || ' ')}</div>;
            })}
        </pre>
    );
}

function DetailRow({ icon: Icon, label, value, mono = false }) {
    return (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
            <Icon size={14} strokeWidth={1.75} style={{ color: 'var(--fg-3)', marginTop: 2, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
                <div className="muted" style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 0.05, fontWeight: 600 }}>
                    {label}
                </div>
                <div className={mono ? 'mono' : ''} style={{ fontSize: 12.5, marginTop: 2, wordBreak: 'break-word' }}>
                    {value ?? <span className="muted">—</span>}
                </div>
            </div>
        </div>
    );
}

/**
 * @param {{ query: object }} props
 */
export default function PatrolShow({ query }) {
    const [showSql, setShowSql] = useState(true);

    const status = query.status;
    const results = query.result_json ?? [];

    function reExecute() {
        if (!confirm('Eksekusi ulang query ini?')) return;
        router.post(route('patrol.execute', query.id), {}, { preserveScroll: true });
    }

    const resultColumns = [
        {
            key: 'cif',
            label: 'CIF',
            render: (val) => <span className="mono" style={{ fontSize: 11.5 }}>{val ?? '—'}</span>,
        },
        {
            key: 'nasabah',
            label: 'Nasabah',
            render: (val) => <span style={{ fontWeight: 500, fontSize: 12.5 }}>{val ?? '—'}</span>,
        },
        {
            key: 'tanggal',
            label: 'Tanggal',
            render: (val) => <span className="mono" style={{ fontSize: 11 }}>{val ?? '—'}</span>,
        },
        {
            key: 'jumlah',
            label: 'Jumlah',
            align: 'right',
            render: (val) => <span className="num">{fmtCompactIdr(val)}</span>,
        },
        {
            key: 'channel',
            label: 'Channel',
            render: (val) => val ? <Tag>{val}</Tag> : <span className="muted">—</span>,
        },
        {
            key: 'risk',
            label: 'Risk',
            render: (val) => val ? <Badge status={val} /> : <span className="muted">—</span>,
        },
        {
            key: '_actions',
            label: '',
            render: (_v, _row) => (
                <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                    <button type="button" className="btn ghost" style={{ padding: '3px 6px' }} title="Lihat">
                        <Eye size={13} />
                    </button>
                    <button type="button" className="btn ghost" style={{ padding: '3px 6px', color: 'var(--red)' }} title="Promote ke alert">
                        <Flag size={13} />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <AppLayout title="Detail Query AI Patrol">
            <PageHeader
                title={query.prompt.length > 80 ? query.prompt.slice(0, 80) + '…' : query.prompt}
                subtitle={`Query AI Patrol #${query.id} · Dibuat ${fmtDateTime(query.created_at)}`}
                meta={
                    <>
                        <Badge tone={STATUS_TONE[status] ?? 'default'} label={STATUS_LABEL[status] ?? status} />
                        <Tag tone="soft">
                            <Sparkles size={11} style={{ marginRight: 4 }} /> AI
                        </Tag>
                    </>
                }
                actions={
                    <>
                        <Link href={route('patrol.index')} className="btn">
                            <ChevronLeft size={14} /> Daftar
                        </Link>
                        <button type="button" className="btn primary" onClick={reExecute}>
                            <Bolt size={14} /> {status === 'executed' ? 'Re-execute' : 'Eksekusi'}
                        </button>
                    </>
                }
            />

            <RightRail
                main={
                    <>
                        {/* Prompt card */}
                        <div className="card" style={{ marginBottom: 16 }}>
                            <div className="card-head">
                                <h3>Prompt</h3>
                                <Tag>{query.prompt.length} karakter</Tag>
                            </div>
                            <div className="card-body">
                                <p style={{ fontSize: 13, lineHeight: 1.6, margin: 0, color: 'var(--fg)' }}>
                                    {query.prompt}
                                </p>
                            </div>
                        </div>

                        {/* Formula card */}
                        {query.formula && (
                            <div className="card" style={{ marginBottom: 16 }}>
                                <div className="card-head">
                                    <h3>Formula AI</h3>
                                    <Tag tone="soft">Tervalidasi</Tag>
                                </div>
                                <div className="card-body">
                                    <pre className="mono" style={{
                                        margin: 0,
                                        padding: 14,
                                        fontSize: 12,
                                        lineHeight: 1.6,
                                        background: 'var(--surface-2)',
                                        color: 'var(--fg)',
                                        borderRadius: 'var(--radius)',
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-word',
                                        border: '1px solid var(--border)',
                                    }}>
                                        {query.formula}
                                    </pre>
                                </div>
                            </div>
                        )}

                        {/* SQL preview — collapsible */}
                        {query.generated_sql && (
                            <div className="card" style={{ marginBottom: 16 }}>
                                <div className="card-head" style={{ cursor: 'pointer' }} onClick={() => setShowSql(s => !s)}>
                                    <h3>SQL Generated</h3>
                                    <button type="button" className="btn ghost" style={{ padding: '3px 8px' }}>
                                        {showSql ? <><ChevronUp size={13} /> Sembunyikan</> : <><ChevronDown size={13} /> Lihat</>}
                                    </button>
                                </div>
                                {showSql && (
                                    <div className="card-body">
                                        <SqlBlock text={query.generated_sql} />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Results table */}
                        <div className="card">
                            <div className="card-head">
                                <h3>Hasil Eksekusi</h3>
                                {status === 'executed' ? (
                                    <Tag tone="soft">
                                        {(query.result_count ?? results.length).toLocaleString('id-ID')} kandidat
                                    </Tag>
                                ) : (
                                    <Tag>Belum dieksekusi</Tag>
                                )}
                            </div>
                            <div className="card-body tight">
                                {status === 'executed' && results.length > 0 ? (
                                    <DataTable
                                        columns={resultColumns}
                                        data={results}
                                        wrapInCard={false}
                                    />
                                ) : (
                                    <div style={{
                                        padding: '40px 16px',
                                        textAlign: 'center',
                                        color: 'var(--fg-3)',
                                        fontSize: 12.5,
                                    }}>
                                        {status === 'executed'
                                            ? 'Tidak ada hasil yang cocok dengan query.'
                                            : 'Klik "Eksekusi" untuk menjalankan query dan melihat hasil.'}
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                }
                rail={
                    <>
                        <div className="card" style={{ marginBottom: 12 }}>
                            <div className="card-head">
                                <h3>Detail Query</h3>
                            </div>
                            <div className="card-body">
                                <DetailRow icon={Calendar} label="Dibuat" value={fmtDateTime(query.created_at)} mono />
                                <DetailRow icon={Bolt} label="Dieksekusi" value={fmtDateTime(query.executed_at)} mono />
                                <DetailRow
                                    icon={Clock}
                                    label="Waktu Eksekusi"
                                    value={query.execution_time_ms != null
                                        ? `${query.execution_time_ms.toLocaleString('id-ID')} ms`
                                        : null}
                                    mono
                                />
                                <DetailRow
                                    icon={Database}
                                    label="Estimasi Biaya"
                                    value={query.cost_estimate != null
                                        ? `${Number(query.cost_estimate).toFixed(2)} GB`
                                        : null}
                                    mono
                                />
                                <DetailRow
                                    icon={User}
                                    label="Eksekutor"
                                    value={query.user?.name ?? 'System'}
                                />
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={reExecute}
                            className="btn primary"
                            style={{ width: '100%', justifyContent: 'center', padding: '10px 14px' }}
                        >
                            <Bolt size={14} />
                            {status === 'executed' ? 'Re-execute Query' : 'Eksekusi Query'}
                        </button>

                        <div className="muted" style={{ fontSize: 11, marginTop: 12, textAlign: 'center' }}>
                            Sandbox · read-only · audit-logged
                        </div>
                    </>
                }
            />
        </AppLayout>
    );
}
