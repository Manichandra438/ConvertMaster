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
        const r = new FileReader();
        r.onload = (e) => res(e.target.result);
        r.onerror = () => rej(new Error(`Could not read: ${file.name}`));
        r.readAsDataURL(file);
    });
}

async function imageToBlob(file, format, quality) {
    const dataUrl = await readFileAsDataUrl(file);
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
            canvas.getContext('2d').drawImage(img, 0, 0);
            canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), format, quality);
        };
        img.onerror = () => reject(new Error(`Decode failed: ${file.name}`));
        img.src = dataUrl;
    });
}

async function resizeImage(file, mode, format, quality, opts) {
    const dataUrl = await readFileAsDataUrl(file);
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            try {
                let w = img.naturalWidth, h = img.naturalHeight;
                if (mode === 'exact') {
                    const tw = opts.width || w;
                    const th = opts.height;
                    w = tw;
                    h = th ? th : Math.round(h * (tw / img.naturalWidth));
                } else if (mode === 'percent') {
                    const pct = opts.percent / 100;
                    w = Math.round(w * pct); h = Math.round(h * pct);
                }
                const canvas = document.createElement('canvas');
                canvas.width = w; canvas.height = h;
                const ctx = canvas.getContext('2d');
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, 0, 0, w, h);
                canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Resize failed'))), format, quality);
            } catch (err) {
                reject(new Error(`Resize failed for ${file.name}: ${err.message}`));
            }
        };
        img.onerror = () => reject(new Error(`Decode failed: ${file.name}`));
        img.src = dataUrl;
    });
}

async function compressToSize(file, maxBytes, format) {
    let q = 0.9;
    let blob = await imageToBlob(file, format, q);
    while (blob.size > maxBytes && q > 0.1) {
        q = Math.round((q - 0.1) * 10) / 10;
        blob = await imageToBlob(file, format, q);
    }
    return blob;
}

function triggerDownload(blob, name) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none'; a.href = url; a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(url); document.body.removeChild(a); }, 1000);
}

const FORMAT_EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

