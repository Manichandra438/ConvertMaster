import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Github, Menu, X } from 'lucide-react';
import { tools, categories, getToolsByCategory } from '../lib/tools';

function SideDrawer({ isOpen, onClose }) {
    const location = useLocation();
    const grouped = getToolsByCategory();

    // Close on route change
    useEffect(() => { onClose(); }, [location.pathname]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                        style={{
                            position: 'fixed', inset: 0, zIndex: 150,
                            background: 'rgba(0,0,0,0.55)',
                            backdropFilter: 'blur(3px)',
                        }}
                    />

                    {/* Drawer panel */}
                    <motion.div
                        key="drawer"
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                        style={{
                            position: 'fixed', top: 0, right: 0, bottom: 0,
                            width: 'clamp(260px, 80vw, 320px)',
                            zIndex: 200,
                            background: 'rgba(8,8,28,0.97)',
                            borderLeft: '1px solid rgba(255,255,255,0.09)',
                            backdropFilter: 'blur(32px)',
                            WebkitBackdropFilter: 'blur(32px)',
                            boxShadow: '-24px 0 80px rgba(0,0,0,0.6)',
                            display: 'flex',
                            flexDirection: 'column',
                            overflowY: 'auto',
                        }}
                    >
                        {/* Drawer header */}
                        <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '20px 20px 16px',
                            borderBottom: '1px solid rgba(255,255,255,0.07)',
                            flexShrink: 0,
                        }}>
                            <span style={{
                                fontFamily: 'Syne, sans-serif', fontSize: '0.9rem', fontWeight: 800,
                                color: 'rgba(241,240,255,0.5)', letterSpacing: '0.08em', textTransform: 'uppercase',
                            }}>All Tools</span>
                            <motion.button
                                whileTap={{ scale: 0.88 }}
                                onClick={onClose}
                                style={{
                                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '50%', width: 32, height: 32,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', color: 'rgba(241,240,255,0.7)',
                                }}
                            >
                                <X size={15} />
                            </motion.button>
                        </div>

                        {/* Tool groups */}
                        <div style={{ padding: '12px 12px', flex: 1 }}>
                            {Object.entries(grouped).map(([catId, catTools], catIdx) => {
                                const cat = categories[catId];
                                return (
                                    <div key={catId} style={{ marginBottom: catIdx < Object.keys(grouped).length - 1 ? 24 : 0 }}>
                                        {/* Category label */}
                                        <div style={{
                                            display: 'flex', alignItems: 'center', gap: 7,
                                            padding: '6px 8px 10px',
                                            borderBottom: `1px solid ${cat.color}22`,
                                            marginBottom: 4,
                                        }}>
                                            <span style={{ fontSize: '1rem' }}>{cat.emoji}</span>
                                            <span style={{
                                                fontSize: '0.7rem', fontWeight: 800,
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
                                                    style={{
                                                        display: 'flex', alignItems: 'center', gap: 12,
                                                        padding: '10px 10px', borderRadius: '12px',
                                                        textDecoration: 'none', marginBottom: 2,
                                                        background: active ? `${tool.color}18` : 'transparent',
                                                        borderLeft: active ? `3px solid ${tool.color}` : '3px solid transparent',
                                                        transition: 'background 0.15s',
                                                    }}
                                                    onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                                                    onMouseLeave={e => { e.currentTarget.style.background = active ? `${tool.color}18` : 'transparent'; }}
                                                >
                                                    <span style={{ fontSize: '1.2rem', width: 28, textAlign: 'center', flexShrink: 0 }}>{tool.emoji}</span>
                                                    <div style={{ minWidth: 0 }}>
                                                        <div style={{
                                                            fontSize: '0.875rem', fontWeight: 600,
                                                            color: active ? tool.color : '#F1F0FF',
                                                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                                        }}>{tool.name}</div>
                                                        <div style={{
                                                            fontSize: '0.72rem', color: 'rgba(241,240,255,0.4)',
                                                            marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                                        }}>{tool.desc}</div>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Drawer footer */}
                        <div style={{
                            padding: '16px 20px',
                            borderTop: '1px solid rgba(255,255,255,0.07)',
                            flexShrink: 0,
                        }}>
                            <a
                                href="https://github.com/Manichandra438"
                                target="_blank" rel="noopener noreferrer"
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 10,
                                    color: 'rgba(241,240,255,0.4)', textDecoration: 'none',
                                    fontSize: '0.8rem', fontWeight: 500,
                                    transition: 'color 0.15s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.color = '#F1F0FF'}
                                onMouseLeave={e => e.currentTarget.style.color = 'rgba(241,240,255,0.4)'}
                            >
                                <Github size={16} />
                                View on GitHub
                            </a>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

export default function Layout({ children }) {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const location = useLocation();

    return (
        <div style={{ minHeight: '100vh', position: 'relative' }}>
            {/* Animated background mesh */}
            <div className="bg-mesh"><div className="bg-blob3" /></div>

            {/* Top Navbar */}
            <nav style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 clamp(20px, 4vw, 48px)', height: '64px',
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

                {/* Right side: GitHub + burger */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <motion.a
                        href="https://github.com/Manichandra438"
                        target="_blank" rel="noopener noreferrer"
                        whileHover={{ scale: 1.1 }}
                        style={{ color: 'rgba(241,240,255,0.5)', display: 'flex', alignItems: 'center', padding: 6 }}
                        title="View GitHub"
                    >
                        <Github size={19} />
                    </motion.a>

                    <motion.button
                        whileTap={{ scale: 0.88 }}
                        onClick={() => setDrawerOpen(p => !p)}
                        style={{
                            background: drawerOpen ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.06)',
                            border: `1px solid ${drawerOpen ? 'rgba(139,92,246,0.4)' : 'rgba(255,255,255,0.1)'}`,
                            borderRadius: '10px',
                            width: 40, height: 40,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer',
                            color: drawerOpen ? '#8B5CF6' : 'rgba(241,240,255,0.7)',
                            transition: 'all 0.2s',
                        }}
                        aria-label="Toggle navigation"
                    >
                        <AnimatePresence mode="wait" initial={false}>
                            <motion.span
                                key={drawerOpen ? 'close' : 'open'}
                                initial={{ rotate: -90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: 90, opacity: 0 }}
                                transition={{ duration: 0.15 }}
                                style={{ display: 'flex', alignItems: 'center' }}
                            >
                                {drawerOpen ? <X size={18} /> : <Menu size={18} />}
                            </motion.span>
                        </AnimatePresence>
                    </motion.button>
                </div>
            </nav>

            {/* Side Drawer */}
            <SideDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />

            {/* Page content */}
            <main style={{ position: 'relative', zIndex: 1, paddingTop: '64px', minHeight: '100vh' }}>
                <motion.div key={location.pathname} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
                    {children}
                </motion.div>
            </main>
        </div>
    );
}
