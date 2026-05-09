import { Loader2 } from 'lucide-react';

/**
 * DataTable matching the reference `.table` pattern (wrapped in a card).
 *
 * @param {{
 *   columns: Array<{ key: string, label: string, align?: 'left'|'right'|'center', className?: string, render?: (value: any, row: object) => React.ReactNode }>,
 *   data: object[],
 *   loading?: boolean,
 *   empty?: string,
 *   wrapInCard?: boolean,
 * }} props
 */
export default function DataTable({
    columns = [],
    data = [],
    loading = false,
    empty = 'Tidak ada data ditemukan.',
    wrapInCard = true,
}) {
    const inner = (
        <div style={{ overflowX: 'auto' }}>
            <table className="table">
                <thead>
                    <tr>
                        {columns.map(col => (
                            <th
                                key={col.key}
                                className={col.className}
                                style={{ textAlign: col.align ?? 'left' }}
                            >
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td
                                colSpan={columns.length}
                                style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--fg-3)' }}
                            >
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                                    <Loader2 size={14} className="animate-spin" />
                                    Memuat data…
                                </span>
                            </td>
                        </tr>
                    ) : data.length === 0 ? (
                        <tr>
                            <td
                                colSpan={columns.length}
                                style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--fg-3)' }}
                            >
                                {empty}
                            </td>
                        </tr>
                    ) : (
                        data.map((row, rowIdx) => (
                            <tr key={row.id ?? rowIdx}>
                                {columns.map(col => (
                                    <td
                                        key={col.key}
                                        className={col.className}
                                        style={{ textAlign: col.align ?? 'left' }}
                                    >
                                        {col.render
                                            ? col.render(row[col.key], row)
                                            : (row[col.key] ?? <span className="muted">—</span>)}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );

    if (!wrapInCard) return inner;

    return (
        <div className="card">
            <div className="card-body tight">
                {inner}
            </div>
        </div>
    );
}