// ── Component ────────────────────────────────────────────────
export default function ResizeCompressTool() {
    const [files, setFiles] = useState([]);
    const [dragging, setDragging] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [showProgress, setShowProgress] = useState(false);

    // Settings
    const [mode, setMode] = useState('exact');
    const [format, setFormat] = useState('image/jpeg');
    const [quality, setQuality] = useState(85);
    const [width, setWidth] = useState(1920);
    const [height, setHeight] = useState(0);
    const [percent, setPercent] = useState(50);
    const [maxKB, setMaxKB] = useState(500);

    const inputRef = useRef(null);

    const addFiles = useCallback((fileList) => {
        const newFiles = Array.from(fileList).map((f) => ({
            id: Date.now() + Math.random(),
            file: f,
            status: 'ready',
            result: null,
            resultSize: null,
            thumbUrl: f.type.startsWith('image/') ? URL.createObjectURL(f) : null,
        }));
        setFiles((prev) => [...prev, ...newFiles]);
    }, []);

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
    };

    const removeFile = (id) => setFiles((prev) => prev.filter((f) => f.id !== id));
    const clearAll = () => setFiles([]);

    const processAll = async () => {
        if (!files.length) return;
        setProcessing(true);
        setShowProgress(true);
        setProgress(0);
        const updated = [...files];

        for (let i = 0; i < updated.length; i++) {
            updated[i] = { ...updated[i], status: 'working' };
            setFiles([...updated]);
            setProgress(Math.round((i / updated.length) * 90));
            try {
                let blob;
                if (mode === 'maxsize') {
                    blob = await compressToSize(updated[i].file, maxKB * 1024, format);
                } else {
                    blob = await resizeImage(updated[i].file, mode, format, quality / 100, { width, height, percent });
                }
                updated[i] = { ...updated[i], result: blob, resultSize: blob.size, status: 'done' };
            } catch (e) {
                updated[i] = { ...updated[i], status: 'error' };
                console.error(e);
            }
            setFiles([...updated]);
            await sleep(10);
        }

        setProgress(100);
        setProcessing(false);
        setTimeout(() => setShowProgress(false), 800);
    };

    const downloadSingle = (item) => {
        if (!item.result) return;
        const ext = FORMAT_EXT[format] || 'jpg';
        triggerDownload(item.result, `${item.file.name.replace(/\.[^.]+$/, '')}_resized.${ext}`);
    };

    const downloadAllResults = async () => {
        const done = files.filter((f) => f.result);
        const ext = FORMAT_EXT[format] || 'jpg';
        for (let i = 0; i < done.length; i++) {
            triggerDownload(done[i].result, `${done[i].file.name.replace(/\.[^.]+$/, '')}_resized.${ext}`);
            if (i < done.length - 1) await sleep(400);
        }
    };

    const anyDone = files.some((f) => f.result);

    return (
        <>
            <SEO
                title="Resize & Compress Images | ConvertMaster"
                description="Resize images to exact pixel dimensions, scale by percentage, or compress to a target file size. Free, private, no uploads."
                keywords="resize image, compress image, image optimizer, reduce image size, scale image"
                canonical="/resize-compress"
            />
            <ToolCard title="Resize & Compress" description="Resize images to exact dimensions, scale by percent, or compress to a target file size.">
                {/* Drop zone */}
                <div
                    className={cn('ft-dropzone', dragging && 'drag-over')}
                    onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                >
                    <input ref={inputRef} type="file" accept="image/*" multiple onChange={(e) => addFiles(e.target.files)} />
                    <div className="text-4xl mb-3">📐</div>
                    <p className="font-semibold text-base mb-1">Drop images to resize or compress</p>
                    <p className="text-sm text-muted-foreground">Set exact dimensions, scale, or target file size</p>
                </div>

                {/* Settings */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                    {/* Resize Mode */}
                    <div className="space-y-1">
                        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Resize Mode</label>
                        <select className="w-full p-2.5 rounded-lg border border-input bg-background text-sm" value={mode} onChange={(e) => setMode(e.target.value)}>
                            <option value="exact">Exact Dimensions (px)</option>
                            <option value="percent">Scale by Percent</option>
                            <option value="maxsize">Max File Size (KB)</option>
                        </select>
                    </div>

                    {/* Mode-specific inputs */}
                    {mode === 'exact' && (
                        <>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Width (px)</label>
                                <input type="number" className="w-full p-2.5 rounded-lg border border-input bg-background text-sm" value={width} min={1} onChange={(e) => setWidth(Number(e.target.value))} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Height (px) — 0 = auto</label>
                                <input type="number" className="w-full p-2.5 rounded-lg border border-input bg-background text-sm" value={height} min={0} onChange={(e) => setHeight(Number(e.target.value))} />
                            </div>
                        </>
                    )}
                    {mode === 'percent' && (
                        <div className="space-y-1">
                            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Scale Percent</label>
                            <input type="number" className="w-full p-2.5 rounded-lg border border-input bg-background text-sm" value={percent} min={1} max={500} onChange={(e) => setPercent(Number(e.target.value))} />
                        </div>
                    )}
                    {mode === 'maxsize' && (
                        <div className="space-y-1">
                            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Max Size (KB)</label>
                            <input type="number" className="w-full p-2.5 rounded-lg border border-input bg-background text-sm" value={maxKB} min={10} onChange={(e) => setMaxKB(Number(e.target.value))} />
                        </div>
                    )}

                    {/* Format */}
                    <div className="space-y-1">
                        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Output Format</label>
                        <select className="w-full p-2.5 rounded-lg border border-input bg-background text-sm" value={format} onChange={(e) => setFormat(e.target.value)}>
                            <option value="image/jpeg">JPEG</option>
                            <option value="image/png">PNG</option>
                            <option value="image/webp">WEBP</option>
                        </select>
                    </div>

                    {/* Quality */}
                    <div className="space-y-1">
                        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Quality — {quality}%</label>
                        <input type="range" min={1} max={100} value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="w-full accent-primary" />
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
                                        <p className="text-xs text-muted-foreground">
                                            {item.resultSize
                                                ? `${formatBytes(item.file.size)} → ${formatBytes(item.resultSize)}`
                                                : formatBytes(item.file.size)}
                                        </p>
                                    </div>
                                    <span className={cn('ft-status-wait',
                                        item.status === 'done' && 'ft-status-done',
                                        item.status === 'error' && 'ft-status-error',
                                    )}>{item.status}</span>
                                    {item.result && (
                                        <button onClick={() => downloadSingle(item)} className="p-1.5 hover:bg-accent rounded-md" title="Download">
                                            <Download size={16} />
                                        </button>
                                    )}
                                    <button onClick={() => removeFile(item.id)} className="p-1.5 hover:bg-accent rounded-md text-muted-foreground">
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
                        onClick={processAll}
                        disabled={processing || !files.length}
                        className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold text-sm disabled:opacity-50 flex items-center gap-2"
                    >
                        {processing ? <><span className="ft-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Processing…</> : '⚡ Process All'}
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
