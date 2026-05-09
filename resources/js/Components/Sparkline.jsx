/**
 * Sparkline — compact inline SVG line chart.
 *
 * Renders a tiny line trend (with optional area fill) suitable for KPI
 * footers, table cells, or dashboard headers.
 *
 * @param {{
 *   data?: number[],
 *   width?: number,
 *   height?: number,
 *   color?: string,
 *   fill?: boolean,
 *   strokeWidth?: number,
 *   className?: string,
 *   style?: React.CSSProperties,
 *   ariaLabel?: string,
 * }} props
 */
export default function Sparkline({
    data = [],
    width = 60,
    height = 16,
    color = 'var(--primary)',
    fill = true,
    strokeWidth = 1.25,
    className,
    style,
    ariaLabel,
}) {
    if (!Array.isArray(data) || data.length < 2) {
        return (
            <svg
                width={width}
                height={height}
                viewBox={`0 0 ${width} ${height}`}
                className={className}
                style={style}
                aria-hidden="true"
            />
        );
    }

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const stepX = data.length > 1 ? width / (data.length - 1) : width;
    const pad = strokeWidth;
    const innerH = height - pad * 2;

    const points = data.map((v, i) => {
        const x = i * stepX;
        const y = pad + innerH - ((v - min) / range) * innerH;
        return [x, y];
    });

    const linePath = points
        .map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`)
        .join(' ');

    const areaPath =
        `${linePath} L${(width).toFixed(2)},${height} L0,${height} Z`;

    return (
        <svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            className={className}
            style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}
            role={ariaLabel ? 'img' : undefined}
            aria-label={ariaLabel}
            aria-hidden={ariaLabel ? undefined : 'true'}
            preserveAspectRatio="none"
        >
            {fill && (
                <path
                    d={areaPath}
                    fill={color}
                    fillOpacity="0.14"
                />
            )}
            <path
                d={linePath}
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
