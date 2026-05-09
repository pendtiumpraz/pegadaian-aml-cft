/**
 * Timeline — vertical event timeline with coloured dots.
 *
 * Renders a list of events as `<li>` items with a coloured dot on the
 * left and a vertical connector line. Mirrors the reference
 * `CaseDetail` linimasa pattern.
 *
 * Item shape:
 *  - `time` (string)        — small caption.
 *  - `title` (ReactNode)    — bold one-liner.
 *  - `body` (ReactNode)     — secondary description (optional).
 *  - `actor` (ReactNode)    — who performed the action (optional).
 *  - `type` ('info'|'warn'|'danger'|'success') — drives dot colour.
 *
 * @param {{
 *   items: Array<{
 *     time?: React.ReactNode,
 *     title: React.ReactNode,
 *     body?: React.ReactNode,
 *     actor?: React.ReactNode,
 *     type?: 'info' | 'warn' | 'danger' | 'success',
 *   }>,
 *   className?: string,
 *   style?: React.CSSProperties,
 * }} props
 */
const TYPE_COLOR = {
    info:    'var(--fg-3)',
    warn:    'var(--amber)',
    danger:  'var(--red)',
    success: 'var(--primary)',
};

export default function Timeline({ items = [], className, style }) {
    return (
        <ol
            className={`timeline ${className || ''}`.trim()}
            style={style}
        >
            <span className="timeline-line" aria-hidden="true" />
            {items.map((it, i) => {
                const dotColor = TYPE_COLOR[it.type] ?? 'var(--surface-3)';
                return (
                    <li key={i} className="timeline-item">
                        <span
                            className="timeline-dot"
                            style={{ background: dotColor }}
                            aria-hidden="true"
                        />
                        <div className="timeline-content">
                            <div className="timeline-title">{it.title}</div>
                            {(it.time != null || it.body != null) && (
                                <div className="timeline-meta">
                                    {it.time != null && <span>{it.time}</span>}
                                    {it.time != null && it.body != null && <span> · </span>}
                                    {it.body != null && <span>{it.body}</span>}
                                </div>
                            )}
                            {it.actor != null && (
                                <div className="timeline-actor">{it.actor}</div>
                            )}
                        </div>
                    </li>
                );
            })}
        </ol>
    );
}
