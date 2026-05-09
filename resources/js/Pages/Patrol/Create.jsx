import { useState } from 'react';
import { Link, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/PageHeader';
import Tag from '@/Components/Tag';
import HBar from '@/Components/HBar';
import {
    Sparkles, Wand2, ChevronLeft, Database, Clock,
    Shield, Bolt, FileText,
} from 'lucide-react';

const SUGGESTIONS = [
    'Transaksi structuring 7 hari',
    'PEP transaksi besar',
    'Smurfing pattern',
    'Watchlist hits hari ini',
];

const PRESET_PROMPTS = {
    'Transaksi structuring 7 hari':
        'Cari nasabah dengan ≥ 5 transaksi tunai dalam 7 hari, masing-masing < Rp 500 juta, namun total > Rp 2 miliar. Pola structuring/smurfing.',
    'PEP transaksi besar':
        'Carikan nasabah PEP atau relasi PEP dengan transaksi di atas Rp 100 juta dalam 30 hari terakhir.',
    'Smurfing pattern':
        'Temukan pola smurfing 7 hari terakhir: pemecahan transaksi tunai untuk menghindari pelaporan LTKT.',
    'Watchlist hits hari ini':
        'Tampilkan transaksi hari ini dari nasabah yang ada di watchlist DTTOT atau sanksi internasional.',
};

/**
 * Naive client-side preview of formula + SQL.
 * Real generation happens server-side at store(); this preview is only for UX feedback.
 */
function previewGenerate(prompt) {
    const p = (prompt || '').toLowerCase();
    const formulaParts = [];
    const whereParts = [];

    const m = p.match(/(\d+)\s*(jt|juta|m|miliar)/i);
    if (m) {
        const n = parseInt(m[1], 10);
        const unit = m[2].toLowerCase();
        const mul = unit === 'jt' || unit === 'juta' ? 1_000_000 : 1_000_000_000;
        const threshold = n * mul;
        whereParts.push(`transactions.amount > ${threshold}`);
        formulaParts.push(`transaksi.jumlah > Rp ${threshold.toLocaleString('id-ID')}`);
    } else {
        whereParts.push('transactions.amount > 100000000');
        formulaParts.push('transaksi.jumlah > Rp 100.000.000');
    }

    const dm = p.match(/(\d+)\s*hari/);
    if (dm) {
        whereParts.push(`transactions.txn_time > NOW() - INTERVAL ${dm[1]} DAY`);
        formulaParts.push(`tanggal > ${dm[1]} hari yang lalu`);
    } else if (p.includes('minggu') || p.includes('week')) {
        whereParts.push('transactions.txn_time > NOW() - INTERVAL 7 DAY');
        formulaParts.push('tanggal > 7 hari yang lalu');
    } else if (p.includes('hari ini') || p.includes('today')) {
        whereParts.push('DATE(transactions.txn_time) = CURDATE()');
        formulaParts.push('tanggal = hari ini');
    } else {
        whereParts.push('transactions.txn_time > NOW() - INTERVAL 30 DAY');
        formulaParts.push('tanggal > 30 hari yang lalu');
    }

    if (/(pep|politik|pejabat)/.test(p)) {
        whereParts.push('customers.pep_flag = TRUE');
        formulaParts.push('nasabah.is_pep = true');
    }

    if (/(watchlist|dttot|sanksi|sanction)/.test(p)) {
        whereParts.push("EXISTS (SELECT 1 FROM watchlist_hits wh WHERE wh.customer_id = customers.id AND wh.status = 'confirmed')");
        formulaParts.push('nasabah.watchlist_match = true');
    }

    if (/(smurfing|structuring|pemecahan)/.test(p)) {
        whereParts.push('transactions.amount BETWEEN 50000000 AND 499000000');
        formulaParts.push('pola_smurfing(>= 5 transaksi/hari, masing-masing < 500jt)');
    }

    if (/(curiga|mencurigakan|suspicious|risiko tinggi)/.test(p)) {
        whereParts.push("customers.risk_level IN ('high', 'critical')");
        formulaParts.push('nasabah.risk_level = high|critical');
    }

    const sql =
`-- AI generated · v1 · sandbox · readonly_aml
SELECT
  customers.cif,
  customers.name AS nasabah,
  transactions.txn_id,
  transactions.txn_time AS tanggal_transaksi,
  transactions.amount AS jumlah,
  transactions.channel,
  customers.risk_level,
  customers.ira_score
FROM transactions
JOIN customers ON customers.id = transactions.customer_id
WHERE ${whereParts.join('\n  AND ')}
ORDER BY transactions.txn_time DESC
LIMIT 200;`;

    return {
        formula: 'Filter: ' + formulaParts.join(' AND '),
        sql,
    };
}

/** Lightweight SQL syntax colorer */
function SqlPreview({ text }) {
    const KW = /\b(SELECT|FROM|WHERE|JOIN|LEFT|RIGHT|INNER|OUTER|GROUP BY|ORDER BY|WITH|AS|AND|OR|SUM|COUNT|CASE|WHEN|THEN|ELSE|END|EXISTS|IN|BETWEEN|USING|INTERVAL|NOW|DATE|CURDATE|TRUE|FALSE|NULL|DISTINCT|HAVING|LIMIT|ON)\b/g;
    const lines = (text ?? '').split('\n');
    return (
        <pre className="mono" style={{
            margin: 0,
            padding: 14,
            fontSize: 11.5,
            lineHeight: 1.6,
            background: 'var(--surface-2)',
            color: 'var(--fg)',
            borderRadius: 'var(--radius)',
            overflow: 'auto',
            maxHeight: 320,
            border: '1px solid var(--border)',
        }}>
            {lines.map((ln, i) => {
                if (ln.trim().startsWith('--')) {
                    return <div key={i} style={{ color: 'var(--fg-3)', fontStyle: 'italic' }}>{ln || ' '}</div>;
                }
                const parts = [];
                let last = 0;
                let mm;
                const re = new RegExp(KW.source, 'g');
                while ((mm = re.exec(ln))) {
                    if (mm.index > last) parts.push(ln.slice(last, mm.index));
                    parts.push(
                        <span key={`${i}-${mm.index}`} style={{ color: 'var(--primary)', fontWeight: 600 }}>
                            {mm[0]}
                        </span>
                    );
                    last = mm.index + mm[0].length;
                }
                if (last < ln.length) parts.push(ln.slice(last));
                // Numeric literals — green
                const final = parts.flatMap((p, j) => {
                    if (typeof p !== 'string') return [p];
                    const segs = [];
                    let l = 0;
                    const numRe = /\b\d{2,}\b/g;
                    let nm;
                    while ((nm = numRe.exec(p))) {
                        if (nm.index > l) segs.push(p.slice(l, nm.index));
                        segs.push(<span key={`${i}-${j}-${nm.index}`} style={{ color: 'var(--green, #2d7a4a)' }}>{nm[0]}</span>);
                        l = nm.index + nm[0].length;
                    }
                    if (l < p.length) segs.push(p.slice(l));
                    return segs;
                });
                return <div key={i}>{final.length ? final : (ln || ' ')}</div>;
            })}
        </pre>
    );
}

export default function PatrolCreate() {
    const { data, setData, post, processing, errors } = useForm({
        prompt: '',
    });

    const [generated, setGenerated] = useState(null);

    function handleGenerate() {
        if (!data.prompt || data.prompt.trim().length < 5) {
            alert('Tulis prompt minimal 5 karakter terlebih dahulu.');
            return;
        }
        setGenerated(previewGenerate(data.prompt));
    }

    function handleExecute(e) {
        e.preventDefault();
        post(route('patrol.store'));
    }

    function applySuggestion(s) {
        setData('prompt', PRESET_PROMPTS[s] ?? s);
        setGenerated(null);
    }

    // Mock estimates — derived from prompt length
    const promptLen = data.prompt.length;
    const estCost = Math.max(0.4, Math.min(5.0, (promptLen % 50) / 10 + 0.5));
    const estTime = Math.max(800, Math.min(5500, promptLen * 60 + 1200));

    return (
        <AppLayout title="Buat Query AI Patrol">
            <PageHeader
                title="Buat Query AI Patrol"
                subtitle="Tulis pola dalam bahasa natural · AI hasilkan formula DSL & SQL · Tinjau & eksekusi"
                meta={
                    <Tag tone="soft" style={{ background: 'oklch(0.92 0.06 85)', color: 'oklch(0.40 0.12 75)' }}>
                        <Sparkles size={11} style={{ marginRight: 4 }} /> NEW
                    </Tag>
                }
                actions={
                    <Link href={route('patrol.index')} className="btn">
                        <ChevronLeft size={14} /> Kembali
                    </Link>
                }
            />

            <div className="card" style={{ marginBottom: 16 }}>
                {/* Prompt Section */}
                <div className="card-head">
                    <h3>1. Apa yang ingin Anda cari?</h3>
                    <Tag tone="soft">
                        <Sparkles size={11} style={{ marginRight: 4 }} />
                        AI siap · model: aml-reasoner-v2
                    </Tag>
                </div>
                <div className="card-body">
                    <textarea
                        className="input"
                        value={data.prompt}
                        onChange={(e) => { setData('prompt', e.target.value); setGenerated(null); }}
                        placeholder="Contoh: Cari transaksi mencurigakan minggu ini di atas Rp 100 juta dari nasabah PEP"
                        rows={5}
                        style={{
                            width: '100%',
                            fontSize: 13,
                            lineHeight: 1.55,
                            resize: 'vertical',
                            minHeight: 110,
                        }}
                    />
                    {errors.prompt && (
                        <p style={{ color: 'var(--red)', fontSize: 11, marginTop: 6 }}>{errors.prompt}</p>
                    )}

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                        <span className="muted" style={{ fontSize: 11.5, alignSelf: 'center', marginRight: 4 }}>
                            Saran:
                        </span>
                        {SUGGESTIONS.map(s => (
                            <button
                                type="button"
                                key={s}
                                onClick={() => applySuggestion(s)}
                                className="tag"
                                style={{
                                    cursor: 'pointer',
                                    border: '1px solid var(--border)',
                                    background: 'var(--surface-2)',
                                    fontSize: 11.5,
                                    padding: '4px 10px',
                                }}
                            >
                                {s}
                            </button>
                        ))}
                    </div>

                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: 16,
                        paddingTop: 14,
                        borderTop: '1px solid var(--border)',
                    }}>
                        <span className="muted" style={{ fontSize: 11.5, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <Shield size={12} />
                            Query di-sandbox, read-only, dicatat di audit log.
                        </span>
                        <button
                            type="button"
                            className="btn primary"
                            onClick={handleGenerate}
                            disabled={!data.prompt || data.prompt.length < 5}
                        >
                            <Sparkles size={14} /> Generate Formula &amp; SQL
                        </button>
                    </div>
                </div>
            </div>

            {generated && (
                <>
                    {/* Formula card */}
                    <div className="card" style={{ marginBottom: 16 }}>
                        <div className="card-head">
                            <h3>2a. Formula yang dibaca AI</h3>
                            <Tag tone="soft">Tervalidasi</Tag>
                        </div>
                        <div className="card-body">
                            <pre className="mono" style={{
                                margin: 0,
                                padding: 14,
                                fontSize: 12,
                                lineHeight: 1.6,
                                background: 'var(--surface-2)',
                                color: 'var(--fg)',
                                borderRadius: 'var(--radius)',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                                border: '1px solid var(--border)',
                            }}>
                                {generated.formula}
                            </pre>
                        </div>
                    </div>

                    {/* SQL Preview */}
                    <div className="card" style={{ marginBottom: 16 }}>
                        <div className="card-head">
                            <h3>2b. SQL ke Data Warehouse</h3>
                            <Tag>core-banking-pegadaian</Tag>
                        </div>
                        <div className="card-body">
                            <SqlPreview text={generated.sql} />
                        </div>
                    </div>

                    {/* Cost & Time estimate */}
                    <div className="card" style={{ marginBottom: 16 }}>
                        <div className="card-head">
                            <h3>3. Pre-flight: Estimasi Biaya &amp; Waktu</h3>
                        </div>
                        <div className="card-body">
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                                <div style={{
                                    padding: 14,
                                    background: 'var(--surface-2)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 'var(--radius)',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--fg-3)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.05 }}>
                                        <Database size={12} /> Estimasi Biaya
                                    </div>
                                    <div style={{ fontSize: 18, fontWeight: 600, marginTop: 6 }}>
                                        {estCost.toFixed(2)} GB scanned
                                    </div>
                                    <div className="muted" style={{ fontSize: 11, marginTop: 4 }}>
                                        ≈ {(estCost * 1_500_000).toLocaleString('id-ID', { maximumFractionDigits: 0 })} baris dipindai
                                    </div>
                                    <div style={{ marginTop: 10 }}>
                                        <HBar value={estCost} max={5} color="var(--primary)" />
                                    </div>
                                </div>

                                <div style={{
                                    padding: 14,
                                    background: 'var(--surface-2)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 'var(--radius)',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--fg-3)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.05 }}>
                                        <Clock size={12} /> Estimasi Waktu
                                    </div>
                                    <div style={{ fontSize: 18, fontWeight: 600, marginTop: 6 }}>
                                        ≈ {(estTime / 1000).toFixed(1)} detik
                                    </div>
                                    <div className="muted" style={{ fontSize: 11, marginTop: 4 }}>
                                        Di warehouse PostgreSQL · query timeout 5 menit
                                    </div>
                                    <div style={{ marginTop: 10 }}>
                                        <HBar value={estTime} max={6000} color="var(--amber)" tone="amber" />
                                    </div>
                                </div>
                            </div>

                            <div style={{
                                marginTop: 16,
                                paddingTop: 14,
                                borderTop: '1px solid var(--border)',
                                display: 'flex',
                                gap: 8,
                                justifyContent: 'flex-end',
                            }}>
                                <button
                                    type="button"
                                    className="btn"
                                    onClick={() => setGenerated(null)}
                                >
                                    <ChevronLeft size={13} /> Edit Prompt
                                </button>
                                <button
                                    type="button"
                                    className="btn primary"
                                    onClick={handleExecute}
                                    disabled={processing}
                                    style={{ padding: '10px 18px', fontSize: 13 }}
                                >
                                    <Bolt size={14} />
                                    {processing ? 'Memproses…' : 'Simpan & Eksekusi Query'}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </AppLayout>
    );
}
