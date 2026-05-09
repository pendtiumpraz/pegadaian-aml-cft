/**
 * MasterDetail — split-pane layout helper.
 *
 * Renders a CSS grid with a fixed-width master column and a fluid detail
 * column. Used by Cases / EDD / LTKM index pages where you select a row
 * on the left and see its full record on the right.
 *
 * Pass either children prop:
 *  - `master` and `detail` as ReactNodes (preferred for explicit layout)
 *  - or two children directly (master first, detail second)
 *
 * `masterWidth` accepts any CSS length (px, fr, %).
 *
 * @param {{
 *   master?: React.ReactNode,
 *   detail?: React.ReactNode,
 *   masterWidth?: string,
 *   gap?: string,
 *   children?: React.ReactNode,
 *   className?: string,
 *   style?: React.CSSProperties,
 * }} props
 */
export default function MasterDetail({
    master,
    detail,
    masterWidth = '340px',
    gap = 'var(--gap)',
    children,
    className,
    style,
}) {
    let m = master;
    let d = detail;
    if (m == null && d == null && children != null) {
        const arr = Array.isArray(children) ? children : [children];
        [m, d] = arr;
    }

    return (
        <div
            className={`master-detail ${className || ''}`.trim()}
            style={{
                display: 'grid',
                gridTemplateColumns: `${masterWidth} 1fr`,
                gap,
                alignItems: 'start',
                ...style,
            }}
        >
            <div className="master-detail-master">{m}</div>
            <div className="master-detail-detail">{d}</div>
        </div>
    );
}
