import { Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/PageHeader';
import DataTable from '@/Components/DataTable';
import StatCard from '@/Components/StatCard';
import Tag from '@/Components/Tag';
import Badge from '@/Components/Badge';
import {
    Plus, Eye, Trash2, Play,
    Sparkles, CheckCircle, Clock, Timer,
} from 'lucide-react';

function fmtDateTime(d) {
    if (!d) return '—';
    try {
        const dt = new Date(d);
        return dt.toLocaleString('id-ID', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    } catch {
        return String(d);
    }
}

function truncate(s, n = 60) {
    if (!s) return '—';
    return s.length > n ? s.slice(0, n) + '…' : s;
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

/**
 * @param {{
 *   queries: { data: object[], links?: object[], meta?: object },
 *   summary: { total: number, executed: number, pending: number, avg_time: number },
 * }} props
 */
export default function PatrolIndex({ queries, summary = {} }) {
    const rows = queries?.data ?? [];

    function handleDelete(id) {
        if (!confirm('Hapus query patrol ini? Tindakan ini akan memindahkan ke trash.')) return;
        // No destroy route in spec — fallback no-op for now.
        // Caller can implement if needed.
    }

    function handleExecute(id) {
        if (!confirm('Eksekusi query ini sekarang?')) return;
        router.post(route('patrol.execute', id), {}, { preserveScroll: true });
    }

    const columns = [
        {
            key: 'prompt',
            label: 'Prompt',
            render: (val, row) => (
                <div>
                    <div style={{ fontSize: 12.5, fontWeight: 500 }}>
                        {truncate(val, 60)}
                    </div>
                    {row.formula && (
                        <div className="muted" style={{ fontSize: 11, marginTop: 2, maxWidth: 480, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {truncate(row.formula, 80)}
                        </div>
                    )}
                </div>
            ),
        },
        {
            key: 'status',
            label: 'Status',
            render: (val) => (
                <Badge tone={STATUS_TONE[val] ?? 'default'} label={STATUS_LABEL[val] ?? val} />
            ),
        },
        {
            key: 'execution_time_ms',
            label: 'Waktu Eksekusi',
            align: 'right',
            render: (val) => val != null
                ? <span className="mono" style={{ fontSize: 11.5 }}>{val.toLocaleString('id-ID')} ms</span>
                : <span className="muted">—</span>,
        },
        {
            key: 'result_count',
            label: 'Hasil',
            align: 'right',
            render: (val) => val != null
                ? <span className="num">{Number(val).toLocaleString('id-ID')}</span>
                : <span className="muted">—</span>,
        },
        {
            key: 'created_at',
            label: 'Dibuat',
            render: (val) => (
                <span className="mono" style={{ fontSize: 11 }}>{fmtDateTime(val)}</span>
            ),
        },
        {
            key: 'id',
            label: 'Aksi',
            render: (_v, row) => (
                <div style={{ display: 'flex', gap: 4 }}>
                    <Link
                        href={route('patrol.show', row.id)}
                        className="btn ghost"
                        title="Lihat"
                        style={{ padding: '3px 6px' }}
                    >
                        <Eye size={13} />
                    </Link>
                    {row.status !== 'executed' && (
                        <button
                            type="button"
                            onClick={() => handleExecute(row.id)}
                            className="btn ghost"
                            title="Eksekusi"
                            style={{ padding: '3px 6px', color: 'var(--primary)' }}
                        >
                            <Play size={13} />
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => handleDelete(row.id)}
                        className="btn ghost"
                        title="Hapus"
                        style={{ padding: '3px 6px', color: 'var(--red)' }}
                    >
                        <Trash2 size={13} />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <AppLayout title="AI Patrol">
            <PageHeader
                title="AI Patrol"
                subtitle="Tulis pola dalam bahasa natural · AI hasilkan formula & SQL · Eksekusi dengan satu klik"
                meta={
                    <Tag tone="soft" style={{ background: 'oklch(0.92 0.06 85)', color: 'oklch(0.40 0.12 75)' }}>
                        <Sparkles size={11} style={{ marginRight: 4 }} /> NEW
                    </Tag>
                }
                actions={
                    <Link href={route('patrol.create')} className="btn primary">
                        <Plus size={14} /> Buat Query
                    </Link>
                }
            />

            <div className="grid grid-4" style={{ marginBottom: 16 }}>
                <StatCard
                    title="Queries Total"
                    value={(summary.total ?? 0).toLocaleString('id-ID')}
                    icon={Sparkles}
                    delta="Seluruh query AI yang pernah dibuat"
                    deltaTone="flat"
                />
                <StatCard
                    title="Executed"
                    value={(summary.executed ?? 0).toLocaleString('id-ID')}
                    icon={CheckCircle}
                    delta="Query telah dijalankan"
                    deltaTone="up"
                />
                <StatCard
                    title="Pending"
                    value={(summary.pending ?? 0).toLocaleString('id-ID')}
                    icon={Clock}
                    delta="Menunggu eksekusi"
                    deltaTone={summary.pending > 0 ? 'down' : 'flat'}
                />
                <StatCard
                    title="Avg Time"
                    value={(summary.avg_time ?? 0).toLocaleString('id-ID')}
                    unit="ms"
                    icon={Timer}
                    delta="Rata-rata durasi eksekusi"
                    deltaTone="flat"
                />
            </div>

            <div className="card">
                <div className="card-head">
                    <h3>Riwayat Query AI Patrol</h3>
                    <Tag>{rows.length} ditampilkan</Tag>
                </div>
                <div className="card-body tight">
                    <DataTable
                        columns={columns}
                        data={rows}
                        wrapInCard={false}
                        empty="Belum ada query AI Patrol. Klik 'Buat Query' untuk memulai."
                    />
                </div>
            </div>

            {queries?.links?.length > 3 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16, flexWrap: 'wrap' }}>
                    {queries.links.map((link, i) => (
                        <Link
                            key={i}
                            href={link.url ?? '#'}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                            className={`btn ${link.active ? 'primary' : ''}`}
                            style={{
                                padding: '4px 10px',
                                fontSize: 12,
                                pointerEvents: link.url ? 'auto' : 'none',
                                opacity: link.url ? 1 : 0.45,
                            }}
                        />
                    ))}
                </div>
            )}
        </AppLayout>
    );
}
