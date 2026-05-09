/**
 * Tag — neutral chip distinct from Badge.
 *
 * Where `Badge` maps semantic statuses to coloured tones, `Tag` is for
 * neutral metadata: timestamps, counts, IDs, segment labels. It reuses
 * the existing `.tag` class from app.css.
 *
 * Tones:
 *  - `neutral` — default surface-3 / fg-2 (the `.tag` baseline).
 *  - `soft`    — primary-soft / primary-2 (subtle brand chip).
 *  - `mono`    — monospace text variant for IDs / codes.
 *  - `risk`    — borderless transparent variant; pair with a coloured
 *                dot child for inline legends.
 *
 * @param {{
 *   children?: React.ReactNode,
 *   tone?: 'neutral' | 'soft' | 'mono' | 'risk',
 *   size?: 'sm' | 'md',
 *   leading?: React.ReactNode,
 *   className?: string,
 *   style?: React.CSSProperties,
 * }} props
 */
export default function Tag({
    children,
    tone = 'neutral',
    size = 'sm',
    leading,
    className,
    style,
}) {
    const toneClass =
        tone === 'soft'  ? 'tag-soft'  :
        tone === 'mono'  ? 'tag-mono mono' :
        tone === 'risk'  ? 'tag-risk'  :
        '';

    const sizeClass = size === 'md' ? 'tag-md' : '';

    return (
        <span
            className={`tag ${toneClass} ${sizeClass} ${className || ''}`.trim()}
            style={style}
        >
            {leading}
            {children}
        </span>
    );
}
