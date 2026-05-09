/**
 * Avatar — initials disc.
 *
 * Renders a 1–2 letter monogram in a coloured square (default rounded
 * to a circle). When `color` is omitted, a stable colour is derived from
 * the supplied `name` so the same person always gets the same hue.
 *
 * @param {{
 *   name?: string,
 *   size?: number,
 *   color?: string,
 *   shape?: 'circle' | 'square',
 *   tooltip?: string,
 *   className?: string,
 *   style?: React.CSSProperties,
 * }} props
 */
const PALETTE = [
    'var(--primary)',
    'oklch(0.50 0.10 245)',  // blue
    'oklch(0.50 0.10 295)',  // violet
    'oklch(0.55 0.16 25)',   // red
    'oklch(0.55 0.13 50)',   // orange
    'oklch(0.50 0.10 200)',  // teal
    'oklch(0.55 0.10 155)',  // forest
    'oklch(0.50 0.10 330)',  // pink
];

function hashName(name) {
    let h = 0;
    for (let i = 0; i < name.length; i++) {
        h = (h * 31 + name.charCodeAt(i)) | 0;
    }
    return Math.abs(h);
}

function initialsFrom(name) {
    if (!name) return '?';
    const parts = String(name).trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Avatar({
    name = '',
    size = 32,
    color,
    shape = 'circle',
    tooltip,
    className,
    style,
}) {
    const initials = initialsFrom(name);
    const bg = color || PALETTE[hashName(name) % PALETTE.length];
    const fontSize = Math.max(10, Math.round(size * 0.4));
    const radius = shape === 'square' ? Math.round(size * 0.22) : '50%';

    return (
        <span
            className={`avatar-disc ${className || ''}`}
            title={tooltip ?? name}
            style={{
                width: size,
                height: size,
                borderRadius: radius,
                background: bg,
                color: 'var(--fg-inv)',
                display: 'inline-grid',
                placeItems: 'center',
                fontSize,
                fontWeight: 600,
                letterSpacing: '0.02em',
                lineHeight: 1,
                userSelect: 'none',
                flexShrink: 0,
                ...style,
            }}
            aria-label={name || undefined}
        >
            {initials}
        </span>
    );
}
