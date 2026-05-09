import { useState, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import {
    LayoutDashboard,
    Users,
    ArrowLeftRight,
    Bell,
    Briefcase,
    FileSearch,
    ShieldAlert,
    FileWarning,
    FileText,
    Settings,
    Settings2,
    GraduationCap,
    Search,
    HelpCircle,
    MoreHorizontal,
    LogOut,
    X,
    ChevronRight,
    Sparkles,
    UserPlus,
} from 'lucide-react';

/* --------------------------------------------------------------------
   Navigation — grouped to match reference's section labels
   -------------------------------------------------------------------- */
const NAV_GROUPS = [
    {
        section: 'OPERASIONAL',
        items: [
            { id: 'dashboard',   label: 'Dashboard',           href: '/',           icon: LayoutDashboard, route: 'dashboard' },
            { id: 'alerts',      label: 'Alerts',              href: '/alerts',     icon: Bell,            route: 'alerts.index', badgeFromAlertCount: true, alertTone: true },
            { id: 'transactions',label: 'Pemantauan Transaksi',href: '/transaksi',  icon: ArrowLeftRight,  route: 'transactions.index' },
            { id: 'onboarding',  label: 'Onboarding',          href: '/onboarding', icon: UserPlus,        route: 'onboarding.create' },
            { id: 'cases',       label: 'Manajemen Kasus',     href: '/kasus',      icon: Briefcase,       route: 'cases.index' },
            { id: 'edd',         label: 'EDD — Enhanced DD',   href: '/edd',        icon: FileSearch,      route: 'edd.index' },
        ],
    },
    {
        section: 'ANALISIS',
        items: [
            { id: 'customers',   label: 'Nasabah / CDD',       href: '/nasabah',    icon: Users,           route: 'customers.index' },
            { id: 'watchlist',   label: 'Watchlist DTTOT',     href: '/watchlist',  icon: ShieldAlert,     route: 'watchlist.index' },
            { id: 'ltkm',        label: 'LTKM Workspace',      href: '/ltkm',       icon: FileWarning,     route: 'ltkm.index' },
            { id: 'reports',     label: 'Pelaporan Regulator', href: '/laporan',    icon: FileText,        route: 'reports.index' },
        ],
    },
    {
        section: 'TOOLS',
        items: [
            { id: 'patrol',      label: 'AI Patrol',           href: '/patrol',     icon: Sparkles,        route: 'patrol.index', badge: 'NEW' },
        ],
    },
    {
        section: 'PENGATURAN',
        items: [
            { id: 'rules',         label: 'Aturan Screening',      href: '/aturan',     icon: Settings2,       route: 'rules.index' },
            { id: 'training',      label: 'Pelatihan & Awareness', href: '/pelatihan',  icon: GraduationCap,   route: 'training.index' },
            { id: 'notifications', label: 'Notifikasi',            href: '/notifikasi', icon: Bell,            route: 'notifications.index' },
            { id: 'settings',      label: 'Pengaturan Sistem',     href: '/pengaturan', icon: Settings,        route: 'settings.index' },
        ],
    },
];

/** Returns true when the given route name is the current page. Falls back to href prefix match. */
function isActive(routeName, href) {
    try {
        if (routeName && route().current(routeName)) return true;
    } catch {
        // ignore — ziggy routes may not be registered for every nav item
    }
    if (typeof window === 'undefined') return false;
    const path = window.location.pathname;
    if (href === '/') return path === '/';
    return path === href || path.startsWith(href + '/');
}

/* --------------------------------------------------------------------
   Toast (flash message stack)
   -------------------------------------------------------------------- */
function Toast({ id, type, message, onDismiss }) {
    useEffect(() => {
        const t = setTimeout(() => onDismiss(id), 4000);
        return () => clearTimeout(t);
    }, [id, onDismiss]);

    const toneStyle = {
        success: { background: 'var(--primary)',  color: 'var(--fg-inv)' },
        error:   { background: 'var(--red)',      color: '#fff' },
        warning: { background: 'var(--amber)',    color: 'oklch(0.20 0.04 75)' },
    }[type] || { background: 'var(--primary)', color: 'var(--fg-inv)' };

    return (
        <div
            className="flex items-center gap-3"
            style={{
                ...toneStyle,
                padding: '10px 14px',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow)',
                fontSize: 12.5,
                fontWeight: 500,
                minWidth: 240,
                maxWidth: 380,
            }}
        >
            <span style={{ flex: 1 }}>{message}</span>
            <button
                onClick={() => onDismiss(id)}
                style={{ background: 'transparent', border: 0, color: 'inherit', opacity: 0.8, cursor: 'pointer' }}
            >
                <X size={14} />
            </button>
        </div>
    );
}

function ToastStack({ flash }) {
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        if (!flash) return;
        const newToasts = [];
        if (flash.success) newToasts.push({ id: Date.now() + 1, type: 'success', message: flash.success });
        if (flash.error)   newToasts.push({ id: Date.now() + 2, type: 'error',   message: flash.error });
        if (flash.warning) newToasts.push({ id: Date.now() + 3, type: 'warning', message: flash.warning });
        if (newToasts.length) setToasts(prev => [...prev, ...newToasts]);
    }, [flash]);

    const dismiss = (id) => setToasts(prev => prev.filter(t => t.id !== id));

    if (!toasts.length) return null;

    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
            {toasts.map(t => <Toast key={t.id} {...t} onDismiss={dismiss} />)}
        </div>
    );
}

