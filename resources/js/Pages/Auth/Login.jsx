import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Eye, EyeOff, LogIn } from 'lucide-react';

/**
 * AML/CFT login screen — restyled to match reference design system.
 * The form action and SSO anchor are unchanged.
 */
export default function Login({ portal_sso_url, app_name, errors = {} }) {
    const [showPassword, setShowPassword] = useState(false);
    const form = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        form.post(route('login.post'));
    };

    return (
        <>
            <Head title="Masuk" />
            <div
                style={{
                    minHeight: '100vh',
                    background: 'var(--bg)',
                    color: 'var(--fg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '32px 16px',
                    fontFamily: 'var(--font-sans)',
                }}
            >
                <div style={{ width: '100%', maxWidth: 380 }}>
                    {/* Brand header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                        <div className="brand-mark" style={{ width: 36, height: 36, fontSize: 12 }}>AC</div>
                        <div className="brand-text">
                            <strong style={{ fontSize: 14 }}>AML / CFT</strong>
                            <span>Divisi Kepatuhan</span>
                        </div>
                    </div>

                    <div className="card" style={{ padding: 0 }}>
                        <div className="card-head" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
                            <h3 style={{ fontSize: 15 }}>Masuk ke Aplikasi</h3>
                            <span className="sub">Aplikasi Kepatuhan APU/PPT &middot; Pegadaian</span>
                        </div>

                        <div className="card-body" style={{ padding: 18 }}>
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                <div>
                                    <label
                                        htmlFor="email"
                                        style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--fg-2)', marginBottom: 6 }}
                                    >
                                        Email
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        required
                                        autoFocus
                                        value={form.data.email}
                                        onChange={(e) => form.setData('email', e.target.value)}
                                        className="input"
                                        placeholder="nama@pegadaian.co.id"
                                    />
                                    {errors.email && (
                                        <p style={{ color: 'var(--red)', fontSize: 11.5, marginTop: 4 }}>
                                            {errors.email}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label
                                        htmlFor="password"
                                        style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--fg-2)', marginBottom: 6 }}
                                    >
                                        Password
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            value={form.data.password}
                                            onChange={(e) => form.setData('password', e.target.value)}
                                            className="input"
                                            style={{ paddingRight: 36 }}
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((s) => !s)}
                                            aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                                            className="icon-btn"
                                            style={{
                                                position: 'absolute',
                                                top: '50%',
                                                right: 4,
                                                transform: 'translateY(-50%)',
                                                width: 28,
                                                height: 28,
                                            }}
                                        >
                                            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p style={{ color: 'var(--red)', fontSize: 11.5, marginTop: 4 }}>
                                            {errors.password}
                                        </p>
                                    )}
                                </div>

                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        fontSize: 12,
                                    }}
                                >
                                    <label
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 6,
                                            color: 'var(--fg-2)',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={form.data.remember}
                                            onChange={(e) => form.setData('remember', e.target.checked)}
                                            style={{ accentColor: 'var(--primary)' }}
                                        />
                                        Ingat saya
                                    </label>
                                    <a
                                        href="#"
                                        style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}
                                    >
                                        Lupa password?
                                    </a>
                                </div>

                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="btn primary"
                                    style={{
                                        width: '100%',
                                        justifyContent: 'center',
                                        padding: '9px 12px',
                                        fontSize: 13,
                                        fontWeight: 600,
                                    }}
                                >
                                    {form.processing ? 'Memproses…' : 'Masuk'}
                                </button>
                            </form>

                            {/* Divider */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '16px 0' }}>
                                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                                <span style={{ fontSize: 11, color: 'var(--fg-3)' }}>atau</span>
                                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                            </div>

                            {/* Portal SSO */}
                            <a
                                href={portal_sso_url}
                                className="btn"
                                style={{
                                    width: '100%',
                                    justifyContent: 'center',
                                    padding: '9px 12px',
                                    fontSize: 13,
                                }}
                            >
                                <LogIn size={14} strokeWidth={1.75} />
                                Login via Portal SSO
                            </a>
                        </div>
                    </div>

                    <p
                        style={{
                            marginTop: 18,
                            fontSize: 11,
                            color: 'var(--fg-3)',
                            textAlign: 'center',
                        }}
                    >
                        &copy; 2026 PT Pegadaian &middot; Aplikasi Kepatuhan {app_name ? `· ${app_name}` : ''}
                    </p>
                </div>
            </div>
        </>
    );
}
