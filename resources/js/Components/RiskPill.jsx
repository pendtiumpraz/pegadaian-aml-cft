/**
 * RiskPill — high/medium/low risk pill with score readout.
 *
 * Reuses the existing `.rpill` class from app.css and adds a tabular
 * mono score on the right edge.
 *
 * Levels:
 *  - `low` / `rendah`        → green
 *  - `medium`/`med`/`menengah` → amber
 *  - `high` / `tinggi`       → red
 *  - `critical` / `kritis`   → red (treated like high but bolder label)
 *
 * @param {{
 *   level: 'low' | 'medium' | 'med' | 'high' | 'critical' | string,
 *   score?: number | string,
 *   label?: React.ReactNode,
 *   showLabel?: boolean,
 *   className?: string,
 *   style?: React.CSSProperties,
 * }} props
 */
const LEVEL_CLASS = {
    low:      'low',
    rendah:   'low',
    med:      'med',
    medium:   'med',
    sedang:   'med',
    menengah: 'med',
    high:     'high',
    tinggi:   'high',
    critical: 'high',
    kritis:   'high',
};

const LEVEL_LABEL = {
    low:      'Rendah',
    rendah:   'Rendah',
    med:      'Menengah',
    medium:   'Menengah',
    sedang:   'Menengah',
    menengah: 'Menengah',
    high:     'Tinggi',
    tinggi:   'Tinggi',
    critical: 'Kritis',
    kritis:   'Kritis',
};

export default function RiskPill({
    level,
    score,
    label,
    showLabel = true,
    className,
    style,
}) {
    const key = String(level || '').toLowerCase();
    const cls = LEVEL_CLASS[key] || 'low';
    const fallbackLabel = LEVEL_LABEL[key] || level || '';

    return (
        <span
            className={`rpill ${cls} ${className || ''}`.trim()}
            style={style}
        >
            {showLabel && (
                <span className="rpill-label">
                    {label ?? fallbackLabel}
                </span>
            )}
            {score != null && score !== '' && (
                <span className="rpill-score mono">{score}</span>
            )}
        </span>
    );
}
