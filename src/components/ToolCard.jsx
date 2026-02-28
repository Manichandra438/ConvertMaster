import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { tools, categories, getRelatedTools } from '../lib/tools';

export default function ToolCard({ title, description, toolId, children }) {
    const related = toolId ? getRelatedTools(toolId) : [];
    const currentTool = toolId ? tools.find(t => t.id === toolId) : null;
    const cat = currentTool ? categories[currentTool.category] : null;
    return (
        <div className="tool-page">
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.09)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                borderRadius: '28px',
                overflow: 'hidden',
                boxShadow: '0 32px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
            }}
        >
            {/* Header */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
                style={{
                    padding: '28px 32px 24px',
                    borderBottom: '1px solid rgba(255,255,255,0.07)',
                    background: 'rgba(0,0,0,0.15)',
                }}
            >
                <h2 style={{
                    fontFamily: 'Syne, system-ui, sans-serif',
                    fontSize: '1.35rem',
                    fontWeight: 800,
                    letterSpacing: '-0.02em',
                    background: 'linear-gradient(135deg, #8B5CF6, #22D3EE)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                }}>
                    {title}
                </h2>
                {description && (
                    <p style={{ color: 'rgba(241,240,255,0.5)', fontSize: '0.88rem', marginTop: '6px', lineHeight: 1.5 }}>
                        {description}
                    </p>
                )}
            </motion.div>

            {/* Body */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
                style={{ padding: '32px' }}
            >
                {children}
            </motion.div>

            {/* Related tools strip */}
            {related.length > 0 && cat && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    style={{
                        padding: '14px 32px',
                        borderTop: '1px solid rgba(255,255,255,0.06)',
                        background: 'rgba(0,0,0,0.12)',
                        display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
                    }}
                >
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: cat.color, letterSpacing: '0.08em', textTransform: 'uppercase', flexShrink: 0 }}>
                        {cat.emoji} More in {cat.label}:
                    </span>
                    {related.map(t => (
                        <Link key={t.id} to={t.path} style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            padding: '3px 12px', borderRadius: '50px',
                            background: `${t.color}14`, border: `1px solid ${t.color}30`,
                            color: t.color, fontSize: '0.75rem', fontWeight: 600,
                            textDecoration: 'none', transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = `${t.color}28`}
                        onMouseLeave={e => e.currentTarget.style.background = `${t.color}14`}
                        >
                            {t.emoji} {t.name}
                        </Link>
                    ))}
                </motion.div>
            )}
        </motion.div>
        </div>
    );
}
