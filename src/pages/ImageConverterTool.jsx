import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Download, X, Image as ImageIcon } from 'lucide-react';
import ToolCard from '../components/ToolCard';
import SEO from '../components/SEO';
import { cn } from '../lib/utils';

// ── helpers ──────────────────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function formatBytes(b) {
    if (b < 1024) return b + ' B';
    if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB';
    return (b / 1024 / 1024).toFixed(2) + ' MB';
}

function readFileAsDataUrl(file) {
    return new Promise((res, rej) => {
        const reader = new FileReader();
        reader.onload = (e) => res(e.target.result);
        reader.onerror = () => rej(new Error(`Could not read: ${file.name}`));
        reader.readAsDataURL(file);
    });
}

function applyGrayscale(ctx, w, h) {
    const d = ctx.getImageData(0, 0, w, h);
    for (let i = 0; i < d.data.length; i += 4) {
        const g = 0.299 * d.data[i] + 0.587 * d.data[i + 1] + 0.114 * d.data[i + 2];
        d.data[i] = d.data[i + 1] = d.data[i + 2] = g;
    }
    ctx.putImageData(d, 0, 0);
}

function applySepia(ctx, w, h) {
    const d = ctx.getImageData(0, 0, w, h);
    for (let i = 0; i < d.data.length; i += 4) {
        const r = d.data[i], g = d.data[i + 1], b = d.data[i + 2];
        d.data[i]     = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
        d.data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
        d.data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
    }
    ctx.putImageData(d, 0, 0);
}

async function imageToFormat(file, format, quality, colorMode) {
    const dataUrl = await readFileAsDataUrl(file);
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                if (colorMode === 'grayscale') applyGrayscale(ctx, canvas.width, canvas.height);
                if (colorMode === 'sepia') applySepia(ctx, canvas.width, canvas.height);
                if (format === 'tiff') {
                    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('TIFF export failed'))), 'image/png', 1.0);
                } else if (format === 'ico') {
                    const ico = document.createElement('canvas');
                    ico.width = 32; ico.height = 32;
                    ico.getContext('2d').drawImage(canvas, 0, 0, 32, 32);
                    ico.toBlob((b) => (b ? resolve(b) : reject(new Error('ICO export failed'))), 'image/png', 1.0);
                } else {
                    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('canvas.toBlob failed'))), format, quality);
                }
            } catch (err) {
                reject(new Error(`Processing failed for ${file.name}: ${err.message}`));
            }
        };
        img.onerror = () => reject(new Error(`Failed to decode: ${file.name}`));
        img.src = dataUrl;
    });
}

const FORMAT_EXT = {
    'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp',
    'image/bmp': 'bmp', tiff: 'tiff', ico: 'ico',
};

function triggerDownload(blob, name) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none'; a.href = url; a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(url); document.body.removeChild(a); }, 1000);
}

