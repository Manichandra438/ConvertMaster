import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Trash2, Minimize2, Maximize2, Check } from 'lucide-react';
import ToolCard from '../components/ToolCard';
import SEO from '../components/SEO';
import { cn } from '../lib/utils';

export default function JsonTool() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [error, setError] = useState(null);
    const [indentSize, setIndentSize] = useState(2);
    const [copied, setCopied] = useState(null);

    useEffect(() => {
        setError(null);
        if (!input) {
            setOutput('');
            return;
        }

        try {
            const parsed = JSON.parse(input);
            setOutput(JSON.stringify(parsed, null, indentSize));
        } catch (err) {
            setError(err.message);
        }
    }, [input, indentSize]);

    const handleCopy = async (text, id) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(id);
            setTimeout(() => setCopied(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const minify = () => {
        setIndentSize(0);
    };

    const format = () => {
        setIndentSize(2);
    };

    return (
        <>
            <SEO
                title="JSON Formatter & Validator - Format, Validate, Minify JSON | Free Online Tool"
                description="Free online JSON formatter and validator. Format, beautify, validate, and minify JSON data instantly."
                keywords="json formatter, json validator, json beautifier, json minifier, format json, validate json, pretty print json"
                canonical="/json"
            />
            <ToolCard
                title="JSON Formatter/Minifier"
                description="Format JSON with proper indentation or minify it to save space."
            >
                <motion.div
                    className="grid gap-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="flex items-center justify-center">
                        <div className="bg-muted p-1 rounded-lg flex items-center relative">
                            <motion.div
                                className="absolute inset-y-1 left-1 bg-background shadow-sm rounded-md"
                                animate={{
                                    x: indentSize > 0 ? 0 : 'calc(100% - 4px)',
                                }}
                                style={{ width: 'calc(50% - 4px)' }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={format}
                                className={cn(
                                    "px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 relative z-10",
                                    indentSize > 0 ? "text-foreground" : "text-muted-foreground"
                                )}
                            >
                                <Maximize2 size={16} />
                                Format
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={minify}
                                className={cn(
                                    "px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 relative z-10",
                                    indentSize === 0 ? "text-foreground" : "text-muted-foreground"
                                )}
                            >
                                <Minimize2 size={16} />
                                Minify
                            </motion.button>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <motion.div
                            className="space-y-2"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium">Input JSON</label>
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
                                className="w-full h-[500px] p-4 rounded-lg border border-input bg-background focus:ring-2 focus:ring-ring focus:border-input resize-none font-mono text-sm transition-all"
                                placeholder="Paste JSON here..."
                            />
                        </motion.div>

                        <motion.div
                            className="space-y-2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium">Output</label>
                                <div className="flex items-center gap-2">
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => handleCopy(output, 'output')}
                                        className="p-1.5 hover:bg-accent rounded-md text-muted-foreground hover:text-foreground transition-colors"
                                        title="Copy"
                                    >
                                        <AnimatePresence mode="wait">
                                            {copied === 'output' ? (
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
                            <div className="relative">
                                <textarea
                                    readOnly
                                    value={output}
                                    className={cn(
                                        "w-full h-[500px] p-4 rounded-lg border border-input bg-muted/50 focus:outline-none resize-none font-mono text-sm transition-all",
                                        error && "border-destructive focus:border-destructive"
                                    )}
                                    placeholder="Formatted JSON will appear here..."
                                />
                                <AnimatePresence>
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="absolute bottom-4 left-4 right-4 text-destructive text-sm bg-destructive/10 p-2 rounded border border-destructive/20"
                                        >
                                            {error}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </ToolCard>
        </>
    );
}
