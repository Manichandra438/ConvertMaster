import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Trash2, AlertTriangle, Check } from 'lucide-react';
import ToolCard from '../components/ToolCard';
import SEO from '../components/SEO';
import { cn } from '../lib/utils';

export default function JwtTool() {
    const [input, setInput] = useState('');
    const [header, setHeader] = useState('');
    const [payload, setPayload] = useState('');
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(null);

    useEffect(() => {
        setError(null);
        if (!input) {
            setHeader('');
            setPayload('');
            return;
        }

        try {
            const parts = input.split('.');
            if (parts.length !== 3) {
                throw new Error('Invalid JWT format (must have 3 parts separated by dots)');
            }

            const decodePart = (part) => {
                try {
                    return JSON.stringify(JSON.parse(atob(part.replace(/-/g, '+').replace(/_/g, '/'))), null, 2);
                } catch (e) {
                    throw new Error('Failed to decode part');
                }
            };

            setHeader(decodePart(parts[0]));
            setPayload(decodePart(parts[1]));
        } catch (err) {
            setError(err.message);
            setHeader('');
            setPayload('');
        }
    }, [input]);

    const handleCopy = async (text, id) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(id);
            setTimeout(() => setCopied(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <>
            <SEO
                title="JWT Decoder - Decode JSON Web Tokens Online | Free Tool"
                description="Free online JWT decoder. Decode and inspect JSON Web Tokens (JWT) instantly. View header, payload, and signature."
                keywords="jwt decoder, jwt decode, json web token decoder, jwt parser, decode jwt, jwt inspector"
                canonical="/jwt"
            />
            <ToolCard
                title="JWT Decoder"
                description="Decode JSON Web Tokens to view their header and payload."
            >
                <motion.div
                    className="grid gap-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">Encoded Token</label>
                            <div className="flex items-center gap-2">
                                <motion.button
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setInput('')}
                                    className="p-1.5 hover:bg-accent rounded-md text-muted-foreground hover:text-foreground transition-colors"
                                    title="Clear"
                                >
                                    <Trash2 size={16} />
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleCopy(input, 'input')}
                                    className="p-1.5 hover:bg-accent rounded-md text-muted-foreground hover:text-foreground transition-colors"
                                    title="Copy"
                                >
                                    <AnimatePresence mode="wait">
                                        {copied === 'input' ? (
                                            <motion.div
                                                key="check"
                                                initial={{ scale: 0, rotate: -180 }}
                                                animate={{ scale: 1, rotate: 0 }}
                                                exit={{ scale: 0, rotate: 180 }}
                                            >
                                                <Check size={16} className="text-green-500" />
                                            </motion.div>
                                        ) : (
                                            <motion.div key="copy">
                                                <Copy size={16} />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.button>
                            </div>
                        </div>
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className={cn(
                                "w-full h-32 p-4 rounded-lg border border-input bg-background focus:ring-2 focus:ring-ring focus:border-input resize-none font-mono text-sm transition-all",
                                error && "border-destructive focus:border-destructive"
                            )}
                            placeholder="Paste JWT here..."
                        />
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="flex items-center gap-2 text-destructive text-sm mt-2"
                                >
                                    <AlertTriangle size={16} />
                                    <span>{error}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <motion.div
                            className="space-y-2"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: header ? 1 : 0.5, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium">Header</label>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleCopy(header, 'header')}
                                    className="p-1.5 hover:bg-accent rounded-md text-muted-foreground hover:text-foreground transition-colors"
                                    title="Copy"
                                >
                                    <AnimatePresence mode="wait">
                                        {copied === 'header' ? (
                                            <motion.div
                                                key="check"
                                                initial={{ scale: 0, rotate: -180 }}
                                                animate={{ scale: 1, rotate: 0 }}
                                                exit={{ scale: 0, rotate: 180 }}
                                            >
                                                <Check size={16} className="text-green-500" />
                                            </motion.div>
                                        ) : (
                                            <motion.div key="copy">
                                                <Copy size={16} />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.button>
                            </div>
                            <textarea
                                readOnly
                                value={header}
                                className="w-full h-64 p-4 rounded-lg border border-input bg-muted/50 focus:outline-none resize-none font-mono text-sm transition-all"
                                placeholder="Header will appear here..."
                            />
                        </motion.div>

                        <motion.div
                            className="space-y-2"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: payload ? 1 : 0.5, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium">Payload</label>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleCopy(payload, 'payload')}
                                    className="p-1.5 hover:bg-accent rounded-md text-muted-foreground hover:text-foreground transition-colors"
                                    title="Copy"
                                >
                                    <AnimatePresence mode="wait">
                                        {copied === 'payload' ? (
                                            <motion.div
                                                key="check"
                                                initial={{ scale: 0, rotate: -180 }}
                                                animate={{ scale: 1, rotate: 0 }}
                                                exit={{ scale: 0, rotate: 180 }}
                                            >
                                                <Check size={16} className="text-green-500" />
                                            </motion.div>
                                        ) : (
                                            <motion.div key="copy">
                                                <Copy size={16} />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.button>
                            </div>
                            <textarea
                                readOnly
                                value={payload}
                                className="w-full h-64 p-4 rounded-lg border border-input bg-muted/50 focus:outline-none resize-none font-mono text-sm transition-all"
                                placeholder="Payload will appear here..."
                            />
                        </motion.div>
                    </div>
                </motion.div>
            </ToolCard>
        </>
    );
}
