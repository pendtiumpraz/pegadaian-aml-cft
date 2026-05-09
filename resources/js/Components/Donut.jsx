/**
 * Donut — SVG donut/progress chart.
 *
 * Two modes:
 *  - Single-segment progress: pass `value` as a number (0–100). The track
 *    is rendered in `--surface-3`; the filled arc uses `color`.
 *  - Composition: pass `value` as an array of segments
 *    `[{ value, color, label }]`. Segments are drawn clockwise starting
 *    at 12 o'clock.
 *
 * Center text:
 *  - `centerValue` (large) and `centerLabel` (small caption underneath).
 *  - When omitted in single-segment mode, the percentage is shown.
 *
 * @param {{
 *   value: number | Array<{ value: number, color?: string, label?: string }>,
 *   size?: number,
 *   thickness?: number,
 *   color?: string,
 *   trackColor?: string,
 *   centerLabel?: React.ReactNode,
 *   centerValue?: React.ReactNode,
 *   showCenter?: boolean,
 *   className?: string,
 *   style?: React.CSSProperties,
 *   ariaLabel?: string,
 * }} props
 */
export default function Donut({
    value,
    size = 120,
    thickness = 12,
    color = 'var(--primary)',
    trackColor = 'var(--surface-3)',
    centerLabel,
    centerValue,
    showCenter = true,
    className,
    style,
    ariaLabel,
}) {
    const r = (size - thickness) / 2;
    const cx = size / 2;
    const cy = size / 2;
    const c = 2 * Math.PI * r;

    const isArray = Array.isArray(value);

    // Single-segment progress mode
    if (!isArray) {
        const pct = Math.max(0, Math.min(100, Number(value) || 0));
        const dash = (pct / 100) * c;
        const display =
            centerValue != null
                ? centerValue
                : `${Math.round(pct)}%`;

        return (
            <div
                className={`donut-svg ${className || ''}`}
                style={{
                    width: size,
                    height: size,
                    position: 'relative',
                    flexShrink: 0,
                    ...style,
                }}
                role={ariaLabel ? 'img' : undefined}
                aria-label={ariaLabel}
            >
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                    <circle
                        cx={cx}
                        cy={cy}
                        r={r}
                        fill="none"
                        stroke={trackColor}
                        strokeWidth={thickness}
                    />
                    <circle
                        cx={cx}
                        cy={cy}
                        r={r}
                        fill="none"
                        stroke={color}
                        strokeWidth={thickness}
                        strokeDasharray={`${dash} ${c}`}
                        strokeDashoffset={c / 4}
                        strokeLinecap="round"
                        transform={`rotate(-90 ${cx} ${cy})`}
                    />
                </svg>
                {showCenter && (display != null || centerLabel != null) && (
                    <div className="donut-center">
                        {display != null && (
                            <div className="donut-center-value">{display}</div>
                        )}
                        {centerLabel != null && (
                            <div className="donut-center-label">{centerLabel}</div>
                        )}
                    </div>
                )}
            </div>
        );
    }

    // Composition mode — segmented donut
    const segments = value.filter(Boolean);
    const total = segments.reduce((sum, s) => sum + (Number(s.value) || 0), 0) || 1;

    let offset = 0;

    return (
        <div
            className={`donut-svg ${className || ''}`}
            style={{
                width: size,
                height: size,
                position: 'relative',
                flexShrink: 0,
                ...style,
            }}
            role={ariaLabel ? 'img' : undefined}
            aria-label={ariaLabel}
        >
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <circle
                    cx={cx}
                    cy={cy}
                    r={r}
                    fill="none"
                    stroke={trackColor}
                    strokeWidth={thickness}
                />
                {segments.map((s, i) => {
                    const v = Number(s.value) || 0;
                    const dash = (v / total) * c;
                    const dashArray = `${dash} ${c}`;
                    const dashOffset = c / 4 - offset;
                    offset += dash;
                    return (
                        <circle
                            key={i}
                            cx={cx}
                            cy={cy}
                            r={r}
                            fill="none"
                            stroke={s.color || color}
                            strokeWidth={thickness}
                            strokeDasharray={dashArray}
                            strokeDashoffset={dashOffset}
                            transform={`rotate(-90 ${cx} ${cy})`}
                        >
                            {s.label && <title>{s.label}</title>}
                        </circle>
                    );
                })}
            </svg>
            {showCenter && (centerValue != null || centerLabel != null) && (
                <div className="donut-center">
                    {centerValue != null && (
                        <div className="donut-center-value">{centerValue}</div>
                    )}
                    {centerLabel != null && (
                        <div className="donut-center-label">{centerLabel}</div>
                    )}
                </div>
            )}
        </div>
    );
}
