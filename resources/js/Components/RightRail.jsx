/**
 * RightRail — detail page layout helper with right sidebar.
 *
 * CSS grid `1fr / railWidth` for *.show pages. Place primary content in
 * `main` and supporting metadata (status, audit, related) in `rail`.
 *
 * @param {{
 *   main?: React.ReactNode,
 *   rail?: React.ReactNode,
 *   railWidth?: string,
 *   gap?: string,
 *   children?: React.ReactNode,
 *   className?: string,
 *   style?: React.CSSProperties,
 * }} props
 */
export default function RightRail({
    main,
    rail,
    railWidth = '320px',
    gap = 'var(--gap)',
    children,
    className,
    style,
}) {
    let mainNode = main;
    let railNode = rail;
    if (mainNode == null && railNode == null && children != null) {
        const arr = Array.isArray(children) ? children : [children];
        [mainNode, railNode] = arr;
    }

    return (
        <div
            className={`right-rail ${className || ''}`.trim()}
            style={{
                display: 'grid',
                gridTemplateColumns: `1fr ${railWidth}`,
                gap,
                alignItems: 'start',
                ...style,
            }}
        >
            <div className="right-rail-main">{mainNode}</div>
            <aside className="right-rail-rail">{railNode}</aside>
        </div>
    );
}
