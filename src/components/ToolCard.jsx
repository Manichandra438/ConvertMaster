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
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                style={{
                    background: 'var(--panel-bg)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    overflow: 'hidden',
                }}
            >
                {/* Header */}
                <div style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--border)',
                    background: 'var(--titlebar-bg)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                }}>
                    {/* Breadcrumb */}
                    <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>ConvertMaster</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>/</span>
                    {cat && (
                        <>
                            <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>{cat.label}</span>
                            <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>/</span>
                        </>
                    )}
                    <span style={{ fontSize: '12px', color: 'var(--text)', fontWeight: 500 }}>
                        {currentTool ? `${currentTool.emoji} ${title}` : title}
                    </span>
                </div>

                {/* Description bar */}
                {description && (
                    <div style={{
                        padding: '8px 16px',
                        borderBottom: '1px solid var(--border)',
                        background: 'var(--sidebar-bg)',
                        fontSize: '12px',
                        color: 'var(--text-dim)',
                        lineHeight: 1.5,
                    }}>
                        {description}
                    </div>
                )}

                {/* Body */}
                <div style={{ padding: '20px 20px' }}>
                    {children}
                </div>

                {/* Related tools */}
                {related.length > 0 && cat && (
                    <div style={{
                        padding: '10px 16px',
                        borderTop: '1px solid var(--border)',
                        background: 'var(--sidebar-bg)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        flexWrap: 'wrap',
                        fontSize: '11px',
                    }}>
                        <span style={{
                            color: 'var(--text-dim)',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                            flexShrink: 0,
                        }}>
                            More in {cat.label}:
                        </span>
                        {related.map(t => (
                            <Link
                                key={t.id}
                                to={t.path}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 4,
                                    padding: '3px 8px',
                                    borderRadius: 'var(--radius)',
                                    background: 'transparent',
                                    border: '1px solid var(--border)',
                                    color: 'var(--text-dim)',
                                    textDecoration: 'none',
                                    transition: 'border-color 0.1s, color 0.1s, background 0.1s',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.borderColor = 'var(--accent)';
                                    e.currentTarget.style.color = 'var(--accent)';
                                    e.currentTarget.style.background = 'rgba(0,122,204,0.1)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.borderColor = 'var(--border)';
                                    e.currentTarget.style.color = 'var(--text-dim)';
                                    e.currentTarget.style.background = 'transparent';
                                }}
                            >
                                {t.emoji} {t.name}
                            </Link>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    );
}
