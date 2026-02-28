import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const devTools = [
    { path: '/base64',    name: 'Base64',          emoji: '🔢', color: '#8B5CF6', desc: 'Encode & decode Base64 data instantly' },
    { path: '/url',       name: 'URL Encoder',     emoji: '🔗', color: '#22D3EE', desc: 'Encode & decode URL strings' },
    { path: '/json',      name: 'JSON Formatter',  emoji: '{ }', color: '#F472B6', desc: 'Format, validate & minify JSON' },
    { path: '/jwt',       name: 'JWT Decoder',     emoji: '🔑', color: '#34D399', desc: 'Decode & inspect JWT tokens' },
    { path: '/html',      name: 'HTML Entities',   emoji: '��️', color: '#F59E0B', desc: 'Encode & decode HTML entities' },
];

const fileTools = [
    { path: '/image-converter',  name: 'Image Converter',  emoji: '🖼️', color: '#8B5CF6', desc: 'Convert images between formats (PNG, JPG, WebP, AVIF…)' },
    { path: '/pdf-tools',        name: 'PDF Tools',         emoji: '📄', color: '#22D3EE', desc: 'Convert, merge & compress PDF files' },
    { path: '/resize-compress',  name: 'Resize & Compress', emoji: '📐', color: '#F472B6', desc: 'Resize images by pixels, percent or DPI' },
];

const container = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };
const cardAnim  = { hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

function ToolCard({ tool }) {
    const navigate = useNavigate();
    return (
        <motion.div
            variants={cardAnim}
            whileHover={{ y: -6, boxShadow: `0 20px 60px rgba(0,0,0,0.4)` }}
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
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = `${tool.color}55`}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
        >
            {/* Top accent line */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                background: `linear-gradient(90deg, ${tool.color}, transparent)`,
                borderRadius: '20px 20px 0 0',
            }} />
            <div style={{ fontSize: '2rem', marginBottom: 14 }}>{tool.emoji}</div>
            <h3 style={{
                fontFamily: 'Syne, sans-serif', fontSize: '1rem', fontWeight: 700,
                color: '#F1F0FF', marginBottom: 8, letterSpacing: '-0.01em',
            }}>{tool.name}</h3>
            <p style={{ fontSize: '0.82rem', color: 'rgba(241,240,255,0.5)', lineHeight: 1.5, margin: 0 }}>{tool.desc}</p>
            <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 6, color: tool.color, fontSize: '0.8rem', fontWeight: 600 }}>
                Open tool <span style={{ fontSize: '1rem' }}>→</span>
            </div>
        </motion.div>
    );
}

export default function HomePage() {
    return (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '64px 24px 80px' }}>
            {/* Hero */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                style={{ textAlign: 'center', marginBottom: 72 }}
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
                    fontWeight: 900,
                    letterSpacing: '-0.04em',
                    lineHeight: 1.05,
                    marginBottom: 20,
                    color: '#F1F0FF',
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
                    maxWidth: 560, margin: '0 auto 36px',
                    lineHeight: 1.7,
                }}>
                    Developer tools and file converters — all in one place. No uploads, no servers. Everything runs in your browser.
                </p>

                <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <motion.a
                        href="#dev-tools" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: 8,
                            padding: '13px 28px', borderRadius: 50,
                            background: 'linear-gradient(135deg, #8B5CF6, #22D3EE)',
                            color: '#fff', fontWeight: 700, fontSize: '0.92rem',
                            textDecoration: 'none', boxShadow: '0 8px 32px rgba(139,92,246,0.35)',
                        }}
                    >
                        Explore tools ↓
                    </motion.a>
                    <motion.a
                        href="#file-tools" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: 8,
                            padding: '13px 28px', borderRadius: 50,
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: 'rgba(241,240,255,0.85)', fontWeight: 600, fontSize: '0.92rem',
                            textDecoration: 'none',
                        }}
                    >
                        File tools →
                    </motion.a>
                </div>
            </motion.div>

            {/* Stats row */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                style={{ display: 'flex', justifyContent: 'center', gap: 48, marginBottom: 72, flexWrap: 'wrap' }}
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

            {/* Dev Tools */}
            <div id="dev-tools" style={{ marginBottom: 60 }}>
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}
                >
                    <span style={{
                        fontFamily: 'Syne, sans-serif', fontSize: '1.4rem', fontWeight: 800,
                        color: '#F1F0FF', letterSpacing: '-0.02em',
                    }}>🛠️ Dev Tools</span>
                    <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
                    <span style={{ fontSize: '0.78rem', color: 'rgba(241,240,255,0.35)', fontWeight: 500 }}>5 tools</span>
                </motion.div>
                <motion.div
                    variants={container} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }}
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}
                >
                    {devTools.map(t => <ToolCard key={t.path} tool={t} />)}
                </motion.div>
            </div>

            {/* File Tools */}
            <div id="file-tools">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}
                >
                    <span style={{
                        fontFamily: 'Syne, sans-serif', fontSize: '1.4rem', fontWeight: 800,
                        color: '#F1F0FF', letterSpacing: '-0.02em',
                    }}>📁 File Tools</span>
                    <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
                    <span style={{ fontSize: '0.78rem', color: 'rgba(241,240,255,0.35)', fontWeight: 500 }}>3 tools</span>
                </motion.div>
                <motion.div
                    variants={container} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }}
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}
                >
                    {fileTools.map(t => <ToolCard key={t.path} tool={t} />)}
                </motion.div>
            </div>

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
