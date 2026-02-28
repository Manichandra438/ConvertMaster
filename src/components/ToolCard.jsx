import React from 'react';
import { motion } from 'framer-motion';

export default function ToolCard({ title, description, children }) {
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
        </motion.div>
        </div>
    );
}
