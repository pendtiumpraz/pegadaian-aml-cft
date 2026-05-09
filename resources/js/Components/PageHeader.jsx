/**
 * PageHeader matching the reference's `.page-head` pattern.
 *
 * @param {{
 *   title: string,
 *   subtitle?: string,
 *   actions?: React.ReactNode,
 *   meta?: React.ReactNode,   // optional inline chips/tags rendered next to the title
 * }} props
 */
export default function PageHeader({ title, subtitle, actions, meta }) {
    return (
        <div className="page-head">
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <h1>{title}</h1>
                    {meta}
                </div>
                {subtitle && <p>{subtitle}</p>}
            </div>
            {actions && <div className="page-actions">{actions}</div>}
        </div>
    );
}
