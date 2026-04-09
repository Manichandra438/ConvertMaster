import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Github, Menu, X, ChevronDown, ChevronRight } from 'lucide-react';
import { tools, categories, getToolsByCategory } from '../lib/tools';
import WalkingCharacters from './WalkingCharacters';
import { config } from '../config';

const CATEGORY_ICONS = {
    'text-data':    '⌨️',
    'image-files':  '🖼️',
};

function Sidebar({ onClose, isMobile }) {
    const location = useLocation();
    const grouped = getToolsByCategory();
    const [collapsed, setCollapsed] = useState({});

    const toggleCategory = (catId) => {
        setCollapsed(prev => ({ ...prev, [catId]: !prev[catId] }));
    };

    return (
        <div style={{
            width: isMobile ? '100%' : 'var(--sidebar-width)',
            background: 'var(--sidebar-bg)',
            borderRight: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
            height: '100%',
            userSelect: 'none',
        }}>
            {/* Explorer header */}
            <div style={{
                padding: '8px 12px 6px',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--text-dim)',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0,
            }}>
                <span>Explorer</span>
                {isMobile && (
                    <button
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: '2px', display: 'flex' }}
                    >
                        <X size={14} />
                    </button>
                )}
            </div>

            {/* Tool groups */}
            <div style={{ flex: 1, paddingTop: 4 }}>
                {Object.entries(grouped).map(([catId, catTools]) => {
                    const cat = categories[catId];
                    const isCollapsed = collapsed[catId];
                    return (
                        <div key={catId}>
                            {/* Category header — clickable to collapse */}
                            <button
                                onClick={() => toggleCategory(catId)}
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 4,
                                    padding: '4px 8px',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: 'var(--text-dim)',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.07em',
                                    textAlign: 'left',
                                }}
                                onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}
                            >
                                {isCollapsed
                                    ? <ChevronRight size={12} style={{ flexShrink: 0 }} />
                                    : <ChevronDown size={12} style={{ flexShrink: 0 }} />
                                }
                                <span style={{ fontSize: '12px', marginRight: 2 }}>{CATEGORY_ICONS[catId]}</span>
                                {cat.label}
                            </button>

                            {/* Tool links */}
                            {!isCollapsed && catTools.map(tool => {
                                const active = location.pathname === tool.path;
                                return (
                                    <Link
                                        key={tool.path}
                                        to={tool.path}
                                        onClick={isMobile ? onClose : undefined}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 8,
                                            padding: '5px 12px 5px 28px',
                                            textDecoration: 'none',
                                            fontSize: '13px',
                                            color: active ? 'var(--text-bright)' : 'var(--text)',
                                            background: active ? 'var(--active-bg)' : 'transparent',
                                            borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent',
                                            transition: 'background 0.1s',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                        }}
                                        onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--hover-bg)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = active ? 'var(--active-bg)' : 'transparent'; }}
                                    >
                                        <span style={{ fontSize: '14px', flexShrink: 0 }}>{tool.emoji}</span>
                                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{tool.name}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    );
                })}
            </div>

            {/* Bottom: GitHub link */}
            <div style={{
                padding: '10px 12px',
                borderTop: '1px solid var(--border)',
                flexShrink: 0,
            }}>
                <a
                    href="https://github.com/Manichandra438"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        color: 'var(--text-dim)',
                        textDecoration: 'none',
                        fontSize: '12px',
                        padding: '5px 6px',
                        borderRadius: '3px',
                        transition: 'background 0.1s, color 0.1s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--hover-bg)'; e.currentTarget.style.color = 'var(--text)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-dim)'; }}
                >
                    <Github size={14} />
                    GitHub
                </a>
            </div>
        </div>
    );
}

