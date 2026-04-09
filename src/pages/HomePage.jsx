import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronRight, ArrowRight } from 'lucide-react';
import { tools, categories, getToolsByCategory } from '../lib/tools';

const CATEGORY_ICONS = {
    'text-data':   '⌨️',
    'image-files': '🖼️',
};

function ToolRow({ tool }) {
    const navigate = useNavigate();
    return (
        <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate(tool.path)}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 16px',
                cursor: 'pointer',
                borderBottom: '1px solid var(--border)',
                transition: 'background 0.1s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-bg)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
            <span style={{ fontSize: '18px', flexShrink: 0, width: 24, textAlign: 'center' }}>{tool.emoji}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-bright)' }}>{tool.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: 1 }}>{tool.desc}</div>
            </div>
            <ArrowRight size={13} style={{ color: 'var(--text-dim)', flexShrink: 0 }} />
        </motion.div>
    );
}

function CategorySection({ catId, catTools }) {
    const cat = categories[catId];
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div style={{ marginBottom: 1 }}>
            {/* Section header */}
            <button
                onClick={() => setCollapsed(p => !p)}
                style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 16px',
                    background: 'var(--sidebar-bg)',
                    border: 'none',
                    borderBottom: '1px solid var(--border)',
                    cursor: 'pointer',
                    color: 'var(--text)',
                    fontSize: '12px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.07em',
                    textAlign: 'left',
                }}
            >
                {collapsed
                    ? <ChevronRight size={13} style={{ color: 'var(--text-dim)' }} />
                    : <ChevronDown size={13} style={{ color: 'var(--text-dim)' }} />
                }
                <span style={{ fontSize: '14px' }}>{CATEGORY_ICONS[catId]}</span>
                {cat.label}
                <span style={{
                    marginLeft: 'auto',
                    fontSize: '11px',
                    fontWeight: 400,
                    color: 'var(--text-dim)',
                    textTransform: 'none',
                    letterSpacing: 0,
                }}>
                    {catTools.length} tools
                </span>
            </button>

            {!collapsed && catTools.map((tool, i) => (
                <motion.div
                    key={tool.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                >
                    <ToolRow tool={tool} />
                </motion.div>
            ))}
        </div>
    );
}

export default function HomePage() {
    const grouped = getToolsByCategory();

    return (
        <div style={{ maxWidth: 700, margin: '0 auto', padding: '24px 24px 60px' }}>
            {/* Welcome header */}
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                style={{ marginBottom: 28 }}
            >
                {/* Breadcrumb */}
                <div style={{
                    fontSize: '11px',
                    color: 'var(--text-dim)',
                    marginBottom: 16,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                }}>
                    <span>ConvertMaster</span>
                    <span>/</span>
                    <span style={{ color: 'var(--text)' }}>Welcome</span>
                </div>

                <h1 style={{
                    fontSize: '22px',
                    fontWeight: 600,
                    color: 'var(--text-bright)',
                    marginBottom: 6,
                    letterSpacing: '-0.01em',
                }}>
                    Welcome to ConvertMaster
                </h1>
                <p style={{ fontSize: '13px', color: 'var(--text-dim)', lineHeight: 1.6, maxWidth: 520 }}>
                    A collection of {tools.length} developer tools for encoding, converting, and transforming data.
                    Everything runs locally in your browser — no files are uploaded.
                </p>

                {/* Stats row */}
                <div style={{
                    display: 'flex',
                    gap: 20,
                    marginTop: 16,
                    padding: '12px 16px',
                    background: 'var(--sidebar-bg)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    flexWrap: 'wrap',
                }}>
                    {[
                        { value: tools.length.toString(), label: 'tools' },
                        { value: '100%', label: 'browser-based' },
                        { value: '0', label: 'files uploaded' },
                        { value: Object.keys(categories).length.toString(), label: 'categories' },
                    ].map(({ value, label }) => (
                        <div key={label} style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                            <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--accent)' }}>{value}</span>
                            <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>{label}</span>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Tool sections */}
            <div style={{
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                overflow: 'hidden',
                background: 'var(--bg)',
            }}>
                {Object.entries(grouped).map(([catId, catTools]) => (
                    <CategorySection key={catId} catId={catId} catTools={catTools} />
                ))}
            </div>

            {/* Footer */}
            <div style={{
                marginTop: 24,
                fontSize: '11px',
                color: 'var(--text-dim)',
                textAlign: 'center',
            }}>
                ⚡ ConvertMaster — All processing happens locally in your browser
            </div>
        </div>
    );
}