// ── Component ────────────────────────────────────────────────
export default function ImageConverterTool() {
    const [files, setFiles] = useState([]);   // { id, file, status, result, thumbUrl }
    const [format, setFormat] = useState('image/jpeg');
    const [colorMode, setColorMode] = useState('rgb');
    const [quality, setQuality] = useState(85);
    const [progress, setProgress] = useState(0);
    const [showProgress, setShowProgress] = useState(false);
    const [converting, setConverting] = useState(false);
    const [dragging, setDragging] = useState(false);
    const inputRef = useRef(null);

    const addFiles = useCallback((fileList) => {
        const newFiles = Array.from(fileList).map((f) => ({
            id: Date.now() + Math.random(),
            file: f,
            status: 'ready',
            result: null,
            thumbUrl: f.type.startsWith('image/') ? URL.createObjectURL(f) : null,
        }));
        setFiles((prev) => [...prev, ...newFiles]);
    }, []);

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
    };

    const removeFile = (id) => {
        setFiles((prev) => prev.filter((f) => f.id !== id));
    };

    const clearAll = () => setFiles([]);

    const convertAll = async () => {
        if (!files.length) return;
        setConverting(true);
        setShowProgress(true);
        const updated = [...files];

        for (let i = 0; i < updated.length; i++) {
            updated[i] = { ...updated[i], status: 'working' };
            setFiles([...updated]);
            setProgress(Math.round((i / updated.length) * 90));
            try {
                const blob = await imageToFormat(updated[i].file, format, quality / 100, colorMode);
                updated[i] = { ...updated[i], result: blob, status: 'done' };
            } catch (e) {
                updated[i] = { ...updated[i], status: 'error' };
            }
            setFiles([...updated]);
            await sleep(10);
        }

        setProgress(100);
        setConverting(false);
        setTimeout(() => setShowProgress(false), 800);
    };

    const downloadSingle = (item) => {
        if (!item.result) return;
        const ext = FORMAT_EXT[format] || 'png';
        const base = item.file.name.replace(/\.[^.]+$/, '');
        triggerDownload(item.result, `${base}_converted.${ext}`);
    };

    const downloadAllResults = async () => {
        const done = files.filter((f) => f.result);
        if (!done.length) return;
        const ext = FORMAT_EXT[format] || 'png';
        for (let i = 0; i < done.length; i++) {
            triggerDownload(done[i].result, `${done[i].file.name.replace(/\.[^.]+$/, '')}_converted.${ext}`);
            if (i < done.length - 1) await sleep(400);
        }
    };

    const anyDone = files.some((f) => f.result);

    return (
        <>
            <SEO
                title="Image Converter — Convert PNG, JPEG, WEBP, TIFF | ConvertMaster"
                description="Convert images between PNG, JPEG, WEBP, TIFF, BMP, ICO formats. Apply grayscale or sepia. Batch convert multiple files instantly in your browser."
                keywords="image converter, png to jpeg, webp converter, tiff converter, batch image convert, grayscale, sepia"
                canonical="/image-converter"
            />
            <ToolCard toolId="image-converter" title="Image Converter" description="Convert between PNG, JPEG, WEBP, TIFF, BMP and ICO formats. Apply color effects and convert in batch.">
                {/* Drop zone */}
                <div
                    className={cn('ft-dropzone', dragging && 'drag-over')}
                    onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                >
                    <input ref={inputRef} type="file" accept="image/*" multiple onChange={(e) => addFiles(e.target.files)} />
                    <div className="text-4xl mb-3">☁️</div>
                    <p className="font-semibold text-base mb-1">Drop images here or click to browse</p>
                    <p className="text-sm text-muted-foreground">PNG, JPG, WEBP, TIFF, BMP, GIF, ICO, SVG · Batch upload</p>
                </div>

                {/* Settings */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Output Format</label>
                        <select className="w-full p-2.5 rounded-lg border border-input bg-background text-sm" value={format} onChange={(e) => setFormat(e.target.value)}>
                            <option value="image/png">PNG — Lossless</option>
                            <option value="image/jpeg">JPEG — Best compression</option>
                            <option value="image/webp">WEBP — Modern web</option>
                            <option value="image/bmp">BMP — Uncompressed</option>
                            <option value="tiff">TIFF — Print quality</option>
                            <option value="ico">ICO — Favicon</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Color Mode</label>
                        <select className="w-full p-2.5 rounded-lg border border-input bg-background text-sm" value={colorMode} onChange={(e) => setColorMode(e.target.value)}>
                            <option value="rgb">RGB — Color</option>
                            <option value="grayscale">Grayscale</option>
                            <option value="sepia">Sepia</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Quality — {quality}%</label>
                        <input
                            type="range" min={1} max={100} value={quality}
                            onChange={(e) => setQuality(Number(e.target.value))}
                            className="w-full accent-primary"
                        />
                    </div>
                </div>

                {/* File list */}
                <AnimatePresence>
                    {files.length > 0 && (
                        <motion.div className="mt-6 space-y-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            {files.map((item) => (
                                <div key={item.id} className="ft-file-item">
                                    {item.thumbUrl
                                        ? <img src={item.thumbUrl} alt="" className="w-10 h-10 rounded object-cover shrink-0" />
                                        : <ImageIcon size={20} className="text-muted-foreground shrink-0" />
                                    }
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{item.file.name}</p>
                                        <p className="text-xs text-muted-foreground">{formatBytes(item.file.size)}</p>
                                    </div>
                                    <span className={cn('ft-status-wait',
                                        item.status === 'done'    && 'ft-status-done',
                                        item.status === 'error'   && 'ft-status-error',
                                    )}>{item.status}</span>
                                    {item.result && (
                                        <button onClick={() => downloadSingle(item)} className="p-1.5 hover:bg-accent rounded-md" title="Download">
                                            <Download size={16} />
                                        </button>
                                    )}
                                    <button onClick={() => removeFile(item.id)} className="p-1.5 hover:bg-accent rounded-md text-muted-foreground" title="Remove">
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Progress */}
                {showProgress && (
                    <div className="ft-progress-wrap mt-4">
                        <div className="ft-progress-bar" style={{ width: progress + '%' }} />
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-3 mt-6">
                    <motion.button
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={convertAll}
                        disabled={converting || !files.length}
                        className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold text-sm disabled:opacity-50 flex items-center gap-2"
                    >
                        {converting ? <><span className="ft-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Converting…</> : '⚡ Convert All'}
                    </motion.button>
                    {anyDone && (
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            onClick={downloadAllResults}
                            className="px-6 py-2.5 bg-secondary text-secondary-foreground rounded-lg font-semibold text-sm flex items-center gap-2"
                        >
                            <Download size={16} /> Download All
                        </motion.button>
                    )}
                    {files.length > 0 && (
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            onClick={clearAll}
                            className="px-6 py-2.5 border border-input rounded-lg text-sm flex items-center gap-2 hover:bg-accent"
                        >
                            <Trash2 size={16} /> Clear
                        </motion.button>
                    )}
                </div>
            </ToolCard>
        </>
    );
}