export default function Layout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [charsEnabled, setCharsEnabled] = useState(
        () => config.walkingCharacters.enabled && localStorage.getItem('walkingChars') !== 'false'
    );
    const location = useLocation();

    const toggleChars = () => {
        setCharsEnabled(prev => {
            const next = !prev;
            localStorage.setItem('walkingChars', next);
            return next;
        });
    };

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            overflow: 'hidden',
            background: 'var(--bg)',
        }}>
            {/* Title Bar */}
            <div style={{
                height: 'var(--titlebar-height)',
                background: 'var(--titlebar-bg)',
                borderBottom: '1px solid #1a1a1a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 12px',
                flexShrink: 0,
                zIndex: 50,
            }}>
                {/* Left: hamburger (mobile) + logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {isMobile && (
                        <button
                            onClick={() => setSidebarOpen(p => !p)}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'var(--text-dim)',
                                display: 'flex',
                                alignItems: 'center',
                                padding: '4px',
                                borderRadius: '3px',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-bg)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'none'}
                        >
                            {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
                        </button>
                    )}
                    <Link
                        to="/"
                        style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                        <span style={{ fontSize: '14px' }}>⚡</span>
                        <span style={{
                            fontSize: '13px',
                            fontWeight: 600,
                            color: 'var(--text)',
                            letterSpacing: '0.01em',
                        }}>
                            ConvertMaster
                        </span>
                    </Link>
                </div>

                {/* Right: GitHub */}
                <a
                    href="https://github.com/Manichandra438"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        color: 'var(--text-dim)',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '4px 6px',
                        borderRadius: '3px',
                        transition: 'color 0.1s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}
                    title="View on GitHub"
                >
                    <Github size={15} />
                </a>
            </div>

            {/* App Body */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
                {/* Sidebar — always visible on desktop, overlay on mobile */}
                {!isMobile ? (
                    <Sidebar isMobile={false} onClose={() => {}} />
                ) : (
                    <>
                        {sidebarOpen && (
                            <>
                                {/* Backdrop */}
                                <div
                                    onClick={() => setSidebarOpen(false)}
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                        background: 'rgba(0,0,0,0.5)',
                                        zIndex: 40,
                                    }}
                                />
                                {/* Mobile sidebar */}
                                <motion.div
                                    initial={{ x: '-100%' }}
                                    animate={{ x: 0 }}
                                    exit={{ x: '-100%' }}
                                    transition={{ type: 'tween', duration: 0.2 }}
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        bottom: 0,
                                        width: 'var(--sidebar-width)',
                                        zIndex: 50,
                                    }}
                                >
                                    <Sidebar isMobile={true} onClose={() => setSidebarOpen(false)} />
                                </motion.div>
                            </>
                        )}
                    </>
                )}

                {/* Main content */}
                <main style={{
                    flex: 1,
                    overflowY: 'auto',
                    background: 'var(--bg)',
                    position: 'relative',
                }}>
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {children}
                    </motion.div>
                </main>
            </div>

            {/* Status Bar */}
            <div style={{
                height: 'var(--statusbar-height)',
                background: 'var(--statusbar-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 10px',
                flexShrink: 0,
                fontSize: '11px',
                color: 'rgba(255,255,255,0.9)',
                gap: 16,
            }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ec9b0', display: 'inline-block' }} />
                    {tools.length} tools available
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ opacity: 0.8 }}>100% browser-based · no uploads</span>
                    {config.walkingCharacters.enabled && (
                        <button
                            onClick={toggleChars}
                            title={charsEnabled ? 'Hide walking characters' : 'Show walking characters'}
                            style={{
                                background: charsEnabled ? 'rgba(255,255,255,0.18)' : 'transparent',
                                border: 'none',
                                borderRadius: 3,
                                color: 'rgba(255,255,255,0.9)',
                                cursor: 'pointer',
                                fontSize: 11,
                                padding: '1px 6px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                            }}
                        >
                            {charsEnabled ? '🐱🤖 on' : '🐱🤖 off'}
                        </button>
                    )}
                </span>
            </div>

            {/* Walking characters — toggled via status bar button */}
            {charsEnabled && <WalkingCharacters />}
        </div>
    );
}
