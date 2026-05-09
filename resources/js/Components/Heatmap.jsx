/**
 * Heatmap — 5x5 likelihood × impact risk grid.
 *
 * Used for risk assessment matrices (CRA, ERA). Cell colour is driven
 * by the score = likelihood × impact (1..25):
 *   1–8   → low (green)
 *   9–15  → medium (amber)
 *   16–25 → high (red)
 *
 * `cells` accepts either:
 *  - 5×5 array indexed `cells[likelihood-1][impact-1] = { count, score? }`
 *  - object keyed `"L,I"` where L and I are 1..5
 *
 * `current` highlights the current position (`{ l, i }`).
 *
 * Likelihood is plotted on the Y axis (1=bottom, 5=top), impact on X
 * (1=left, 5=right) — matching standard ISO 31000 conventions.
 *
 * @param {{
 *   cells?: Array<Array<{count?: number, score?: number}>> | Record<string, {count?: number, score?: number}>,
 *   current?: { l: number, i: number },
 *   xLabels?: string[],
 *   yLabels?: string[],
 *   xTitle?: string,
 *   yTitle?: string,
 *   cellSize?: number,
 *   onCellClick?: (l: number, i: number) => void,
 *   className?: string,
 *   style?: React.CSSProperties,
 * }} props
 */
const DEFAULT_X = ['1', '2', '3', '4', '5'];
const DEFAULT_Y = ['1', '2', '3', '4', '5'];

function colorFromScore(score) {
    if (score >= 16) return { fill: 'var(--red-soft)', border: 'var(--red)', fg: 'var(--red)' };
    if (score >= 9)  return { fill: 'var(--amber-soft)', border: 'var(--amber)', fg: 'oklch(0.45 0.12 75)' };
    return { fill: 'var(--primary-soft)', border: 'var(--primary-2)', fg: 'var(--primary-2)' };
}

function readCell(cells, l, i) {
    if (!cells) return {};
    if (Array.isArray(cells)) {
        const row = cells[l - 1];
        if (!Array.isArray(row)) return {};
        return row[i - 1] || {};
    }
    return cells[`${l},${i}`] || {};
}

export default function Heatmap({
    cells,
    current,
    xLabels = DEFAULT_X,
    yLabels = DEFAULT_Y,
    xTitle = 'Dampak',
    yTitle = 'Likelihood',
    cellSize = 48,
    onCellClick,
    className,
    style,
}) {
    // Render 5 rows top-down: l=5 first → l=1 last (so highest likelihood is up)
    const rows = [5, 4, 3, 2, 1];
    const cols = [1, 2, 3, 4, 5];

    return (
        <div className={`heatmap ${className || ''}`} style={style}>
            <div className="heatmap-grid">
                {/* Top-left empty cell */}
                <div className="heatmap-corner" />
                {/* X-axis labels (impact 1..5) */}
                {cols.map((i) => (
                    <div key={`xl-${i}`} className="heatmap-x-label">
                        {xLabels[i - 1]}
                    </div>
                ))}

                {rows.map((l) => (
                    <RowFragment
                        key={`row-${l}`}
                        l={l}
                        cols={cols}
                        cells={cells}
                        current={current}
                        onCellClick={onCellClick}
                        cellSize={cellSize}
                        yLabel={yLabels[l - 1]}
                    />
                ))}
            </div>

            <div className="heatmap-axes">
                <span className="heatmap-axis-y">{yTitle}</span>
                <span className="heatmap-axis-x">{xTitle}</span>
            </div>
        </div>
    );
}

function RowFragment({ l, cols, cells, current, onCellClick, cellSize, yLabel }) {
    return (
        <>
            <div className="heatmap-y-label">{yLabel}</div>
            {cols.map((i) => {
                const cell = readCell(cells, l, i);
                const score = cell.score ?? l * i;
                const { fill, border, fg } = colorFromScore(score);
                const count = cell.count ?? 0;
                const isCurrent = current && current.l === l && current.i === i;
                const clickable = typeof onCellClick === 'function';

                return (
                    <div
                        key={`c-${l}-${i}`}
                        className={`heatmap-cell${isCurrent ? ' is-current' : ''}`}
                        style={{
                            width: cellSize,
                            height: cellSize,
                            background: fill,
                            borderColor: isCurrent ? border : 'var(--border)',
                            color: fg,
                            cursor: clickable ? 'pointer' : 'default',
                        }}
                        onClick={clickable ? () => onCellClick(l, i) : undefined}
                        role={clickable ? 'button' : undefined}
                        tabIndex={clickable ? 0 : undefined}
                        title={`L${l} × I${i} = ${score}${count ? ` · ${count}` : ''}`}
                    >
                        {count > 0 && (
                            <span className="heatmap-cell-count mono">{count}</span>
                        )}
                        {count === 0 && (
                            <span className="heatmap-cell-score">{score}</span>
                        )}
                    </div>
                );
            })}
        </>
    );
}
