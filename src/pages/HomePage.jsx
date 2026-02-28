import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { tools, categories } from '../lib/tools';

const container = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };
const cardAnim  = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45 } } };

function ToolCard({ tool }) {
    const navigate = useNavigate();
    const cat = categories[tool.category];
    return (
        <motion.div
            variants={cardAnim}
            whileHover={{ y: -6, boxShadow: `0 24px 64px rgba(0,0,0,0.45)` }}
            onClick={() => navigate(tool.path)}
            style={{
                cursor: 'pointer',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(16px)',
                borderRadius: '20px',
                padding: '28px 24px',
                transition: 'border-color 0.3s',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = `${tool.color}55`}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
        >
            {/* Top accent line */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                background: `linear-gradient(90deg, ${tool.color}, transparent)`,
            }} />

            {/* Category badge */}
            <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: `${tool.color}18`,
                border: `1px solid ${tool.color}35`,
                borderRadius: '50px',
                padding: '3px 10px',
                fontSize: '0.68rem', fontWeight: 700,
                color: tool.color,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                marginBottom: 16,
                width: 'fit-content',
            }}>
                <span style={{ fontSize: '0.8rem' }}>{cat.emoji}</span>
                {cat.label}
            </div>

            <div style={{ fontSize: '2rem', marginBottom: 12 }}>{tool.emoji}</div>
            <h3 style={{
                fontFamily: 'Syne, sans-serif', fontSize: '1rem', fontWeight: 700,
                color: '#F1F0FF', marginBottom: 8, letterSpacing: '-0.01em',
            }}>{tool.name}</h3>
            <p style={{ fontSize: '0.82rem', color: 'rgba(241,240,255,0.5)', lineHeight: 1.5, margin: 0, flex: 1 }}>{tool.desc}</p>
            <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 6, color: tool.color, fontSize: '0.8rem', fontWeight: 600 }}>
                Open tool <span style={{ fontSize: '1rem' }}>→</span>
            </div>
        </motion.div>
    );
}

const TABS = [
    { id: 'all',          label: 'All Tools',     count: tools.length },
    { id: 'text-data',    label: 'Text & Data',   count: tools.filter(t => t.category === 'text-data').length },
    { id: 'image-files',  label: 'Image & Files', count: tools.filter(t => t.category === 'image-files').length },
];

export default function HomePage() {
    const [activeTab, setActiveTab] = useState('all');

    const filtered = activeTab === 'all'
        ? tools
        : tools.filter(t => t.category === activeTab);

    return (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '64px 24px 80px' }}>
            {/* Hero */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                style={{ textAlign: 'center', marginBottom: 64 }}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)',
                        borderRadius: 50, padding: '6px 18px', marginBottom: 28,
                        fontSize: '0.8rem', fontWeight: 600, color: '#8B5CF6', letterSpacing: '0.06em',
                    }}
                >
                    ✨ All-in-one developer toolkit
                </motion.div>

                <h1 style={{
                    fontFamily: 'Syne, sans-serif',
                    fontSize: 'clamp(2.5rem, 6vw, 4.2rem)',
                    fontWeight: 900, letterSpacing: '-0.04em',
                    lineHeight: 1.05, marginBottom: 20, color: '#F1F0FF',
                }}>
                    Convert.{' '}
                    <span style={{
                        background: 'linear-gradient(135deg, #8B5CF6, #22D3EE)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                    }}>Transform.</span>
                    <br />Create.
                </h1>

                <p style={{
                    fontSize: 'clamp(1rem, 2vw, 1.2rem)',
                    color: 'rgba(241,240,255,0.55)',
                    maxWidth: 560, margin: '0 auto 36px', lineHeight: 1.7,
                }}>
                    8 tools for developers and creators. Encode text, convert images, work with PDFs. No uploads — everything runs in your browser.
                </p>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                    {Object.entries(categories).map(([id, cat]) => (
                        <motion.button
                            key={id}
                            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                            onClick={() => setActiveTab(id)}
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: 8,
                                padding: '11px 22px', borderRadius: 50, cursor: 'pointer',
                                background: activeTab === id
                                    ? `linear-gradient(135deg, ${cat.color}, ${cat.color}aa)`
                                    : 'rgba(255,255,255,0.06)',
                                border: `1px solid ${activeTab === id ? cat.color + '44' : 'rgba(255,255,255,0.1)'}`,
                                color: activeTab === id ? '#fff' : 'rgba(241,240,255,0.75)',
                                fontWeight: 600, fontSize: '0.9rem', fontFamily: 'inherit',
                                transition: 'all 0.2s',
                            }}
                        >
                            {cat.emoji} {cat.label}
                        </motion.button>
                    ))}
                </div>
            </motion.div>

            {/* Stats */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                style={{ display: 'flex', justifyContent: 'center', gap: 48, marginBottom: 56, flexWrap: 'wrap' }}
            >
                {[['8', 'Total Tools'], ['100%', 'Browser-based'], ['0', 'Files uploaded']].map(([val, label]) => (
                    <div key={label} style={{ textAlign: 'center' }}>
                        <div style={{
                            fontFamily: 'Syne, sans-serif', fontSize: '2rem', fontWeight: 800,
                            background: 'linear-gradient(135deg, #8B5CF6, #22D3EE)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                        }}>{val}</div>
                        <div style={{ fontSize: '0.8rem', color: 'rgba(241,240,255,0.4)', marginTop: 4 }}>{label}</div>
                    </div>
                ))}
            </motion.div>

            {/* Filter tabs */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                style={{
                    display: 'flex', gap: 6,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '50px',
                    padding: '5px',
                    width: 'fit-content',
                    margin: '0 auto 36px',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                }}
            >
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: '8px 20px', borderRadius: '50px',
                            border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                            fontSize: '0.85rem', fontWeight: 600,
                            transition: 'all 0.2s',
                            background: activeTab === tab.id
                                ? 'linear-gradient(135deg, #8B5CF6, #22D3EE)'
                                : 'transparent',
                            color: activeTab === tab.id ? '#fff' : 'rgba(241,240,255,0.5)',
                            boxShadow: activeTab === tab.id ? '0 4px 16px rgba(139,92,246,0.3)' : 'none',
                        }}
                    >
                        {tab.label}
                        <span style={{
                            background: activeTab === tab.id ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)',
                            borderRadius: '50px', padding: '1px 8px',
                            fontSize: '0.75rem', fontWeight: 700,
                        }}>{tab.count}</span>
                    </button>
                ))}
            </motion.div>

            {/* Tools grid */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    variants={container}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, y: -10 }}
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                        gap: 18,
                    }}
                >
                    {filtered.map(t => <ToolCard key={t.id} tool={t} />)}
                </motion.div>
            </AnimatePresence>

            {/* Footer */}
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                style={{ textAlign: 'center', marginTop: 80, color: 'rgba(241,240,255,0.25)', fontSize: '0.8rem' }}
            >
                Built with ⚡ ConvertMaster — All processing happens locally in your browser
            </motion.div>
        </div>
    );
}
