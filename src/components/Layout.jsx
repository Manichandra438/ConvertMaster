import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Github, ChevronDown, Menu, X } from 'lucide-react';

const devTools = [
    { path: '/base64',    name: 'Base64',          emoji: '🔢', desc: 'Encode / decode text & files' },
    { path: '/url',       name: 'URL Encoder',     emoji: '🔗', desc: 'Encode / decode URLs' },
    { path: '/json',      name: 'JSON Formatter',  emoji: '{ }', desc: 'Format & validate JSON' },
    { path: '/jwt',       name: 'JWT Decoder',     emoji: '🔑', desc: 'Decode JWT tokens' },
    { path: '/html',      name: 'HTML Entities',   emoji: '🏷️', desc: 'Encode HTML entities' },
];

const fileTools = [
    { path: '/image-converter',  name: 'Image Converter',  emoji: '🖼️', desc: 'Convert between image formats' },
    { path: '/pdf-tools',        name: 'PDF Tools',         emoji: '📄', desc: 'Convert, merge & compress PDFs' },
    { path: '/resize-compress',  name: 'Resize & Compress', emoji: '📐', desc: 'Resize or compress images' },
];

function NavDropdown({ label, items, isOpen, onToggle, onClose }) {
    const ref = useRef(null);
    const location = useLocation();

    useEffect(() => {
        function handleClick(e) { if (ref.current && !ref.current.contains(e.target)) onClose(); }
        if (isOpen) document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [isOpen, onClose]);

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            <button
                onClick={onToggle}
                style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    border: 'none', cursor: 'pointer',
                    color: isOpen ? '#F1F0FF' : 'rgba(241,240,255,0.6)',
                    fontSize: '0.88rem', fontWeight: 500, padding: '8px 14px',
                    borderRadius: '50px', fontFamily: 'inherit',
                    transition: 'color 0.2s, background 0.2s',
                    background: isOpen ? 'rgba(255,255,255,0.06)' : 'none',
                }}
            >
                {label}
                <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={14} />
                </motion.span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        style={{
                            position: 'absolute', top: 'calc(100% + 10px)', left: '50%',
                            transform: 'translateX(-50%)',
                            background: 'rgba(10,10,30,0.95)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            backdropFilter: 'blur(24px)',
                            borderRadius: '16px',
                            padding: '8px',
                            minWidth: '260px',
                            zIndex: 200,
                            boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
                        }}
                    >
                        {items.map((item) => {
                            const active = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={onClose}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 12,
                                        padding: '10px 14px', borderRadius: '10px',
                                        textDecoration: 'none',
                                        background: active ? 'rgba(139,92,246,0.12)' : 'transparent',
                                        transition: 'background 0.15s',
                                    }}
                                    onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                                    onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                                >
                                    <span style={{ fontSize: '1.2rem', width: 28, textAlign: 'center' }}>{item.emoji}</span>
                                    <div>
                                        <div style={{
                                            fontSize: '0.88rem', fontWeight: 600,
                                            color: active ? '#8B5CF6' : '#F1F0FF',
                                        }}>{item.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'rgba(241,240,255,0.45)', marginTop: 1 }}>{item.desc}</div>
                                    </div>
                                    {active && <span style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: '#8B5CF6', flexShrink: 0 }} />}
                                </Link>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function Layout({ children }) {
    const [openMenu, setOpenMenu] = useState(null); // 'dev' | 'file' | null
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const toggle = (menu) => setOpenMenu(prev => prev === menu ? null : menu);

    return (
        <div style={{ minHeight: '100vh', position: 'relative' }}>
            {/* Animated background mesh */}
            <div className="bg-mesh"><div className="bg-blob3" /></div>

            {/* Top Navbar */}
            <nav style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 48px', height: '64px',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                background: 'rgba(6,6,26,0.7)',
                borderBottom: '1px solid rgba(255,255,255,0.07)',
            }}>
                {/* Logo */}
                <Link to="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
                    <motion.span
                        whileHover={{ scale: 1.04 }}
                        style={{
                            fontFamily: 'Syne, sans-serif', fontSize: '1.35rem', fontWeight: 800,
                            background: 'linear-gradient(135deg, #8B5CF6, #22D3EE)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                        }}
                    >
                        ⚡ ConvertMaster
                    </motion.span>
                </Link>

                {/* Desktop nav */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="hidden-mobile">
                    <NavDropdown label="Dev Tools" items={devTools} isOpen={openMenu === 'dev'} onToggle={() => toggle('dev')} onClose={() => setOpenMenu(null)} />
                    <NavDropdown label="File Tools" items={fileTools} isOpen={openMenu === 'file'} onToggle={() => toggle('file')} onClose={() => setOpenMenu(null)} />
                </div>

                {/* Right side */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <motion.a
                        href="https://github.com/Manichandra438"
                        target="_blank" rel="noopener noreferrer"
                        whileHover={{ scale: 1.1 }}
                        style={{ color: 'rgba(241,240,255,0.6)', display: 'flex', alignItems: 'center' }}
                    >
                        <Github size={20} />
                    </motion.a>
                    {/* Mobile hamburger */}
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setMobileOpen(p => !p)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(241,240,255,0.7)', display: 'none' }}
                        className="show-mobile"
                    >
                        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                    </motion.button>
                </div>
            </nav>

            {/* Mobile menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        style={{
                            position: 'fixed', top: 64, left: 0, right: 0, zIndex: 99,
                            background: 'rgba(6,6,26,0.97)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            backdropFilter: 'blur(20px)',
                            padding: '16px',
                            maxHeight: 'calc(100vh - 64px)',
                            overflowY: 'auto',
                        }}
                    >
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(241,240,255,0.4)', padding: '8px 12px 4px' }}>Dev Tools</div>
                        {devTools.map(item => (
                            <Link key={item.path} to={item.path} onClick={() => setMobileOpen(false)}
                                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: '10px', textDecoration: 'none', color: location.pathname === item.path ? '#8B5CF6' : '#F1F0FF' }}>
                                <span>{item.emoji}</span><span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{item.name}</span>
                            </Link>
                        ))}
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(241,240,255,0.4)', padding: '14px 12px 4px' }}>File Tools</div>
                        {fileTools.map(item => (
                            <Link key={item.path} to={item.path} onClick={() => setMobileOpen(false)}
                                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: '10px', textDecoration: 'none', color: location.pathname === item.path ? '#8B5CF6' : '#F1F0FF' }}>
                                <span>{item.emoji}</span><span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{item.name}</span>
                            </Link>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Page content */}
            <main style={{ position: 'relative', zIndex: 1, paddingTop: '64px', minHeight: '100vh' }}>
                <motion.div key={location.pathname} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
                    {children}
                </motion.div>
            </main>

            <style>{`
                @media (max-width: 768px) {
                    .hidden-mobile { display: none !important; }
                    .show-mobile { display: flex !important; }
                    nav { padding: 0 20px !important; }
                }
                @media (min-width: 769px) {
                    .show-mobile { display: none !important; }
                }
            `}</style>
        </div>
    );
}
