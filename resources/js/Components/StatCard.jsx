/**
 * KPI card matching the reference's `.kpi` pattern.
 *
 * @param {{
 *   title: string,
 *   value: string | number,
 *   unit?: string,
 *   icon?: React.ComponentType<{ size?: number, className?: string, strokeWidth?: number }>,
 *   color?: string,
 *   delta?: string,
 *   deltaTone?: 'up' | 'down' | 'flat',
 *   trend?: { value: number, label?: string },
 *   spark?: number[],
 *   sparkHi?: number,
 * }} props
 *
 * `color` is kept for backward-compat but is no longer used as an icon-circle
 * background; the reference KPI is text-only (no icon chip).
 */
export default function StatCard({
    title,
    value,
    unit,
    icon: Icon,
    color,
    delta,
    deltaTone,
    trend,
    spark,
    sparkHi,
}) {
    // Convert legacy `trend` prop to `delta`
    let computedDelta = delta;
    let computedTone = deltaTone;
    if (trend && computedDelta == null) {
        const positive = (trend.value ?? 0) >= 0;
        computedTone = positive ? 'up' : 'down';
        computedDelta = `${positive ? '+' : ''}${trend.value}%${trend.label ? ' ' + trend.label : ''}`;
    }

    const toneSymbol =
        computedTone === 'up'   ? '▲' :
        computedTone === 'down' ? '▼' :
        computedTone === 'flat' ? '■' : null;

    return (
        <div className="kpi">
            <div className="kpi-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {Icon && (
                    <Icon
                        size={12}
                        strokeWidth={1.75}
                        style={{ color: color ?? 'var(--fg-3)', flexShrink: 0 }}
                    />
                )}
                <span>{title}</span>
            </div>
            <div className="kpi-value">
                {value ?? '—'}
                {unit && <span className="unit">{unit}</span>}
            </div>
            {(computedDelta != null || spark) && (
                <div className="kpi-foot">
                    {computedDelta != null && (
                        <span className={`delta ${computedTone || 'flat'}`}>
                            {toneSymbol && <>{toneSymbol} </>}
                            {computedDelta}
                        </span>
                    )}
                    {spark && (
                        <span className="spark" style={{ flex: 1, marginLeft: 8 }} aria-hidden="true">
                            {spark.map((v, i) => (
                                <i
                                    key={i}
                                    style={{ height: `${Math.max(8, v)}%` }}
                                    className={sparkHi === i ? 'hi' : ''}
                                />
                            ))}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
