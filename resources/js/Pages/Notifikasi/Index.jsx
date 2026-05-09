import { useMemo, useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/PageHeader';
import Tag from '@/Components/Tag';
import Avatar from '@/Components/Avatar';
import {
    Bell,
    AlertTriangle,
    Briefcase,
    ShieldCheck,
    RefreshCw,
    Clock,
    Search,
    Check,
    Settings as SettingsIcon,
    BellOff,
    MailOpen,
    MoreHorizontal,
} from 'lucide-react';

const TABS = [
    ['all',    'Semua'],
    ['alert',  'Alerts'],
    ['case',   'Cases'],
    ['system', 'Sistem'],
];

const TYPE_META = {
    alert:    { icon: AlertTriangle, tone: 'red',    label: 'Alert' },
    deadline: { icon: Clock,         tone: 'amber',  label: 'Tenggat' },
    approval: { icon: ShieldCheck,   tone: 'blue',   label: 'Approval' },
    case:     { icon: Briefcase,     tone: 'amber',  label: 'Case' },
    screening:{ icon: Search,        tone: 'red',    label: 'Screening' },
    system:   { icon: RefreshCw,     tone: 'default',label: 'Sistem' },
    policy:   { icon: ShieldCheck,   tone: 'blue',   label: 'Policy' },
};

const TONE_BG = {
    red:     'oklch(0.93 0.04 25)',
    amber:   'oklch(0.95 0.04 75)',
    blue:    'oklch(0.93 0.03 245)',
    green:   'var(--primary-soft, oklch(0.94 0.04 155))',
    default: 'var(--surface-3)',
};

const TONE_FG = {
    red:     'var(--red)',
    amber:   'oklch(0.45 0.12 75)',
    blue:    'var(--blue, oklch(0.50 0.10 245))',
    green:   'var(--primary-2, oklch(0.45 0.10 155))',
    default: 'var(--fg-2)',
};

const SAMPLE = [
    // recent / unread
    { id: 'n01', type: 'alert',    title: 'Alert prioritas tinggi baru',          body: 'ALT-2026-04781 · Hartono Wijaya · skor 87',          time: '12 mnt',  ts: '08/05 09:42', is_read: false },
    { id: 'n02', type: 'deadline', title: 'LTKT Harian — cut-off 16:00 WIB',       body: '12.408 transaksi siap submit ke PPATK',              time: '1 jam',   ts: '08/05 08:42', is_read: false },
    { id: 'n03', type: 'approval', title: 'Permintaan approval LTKM',              body: 'LTKM-2026050702 menunggu Head AML/CFT',              time: '1 jam',   ts: '08/05 08:38', is_read: false },
    { id: 'n04', type: 'screening',title: 'Hit DPPSPM baru terdeteksi',            body: 'PT Karya Bersama Sejahtera · confidence 78%',         time: '2 jam',   ts: '08/05 07:14', is_read: false },
    { id: 'n05', type: 'case',     title: 'Case ALT-2026-04779 dibuka',            body: 'Investigasi pemecahan transaksi · assignee M. Atikah', time: '3 jam',  ts: '08/05 06:48', is_read: false },
    { id: 'n06', type: 'system',   title: 'Sinkronisasi DTTOT berhasil',           body: '412 entri · tidak ada perubahan',                      time: '3 jam',   ts: '08/05 06:12', is_read: false },
    { id: 'n07', type: 'approval', title: 'EDD-2026-214 disetujui',                body: 'Budi Santoso · approval oleh S. Adi',                  time: '5 jam',   ts: '08/05 04:30', is_read: true  },
    { id: 'n08', type: 'deadline', title: 'Komite Pemantau Risiko 30 Mei',         body: 'Materi APU PPT belum disusun',                         time: '8 jam',   ts: '08/05 01:30', is_read: true  },

    // 1-2 days
    { id: 'n09', type: 'system',   title: 'Anomaly engine v3.2.1 deployed',        body: 'Patch FP rate untuk R-SMURF-04',                       time: '1 hari',  ts: '07/05 09:30', is_read: true  },
    { id: 'n10', type: 'alert',    title: '12 alert baru dari MIS',                 body: 'Diurutkan otomatis berdasarkan skor',                  time: '1 hari',  ts: '07/05 08:14', is_read: true  },
    { id: 'n11', type: 'screening',title: 'Update PEP Domestik',                    body: '1 entri baru oleh M. Atikah',                          time: '1 hari',  ts: '07/05 07:48', is_read: true  },
    { id: 'n12', type: 'policy',   title: 'Pembaruan policy KYC v2.4',              body: 'Periode review high-risk customer 6 → 3 bulan',        time: '1 hari',  ts: '07/05 07:14', is_read: true  },
    { id: 'n13', type: 'case',     title: 'Case ALT-2026-04778 ditutup',            body: 'False positive · M. Atikah → S. Adi',                  time: '1 hari',  ts: '07/05 06:48', is_read: true  },
    { id: 'n14', type: 'system',   title: 'Backup database harian sukses',          body: 'Snapshot 04:00 WIB · 14.2 GB',                         time: '2 hari',  ts: '06/05 04:00', is_read: true  },
    { id: 'n15', type: 'alert',    title: 'Threshold R-LTKT-01 terlewati',          body: '8 transaksi tunai > Rp 500jt dari outlet 0114',        time: '2 hari',  ts: '06/05 14:32', is_read: true  },

    // older
    { id: 'n16', type: 'approval', title: 'LTKM-2026050614781 approved',           body: 'Submitted ke PPATK · receipt diterima',                time: '2 hari',  ts: '06/05 14:02', is_read: true  },
    { id: 'n17', type: 'screening',title: 'Sync OFAC SDN selesai',                  body: '+18 baru / −4 dihapus',                                time: '2 hari',  ts: '06/05 23:00', is_read: true  },
    { id: 'n18', type: 'case',     title: 'Eskalasi case ke Head AML',              body: 'ALT-2026-04777 · risiko tinggi',                       time: '3 hari',  ts: '05/05 16:44', is_read: true  },
    { id: 'n19', type: 'deadline', title: 'Laporan Triwulanan Q1 — H-7',            body: 'Deadline 15 Mei · 1.84M nasabah',                      time: '3 hari',  ts: '05/05 09:12', is_read: true  },
    { id: 'n20', type: 'system',   title: 'Sync UN Consolidated gagal',             body: 'Timeout 30s · auto-retry 06/05 12:00',                 time: '3 hari',  ts: '05/05 12:00', is_read: true  },
    { id: 'n21', type: 'alert',    title: 'Alert IRA naik 25 poin',                  body: 'CIF-7723014 · pola transaksi berubah',                 time: '4 hari',  ts: '04/05 11:18', is_read: true  },
    { id: 'n22', type: 'system',   title: 'Submit DTTOT update ke OJK',              body: '412 entri · receipt OJK-DTT-2026050423552',            time: '4 hari',  ts: '04/05 23:55', is_read: true  },
    { id: 'n23', type: 'policy',   title: 'Periode pelatihan AML refresher',        body: '24 staf belum complete · deadline 20 Mei',             time: '5 hari',  ts: '03/05 09:00', is_read: true  },
    { id: 'n24', type: 'case',     title: 'Case ALT-2026-04770 closed',             body: 'Selesai · disposisi false positive',                   time: '5 hari',  ts: '03/05 16:14', is_read: true  },
    { id: 'n25', type: 'approval', title: 'Permintaan akses sistem',                body: 'Rahmat Hidayat → role AML Analyst',                    time: '6 hari',  ts: '02/05 14:30', is_read: true  },
];

const PREF_DEFAULTS = [
    { name: 'Alert prioritas tinggi', frequency: 'Realtime',         email: true,  teams: true,  inapp: true  },
    { name: 'Tenggat pelaporan',      frequency: '1 hari sebelum',    email: true,  teams: false, inapp: true  },
    { name: 'Approval request',       frequency: 'Realtime',         email: true,  teams: true,  inapp: true  },
    { name: 'Hit DTTOT/DPPSPM',       frequency: 'Realtime',         email: true,  teams: true,  inapp: true  },
    { name: 'Case update',            frequency: 'Harian digest',     email: false, teams: false, inapp: true  },
    { name: 'Sinkronisasi sistem',    frequency: 'Harian digest',     email: false, teams: false, inapp: true  },
    { name: 'Update model IRA',       frequency: 'Mingguan',         email: false, teams: false, inapp: true  },
];

/**
 * @param {{
 *   notifications?: Array<{ id: string|number, type: string, title: string, body?: string, is_read?: boolean, created_at?: string }>,
 *   preferences?: Array<object>,
 * }} props
 */
export default function NotifikasiIndex({ notifications = [], preferences = [] }) {
    const [tab, setTab]       = useState('all');
    const [readMap, setReadMap] = useState({}); // local override

    const items = useMemo(() => {
        const base = notifications.length > 0
            ? notifications.map(n => ({
                id:      n.id,
                type:    n.type,
                title:   n.title,
                body:    n.body ?? '',
                ts:      n.created_at ?? '',
                time:    n.created_at ? formatRelative(n.created_at) : '',
                is_read: !!n.is_read,
            }))
            : SAMPLE;
        return base.map(n => ({ ...n, is_read: readMap[n.id] ?? n.is_read }));
    }, [notifications, readMap]);

    const filtered = useMemo(() => {
        if (tab === 'all')    return items;
        if (tab === 'alert')  return items.filter(n => ['alert','screening','deadline'].includes(n.type));
        if (tab === 'case')   return items.filter(n => ['case','approval'].includes(n.type));
        if (tab === 'system') return items.filter(n => ['system','policy'].includes(n.type));
        return items;
    }, [items, tab]);

    const unreadCount = items.filter(i => !i.is_read).length;

    function markAllRead() {
        const next = { ...readMap };
        items.forEach(i => { next[i.id] = true; });
        setReadMap(next);
    }

    function toggleRead(id) {
        setReadMap(prev => ({ ...prev, [id]: !(prev[id] ?? items.find(i => i.id === id)?.is_read) }));
    }

    return (
        <AppLayout title="Notifikasi">
            <PageHeader
                title="Notifikasi"
                subtitle={`Pusat notifikasi tim AML/CFT · ${unreadCount} belum dibaca`}
                actions={
                    <>
                        <button type="button" className="btn" onClick={markAllRead}>
                            <Check size={14} /> Tandai Semua Dibaca
                        </button>
                        <button type="button" className="btn">
                            <SettingsIcon size={14} /> Preferences
                        </button>
                    </>
                }
            />

            {/* Tabs */}
            <div className="tabs">
                {TABS.map(([id, label]) => {
                    const count = id === 'all'
                        ? items.length
                        : id === 'alert'  ? items.filter(n => ['alert','screening','deadline'].includes(n.type)).length
                        : id === 'case'   ? items.filter(n => ['case','approval'].includes(n.type)).length
                                          : items.filter(n => ['system','policy'].includes(n.type)).length;
                    return (
                        <button
                            key={id}
                            type="button"
                            className={`tab ${tab === id ? 'active' : ''}`}
                            onClick={() => setTab(id)}
                        >
                            {label} ({count})
                        </button>
                    );
                })}
            </div>

            {/* 2-col: list + preferences sidebar */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 320px',
                    gap: 'var(--gap, 16px)',
                    alignItems: 'start',
                }}
            >
                <div className="card">
                    <div className="card-head">
                        <h3>Notifikasi</h3>
                        <Tag>{filtered.length} item</Tag>
                    </div>
                    <div className="card-body tight" style={{ display: 'flex', flexDirection: 'column' }}>
                        {filtered.length === 0 ? (
                            <div style={{ padding: 32, textAlign: 'center', color: 'var(--fg-3)', fontSize: 12 }}>
                                Tidak ada notifikasi pada tab ini.
                            </div>
                        ) : (
                            filtered.map(n => <NotificationRow key={n.id} item={n} onToggle={() => toggleRead(n.id)} />)
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div className="card">
                        <div className="card-head"><h3>Preferences</h3></div>
                        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {(preferences.length > 0 ? preferences : PREF_DEFAULTS).map((p, i) => (
                                <PreferenceRow
                                    key={p.id ?? p.notification_name ?? p.name ?? i}
                                    name={p.notification_name ?? p.name}
                                    frequency={p.frequency ?? 'Realtime'}
                                    email={p.channel_email ?? p.email}
                                    teams={p.channel_teams ?? p.teams}
                                    inapp={p.channel_inapp ?? p.inapp}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-head"><h3>Channel</h3></div>
                        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
                            <span className="tag green">In-app aktif</span>
                            <span className="tag green">Email aktif</span>
                            <span className="tag green">Microsoft Teams aktif</span>
                            <span className="tag">SMS nonaktif</span>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <button className="btn" style={{ justifyContent: 'center' }}>
                                <BellOff size={14} /> Snooze All (1 jam)
                            </button>
                            <button className="btn ghost" style={{ justifyContent: 'center' }}>
                                <MailOpen size={14} /> Buka di mailbox
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

/* ---------- Notification row ---------- */

function NotificationRow({ item, onToggle }) {
    const meta = TYPE_META[item.type] ?? TYPE_META.system;
    const Icon = meta.icon;
    const tone = meta.tone;
    const unread = !item.is_read;

    return (
        <button
            type="button"
            onClick={onToggle}
            style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                padding: '10px 14px 10px 22px',
                background: unread ? 'var(--surface-2)' : 'transparent',
                border: 0,
                borderBottom: '1px solid var(--border)',
                position: 'relative',
                cursor: 'pointer',
                textAlign: 'left',
                color: 'inherit',
            }}
        >
            {unread && (
                <span
                    aria-hidden="true"
                    style={{
                        position: 'absolute',
                        left: 8,
                        top: 18,
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: 'var(--primary)',
                    }}
                />
            )}
            <span
                aria-hidden="true"
                style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    display: 'grid',
                    placeItems: 'center',
                    background: TONE_BG[tone] ?? TONE_BG.default,
                    color: TONE_FG[tone] ?? TONE_FG.default,
                    flexShrink: 0,
                }}
            >
                <Icon size={15} strokeWidth={1.75} />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <strong style={{ fontSize: 12.5 }}>{item.title}</strong>
                    <Tag size="sm">{meta.label}</Tag>
                </div>
                {item.body && (
                    <div className="muted" style={{ fontSize: 11.5, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.body}
                    </div>
                )}
            </div>
            <span className="mono" style={{ fontSize: 11, color: 'var(--fg-3)', flexShrink: 0, marginTop: 2 }}>{item.time}</span>
            <span
                aria-hidden="true"
                className="btn ghost"
                style={{ padding: '3px 6px', flexShrink: 0 }}
            >
                <MoreHorizontal size={13} />
            </span>
        </button>
    );
}

/* ---------- Preference row ---------- */

function PreferenceRow({ name, frequency, email, teams, inapp }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 500 }}>{name}</div>
                    <div className="muted" style={{ fontSize: 11 }}>{frequency}</div>
                </div>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <ChannelChip label="In-app" on={inapp} />
                <ChannelChip label="Email"  on={email} />
                <ChannelChip label="Teams"  on={teams} />
            </div>
        </div>
    );
}

function ChannelChip({ label, on }) {
    return (
        <span
            className={`tag ${on ? 'green' : ''}`}
            style={{ fontSize: 10.5 }}
        >
            {label} {on ? '✓' : '·'}
        </span>
    );
}

/* ---------- Helpers ---------- */

function formatRelative(iso) {
    if (!iso) return '';
    const dt = new Date(iso);
    if (Number.isNaN(dt.getTime())) return '';
    const diff = Math.max(0, Date.now() - dt.getTime());
    const m = Math.floor(diff / 60000);
    if (m < 1)   return 'baru saja';
    if (m < 60)  return `${m} mnt`;
    const h = Math.floor(m / 60);
    if (h < 24)  return `${h} jam`;
    const d = Math.floor(h / 24);
    if (d < 30)  return `${d} hari`;
    return dt.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
}
