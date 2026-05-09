/**
 * HBar — horizontal mini bar with optional label and trailing value.
 *
 * Reuses the existing `.bar` class from app.css. The bar fill defaults to
 * `var(--primary)`; pass `color` to override (e.g. amber/red for risk).
 *
 * Layouts:
 *  - With `label` + `valueLabel`: stacks the bar under a label/value row.
 *  - With only `valueLabel`: shows label inline to the right.
 *  - Bare: only renders the bar.
 *
 * @param {{
 *   value: number,
 *   max?: number,
 *   color?: string,
 *   height?: number,
 *   label?: React.ReactNode,
 *   valueLabel?: React.ReactNode,
 *   tone?: 'amber' | 'red',
 *   className?: string,
 *   style?: React.CSSProperties,
 *   barStyle?: React.CSSProperties,
 * }} props
 */
export default function HBar({
    value,
    max = 100,
    color,
    height = 6,
    label,
    valueLabel,
    tone,
    className,
    style,
    barStyle,
}) {
    const pct = Math.max(0, Math.min(100, ((Number(value) || 0) / (max || 100)) * 100));

    const fillStyle = {
        width: `${pct}%`,
        ...(color ? { background: color } : null),
    };

    const barClass = `bar${tone ? ` ${tone}` : ''}`;

    const bar = (
        <div
            className={barClass}
            style={{ height, ...barStyle }}
            role="progressbar"
            aria-valuenow={Math.round(pct)}
            aria-valuemin={0}
            aria-valuemax={100}
        >
            <i style={fillStyle} />
        </div>
    );

    if (label == null && valueLabel == null) {
        return <div className={className} style={style}>{bar}</div>;
    }

    return (
        <div className={className} style={style}>
            {(label != null || valueLabel != null) && (
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'baseline',
                        gap: 8,
                        fontSize: 12,
                        marginBottom: 6,
                    }}
                >
                    {label != null ? <span>{label}</span> : <span />}
                    {valueLabel != null && (
                        <span className="mono" style={{ fontWeight: 600 }}>
                            {valueLabel}
                        </span>
                    )}
                </div>
            )}
            {bar}
        </div>
    );
}
