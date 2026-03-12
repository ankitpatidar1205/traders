import React, { useState } from 'react';
import { Contact } from 'lucide-react';
import mountainBg from '../assets/wallpapers/mountain-peak.jpg';

const LoginPage = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('admin');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        if (!username.trim()) { setError('Username is required.'); return; }
        if (!password.trim()) { setError('Password is required.'); return; }
        onLogin(username, password, role);
    };

    return (
        /* ── Root: full-screen ── */
        <div style={{
            position: 'relative',
            minHeight: '100vh',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
            overflow: 'hidden',
        }}>

            {/* ── Mountain background image ── */}
            <img
                src={mountainBg}
                alt=""
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center center',
                    zIndex: 0,
                    display: 'block',
                }}
            />

            {/* ── Subtle dark overlay so card pops ── */}
            <div style={{
                position: 'absolute', inset: 0, zIndex: 1,
                background: 'rgba(0, 0, 0, 0.35)',
            }} />

            {/* ── Card wrapper — paddingTop = half of green header height ── */}
            <div style={{
                position: 'relative', zIndex: 2,
                width: '420px',
                maxWidth: 'calc(100vw - 40px)',
                paddingTop: '36px',
            }}>
                <form onSubmit={handleSubmit} autoComplete="off">

                    {/* ── Floating green header — centered ON the card top border ── */}
                    <div style={{
                        position: 'absolute',
                        top: 0,         /* wrapper paddingTop=36 means this is centered on card border */
                        left: '16px',
                        right: '16px',
                        zIndex: 3,
                        background: 'linear-gradient(135deg, #1e8c5c 0%, #3db85a 100%)',
                        borderRadius: '8px',
                        padding: '18px 22px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        boxShadow: '0 6px 24px rgba(30,140,92,0.55), 0 2px 10px rgba(0,0,0,0.30)',
                    }}>
                        <Contact style={{ width: 26, height: 26, color: '#fff', flexShrink: 0 }} />
                        <span style={{
                            color: '#fff',
                            fontSize: '15px',
                            fontWeight: '700',
                            letterSpacing: '0.03em',
                        }}>
                            Traders — Sign In
                        </span>
                    </div>

                    {/* ── Card — dark glass, starts below the floating header ── */}
                    <div style={{
                        background: 'rgba(15, 23, 48, 0.82)',
                        backdropFilter: 'blur(16px)',
                        WebkitBackdropFilter: 'blur(16px)',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.10)',
                        boxShadow: '0 20px 70px rgba(0,0,0,0.60)',
                        overflow: 'visible',
                    }}>

                        {/* ── Form body — top padding = remaining half of header ── */}
                        <div style={{ padding: '42px 26px 28px 26px' }}>

                            {/* Role selector */}
                            <div style={{ marginBottom: '22px' }}>
                                <label style={{
                                    display: 'block',
                                    color: '#94a3b8',
                                    fontSize: '11px',
                                    fontWeight: '700',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.06em',
                                    marginBottom: '8px',
                                }}>
                                    User Role
                                </label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {[
                                        { value: 'superadmin', label: 'Super Admin', color: '#f59e0b' },
                                        { value: 'admin', label: 'Admin', color: '#4caf50' },
                                        { value: 'broker', label: 'Broker', color: '#3b82f6' },
                                    ].map(r => (
                                        <button
                                            key={r.value}
                                            type="button"
                                            onClick={() => setRole(r.value)}
                                            style={{
                                                flex: 1,
                                                padding: '7px 4px',
                                                borderRadius: '5px',
                                                fontSize: '10px',
                                                fontWeight: '700',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.03em',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                background: role === r.value ? r.color : 'rgba(255,255,255,0.05)',
                                                color: role === r.value ? '#fff' : '#94a3b8',
                                                border: `1px solid ${role === r.value ? r.color : 'rgba(255,255,255,0.10)'}`,
                                            }}
                                        >
                                            {r.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Error */}
                            {error && (
                                <div style={{
                                    marginBottom: '14px',
                                    padding: '8px 12px',
                                    background: 'rgba(239,68,68,0.15)',
                                    borderRadius: '5px',
                                    border: '1px solid rgba(239,68,68,0.30)',
                                    color: '#f87171',
                                    fontSize: '12px',
                                }}>
                                    {error}
                                </div>
                            )}

                            {/* Username & Password — exactly like screenshot: label left, underline input right */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', marginBottom: '28px' }}>
                                {[
                                    { label: 'Username', type: 'text', value: username, setter: setUsername },
                                    { label: 'Password', type: 'password', value: password, setter: setPassword },
                                ].map(f => (
                                    <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        {/* Label */}
                                        <label style={{
                                            color: '#94a3b8',
                                            fontSize: '13px',
                                            fontWeight: '400',
                                            width: '76px',
                                            flexShrink: 0,
                                            letterSpacing: '0.01em',
                                        }}>
                                            {f.label}
                                        </label>
                                        {/* Underline input */}
                                        <input
                                            type={f.type}
                                            value={f.value}
                                            onChange={e => f.setter(e.target.value)}
                                            autoComplete="new-password"
                                            style={{
                                                flex: 1,
                                                background: 'transparent',
                                                border: 'none',
                                                borderBottom: '1px solid rgba(255,255,255,0.22)',
                                                color: '#fff',
                                                fontSize: '14px',
                                                padding: '4px 0 6px 0',
                                                outline: 'none',
                                                transition: 'border-color 0.2s',
                                            }}
                                            onFocus={e => e.target.style.borderBottomColor = '#4caf50'}
                                            onBlur={e => e.target.style.borderBottomColor = 'rgba(255,255,255,0.22)'}
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* SIGN IN button — centered, full width */}
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                <button
                                    type="submit"
                                    style={{
                                        width: '100%',
                                        background: 'linear-gradient(135deg, #288c6c, #4caf50)',
                                        boxShadow: '0 4px 15px rgba(76,175,80,0.40)',
                                        color: '#fff',
                                        fontWeight: '700',
                                        fontSize: '12px',
                                        letterSpacing: '0.12em',
                                        textTransform: 'uppercase',
                                        padding: '13px 32px',
                                        borderRadius: '6px',
                                        border: 'none',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        fontFamily: 'inherit',
                                        textAlign: 'center',
                                    }}
                                    onMouseOver={e => {
                                        e.currentTarget.style.opacity = '0.88';
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(76,175,80,0.55)';
                                    }}
                                    onMouseOut={e => {
                                        e.currentTarget.style.opacity = '1';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(76,175,80,0.40)';
                                    }}
                                >
                                    Sign In
                                </button>
                            </div>
                        </div>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default LoginPage;
