/**
 * FactorRow — weighted factor display row.
 *
 * Mirrors the reference CaseDetail / Customer IRA breakdown layout:
 *   `[ 1fr label ][ auto value ][ 60px bar ]`
 *
 * Useful for risk factor breakdowns, scorecards, contributing reasons.
 *
 * Color rules:
 *  - `color` overrides the bar fill.
 *  - Otherwise: red ≥70, amber ≥50, primary <50 (matches reference).
 *  - `muted` renders the row in fg-3 / surface-3 (e.g. for "no match").
 *
 * @param {{
 *   label: React.ReactNode,
 *   value?: React.ReactNode,
 *   weight: number,
 *   max?: number,
 *   color?: string,
 *   muted?: boolean,
 *   className?: string,
 *   style?: React.CSSProperties,
 * }} props
 */
function defaultColor(weight) {
    if (weight >= 70) return 'var(--red)';
    if (weight >= 50) return 'var(--amber)';
    return 'var(--primary)';
}

export default function FactorRow({
    label,
    value,
    weight,
    max = 100,
    color,
    muted = false,
    className,
    style,
}) {
    const w = Math.max(0, Math.min(100, ((Number(weight) || 0) / (max || 100)) * 100));
    const fill = muted ? 'var(--fg-3)' : (color || defaultColor(Number(weight) || 0));

    return (
        <div className={`factor-row ${className || ''}`.trim()} style={style}>
            <span
                className="factor-row-label"
                style={{ color: muted ? 'var(--fg-3)' : 'var(--fg)' }}
            >
                {label}
            </span>
            {value != null && (
                <span className="factor-row-value mono">{value}</span>
            )}
            <span className="factor-row-bar">
                <span className="bar" style={{ flex: 1 }}>
                    <i style={{ width: `${w}%`, background: fill }} />
                </span>
            </span>
        </div>
    );
}
