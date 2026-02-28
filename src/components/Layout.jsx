import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Github, ChevronDown, Menu, X, Zap } from 'lucide-react';
import { tools, categories, getToolsByCategory } from '../lib/tools';

function ToolsMegaMenu({ isOpen, onClose }) {
    const ref = useRef(null);
    const location = useLocation();
    const grouped = getToolsByCategory();

    useEffect(() => {
        function handleClick(e) { if (ref.current && !ref.current.contains(e.target)) onClose(); }
        if (isOpen) document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [isOpen, onClose]);

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            <button
                onClick={onClose}
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
                Tools
                <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={14} />
                </motion.span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        style={{
                            position: 'absolute', top: 'calc(100% + 10px)', left: '50%',
                            transform: 'translateX(-50%)',
                            background: 'rgba(10,10,30,0.97)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            backdropFilter: 'blur(24px)',
                            borderRadius: '20px',
                            padding: '16px',
                            width: '520px',
                            zIndex: 200,
                            boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '12px',
                        }}
                    >
                        {Object.entries(grouped).map(([catId, catTools]) => {
                            const cat = categories[catId];
                            return (
                                <div key={catId}>
                                    {/* Category header */}
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: 8,
                                        padding: '4px 10px 10px',
                                        borderBottom: `1px solid ${cat.color}22`,
                                        marginBottom: 6,
                                    }}>
                                        <span style={{ fontSize: '0.95rem' }}>{cat.emoji}</span>
                                        <span style={{
                                            fontSize: '0.72rem', fontWeight: 800,
                                            letterSpacing: '0.1em', textTransform: 'uppercase',
                                            color: cat.color,
                                        }}>{cat.label}</span>
                                    </div>
                                    {/* Tool links */}
                                    {catTools.map(tool => {
                                        const active = location.pathname === tool.path;
                                        return (
                                            <Link
                                                key={tool.path}
                                                to={tool.path}
                                                onClick={onClose}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: 10,
                                                    padding: '9px 10px', borderRadius: '10px',
                                                    textDecoration: 'none',
                                                    background: active ? `${tool.color}18` : 'transparent',
                                                    transition: 'background 0.15s',
                                                    marginBottom: 2,
                                                }}
                                                onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                                                onMouseLeave={e => { if (!active) e.currentTarget.style.background = active ? `${tool.color}18` : 'transparent'; }}
                                            >
                                                <span style={{ fontSize: '1.1rem', width: 24, textAlign: 'center', flexShrink: 0 }}>{tool.emoji}</span>
                                                <div style={{ minWidth: 0 }}>
                                                    <div style={{
                                                        fontSize: '0.85rem', fontWeight: 600,
                                                        color: active ? tool.color : '#F1F0FF',
                                                        display: 'flex', alignItems: 'center', gap: 6,
                                                    }}>
                                                        {tool.name}
                                                        {active && <span style={{ width: 5, height: 5, borderRadius: '50%', background: tool.color, flexShrink: 0, display: 'inline-block' }} />}
                                                    </div>
                                                    <div style={{ fontSize: '0.72rem', color: 'rgba(241,240,255,0.4)', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tool.desc}</div>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function Layout({ children }) {
    const [megaOpen, setMegaOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();
    const grouped = getToolsByCategory();

    // Close menus on navigation
    useEffect(() => {
        setMegaOpen(false);
        setMobileOpen(false);
    }, [location.pathname]);

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

                {/* Desktop nav — single Tools mega-menu */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="hidden-mobile">
                    <ToolsMegaMenu isOpen={megaOpen} onClose={() => setMegaOpen(p => !p)} />
                </div>

                {/* Right side */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <motion.a
                        href="https://github.com/Manichandra438/ConvertMaster"
                        target="_blank" rel="noopener noreferrer"
                        whileHover={{ scale: 1.1 }}
                        style={{ color: 'rgba(241,240,255,0.6)', display: 'flex', alignItems: 'center' }}
                        title="View on GitHub"
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
                            borderBottom: '1px solid rgba(255,255,255,0.08)',
                            backdropFilter: 'blur(20px)',
                            padding: '12px 16px 20px',
                            maxHeight: 'calc(100vh - 64px)',
                            overflowY: 'auto',
                        }}
                    >
                        {Object.entries(grouped).map(([catId, catTools]) => {
                            const cat = categories[catId];
                            return (
                                <div key={catId} style={{ marginBottom: 16 }}>
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: 6,
                                        fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.1em',
                                        textTransform: 'uppercase', color: cat.color,
                                        padding: '8px 12px 6px',
                                    }}>
                                        {cat.emoji} {cat.label}
                                    </div>
                                    {catTools.map(tool => (
                                        <Link key={tool.path} to={tool.path} onClick={() => setMobileOpen(false)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: 12,
                                                padding: '10px 12px', borderRadius: '10px',
                                                textDecoration: 'none',
                                                color: location.pathname === tool.path ? tool.color : '#F1F0FF',
                                                background: location.pathname === tool.path ? `${tool.color}12` : 'transparent',
                                            }}>
                                            <span>{tool.emoji}</span>
                                            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{tool.name}</span>
                                        </Link>
                                    ))}
                                </div>
                            );
                        })}
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
