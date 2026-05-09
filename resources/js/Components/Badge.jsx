/**
 * Badge / chip matching the reference `.tag` pattern.
 *
 * Each AML status maps to one of the reference's tone palette:
 *  - default | green | amber | red | blue | violet
 *
 * Risk levels can be rendered as a "rpill" via the `risk` prop instead.
 */
const TONE_BY_STATUS = {
    // AML case statuses
    baru:        'red',
    triage:      'blue',
    investigasi: 'amber',
    eskalasi:    'red',
    selesai:     'green',
    closed:      'green',

    // Severity / risk
    low:         'green',
    rendah:      'green',
    med:         'amber',
    medium:      'amber',
    sedang:      'amber',
    menengah:    'amber',
    high:        'red',
    tinggi:      'red',
    critical:    'red',

    // Generic
    aktif:       'green',
    active:      'green',
    nonaktif:    'default',
    inactive:    'default',
    draft:       'default',
    pending:     'amber',
    approved:    'green',
    rejected:    'red',
    submitted:   'blue',
};

const LABEL_BY_STATUS = {
    baru:        'Baru',
    triage:      'Triage',
    investigasi: 'Investigasi',
    eskalasi:    'Eskalasi',
    selesai:     'Selesai',
    closed:      'Selesai',

    low:         'Rendah',
    rendah:      'Rendah',
    med:         'Sedang',
    medium:      'Sedang',
    sedang:      'Sedang',
    menengah:    'Menengah',
    high:        'Tinggi',
    tinggi:      'Tinggi',
    critical:    'Kritis',

    aktif:       'Aktif',
    active:      'Aktif',
    nonaktif:    'Nonaktif',
    inactive:    'Nonaktif',
    draft:       'Draft',
    pending:     'Pending',
    approved:    'Disetujui',
    rejected:    'Ditolak',
    submitted:   'Dikirim',
};

/**
 * @param {{
 *   status?: string,
 *   tone?: 'default'|'green'|'amber'|'red'|'blue'|'violet',
 *   label?: string,
 *   risk?: 'low'|'med'|'high',
 *   children?: React.ReactNode,
 * }} props
 */
export default function Badge({ status, tone, label, risk, children }) {
    // Risk-pill rendering (rounded forest/amber/red bold pill)
    if (risk) {
        const labels = { low: 'Rendah', med: 'Menengah', high: 'Tinggi' };
        return (
            <span className={`rpill ${risk}`}>
                {label ?? children ?? labels[risk]}
            </span>
        );
    }

    const key = (status ?? '').toLowerCase();
    const finalTone = tone ?? TONE_BY_STATUS[key] ?? 'default';
    const finalLabel = label ?? children ?? LABEL_BY_STATUS[key] ?? status ?? '';

    return (
        <span className={`tag ${finalTone === 'default' ? '' : finalTone}`}>
            {finalLabel}
        </span>
    );
}