/* --------------------------------------------------------------------
   Sidebar
   -------------------------------------------------------------------- */
function Sidebar({ alertCount, user, onLogout }) {
    const initials = (user?.name ?? 'U').split(/\s+/).slice(0, 2).map(s => s.charAt(0).toUpperCase()).join('');

    return (
        <aside className="sidebar">
            <div className="brand">
                <div className="brand-mark">AC</div>
                <div className="brand-text">
                    <strong>AML / CFT</strong>
                    <span>Divisi Kepatuhan</span>
                </div>
            </div>

            <div style={{ overflowY: 'auto', flex: 1, paddingBottom: 8 }}>
                {NAV_GROUPS.map(group => (
                    <div key={group.section}>
                        <div className="nav-section">{group.section}</div>
                        <div className="nav">
                            {group.items.map(item => {
                                const Icon = item.icon;
                                const active = isActive(item.route, item.href);
                                const showAlertBadge = item.badgeFromAlertCount && alertCount > 0;

                                return (
                                    <Link
                                        key={item.id}
                                        href={item.href}
                                        className={`nav-item ${active ? 'active' : ''}`}
                                    >
                                        <Icon className="ico" size={16} strokeWidth={1.75} />
                                        <span>{item.label}</span>
                                        {showAlertBadge && (
                                            <span className={`badge ${item.alertTone ? 'alert' : ''}`}>
                                                {alertCount > 99 ? '99+' : alertCount}
                                            </span>
                                        )}
                                        {item.badge && !showAlertBadge && (
                                            <span
                                                className="badge"
                                                style={{
                                                    background: 'oklch(0.92 0.06 85)',
                                                    color: 'oklch(0.40 0.12 75)',
                                                    fontSize: 9.5,
                                                    fontWeight: 700,
                                                    letterSpacing: 0.04,
                                                    padding: '2px 6px',
                                                    borderRadius: 4,
                                                    border: '1px solid oklch(0.80 0.10 85)',
                                                }}
                                            >
                                                {item.badge}
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <div className="sidebar-footer">
                <div className="avatar">{initials || 'U'}</div>
                <div className="user-info">
                    <strong>{user?.name ?? 'User'}</strong>
                    <span>{user?.role ?? user?.email ?? 'AML/CFT Specialist'}</span>
                </div>
                <button
                    className="icon-btn"
                    onClick={onLogout}
                    title="Logout"
                    style={{ marginLeft: 'auto' }}
                >
                    <LogOut size={14} />
                </button>
            </div>
        </aside>
    );
}

/* --------------------------------------------------------------------
   Topbar
   -------------------------------------------------------------------- */
function Topbar({ title, breadcrumbs }) {
    return (
        <header className="topbar">
            <div className="crumbs">
                <span>Beranda</span>
                {breadcrumbs.map((c, i) => (
                    <span key={c.href} className="flex items-center gap-1.5" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <span className="sep">/</span>
                        {i === breadcrumbs.length - 1 ? (
                            <strong>{c.label}</strong>
                        ) : (
                            <Link href={c.href}>{c.label}</Link>
                        )}
                    </span>
                ))}
            </div>

            <div className="search">
                <Search size={14} strokeWidth={1.75} />
                <input placeholder="Cari nasabah, CIF, no. transaksi, atau kasus…" />
                <kbd>⌘K</kbd>
            </div>

            <div className="topbar-actions">
                <button className="icon-btn" title="Bantuan">
                    <HelpCircle size={16} strokeWidth={1.75} />
                </button>
                <button className="icon-btn" title="Notifikasi">
                    <Bell size={16} strokeWidth={1.75} />
                    <span className="dot" />
                </button>
                <div style={{ width: 1, height: 24, background: 'var(--border)', margin: '0 6px' }} />
                {title ? (
                    <span className="tag green">{title}</span>
                ) : (
                    <span className="tag green">Sandbox</span>
                )}
            </div>
        </header>
    );
}

/* --------------------------------------------------------------------
   AppLayout
   -------------------------------------------------------------------- */
export default function AppLayout({ title, children, alertCount = 0 }) {
    const { auth, flash } = usePage().props;
    const user = auth?.user;

    // Derive breadcrumb segments from pathname
    const path = typeof window !== 'undefined' ? window.location.pathname : '/';
    const segments = path.split('/').filter(Boolean);
    const breadcrumbs = segments.length === 0
        ? [{ label: 'Dashboard', href: '/' }]
        : segments.map((seg, i) => ({
            label: seg.charAt(0).toUpperCase() + seg.slice(1),
            href: '/' + segments.slice(0, i + 1).join('/'),
        }));

    function logout() {
        try {
            router.post(route('logout'));
        } catch {
            router.post('/logout');
        }
    }

    return (
        <div className="app">
            <Sidebar alertCount={alertCount} user={user} onLogout={logout} />
            <Topbar title={title} breadcrumbs={breadcrumbs} />
            <main className="main">
                <div className="main-inner">
                    {children}
                </div>
            </main>
            <ToastStack flash={flash} />
        </div>
    );
}
