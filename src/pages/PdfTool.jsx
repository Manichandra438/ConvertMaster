import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Download, X, FileText, RefreshCw } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import ToolCard from '../components/ToolCard';
import SEO from '../components/SEO';
import { cn } from '../lib/utils';

// Configure pdfjs worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();

// ── helpers ──────────────────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function formatBytes(b) {
    if (b < 1024) return b + ' B';
    if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB';
    return (b / 1024 / 1024).toFixed(2) + ' MB';
}

function triggerDownload(blob, name) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none'; a.href = url; a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(url); document.body.removeChild(a); }, 1000);
}

async function imageToJpeg(file) {
    const url = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = (e) => res(e.target.result);
        r.onerror = () => rej(new Error(`Could not read ${file.name}`));
        r.readAsDataURL(file);
    });
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
            canvas.getContext('2d').drawImage(img, 0, 0);
            canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/jpeg', 0.9);
        };
        img.onerror = () => reject(new Error(`Decode failed: ${file.name}`));
        img.src = url;
    });
}

const TOOL_INFO = {
    img2pdf:  { icon: '🖼️→📄', title: 'Images → PDF',  desc: 'Combine multiple images into a single PDF', accept: 'image/*' },
    pdf2img:  { icon: '📄→🖼️', title: 'PDF → Images',  desc: 'Extract each PDF page as a high-res image', accept: '.pdf' },
    mergepdf: { icon: '🔀',      title: 'Merge PDFs',    desc: 'Combine multiple PDFs into one document',   accept: '.pdf' },
    compress: { icon: '🗜️',     title: 'Compress PDF',  desc: 'Reduce PDF file size while keeping quality', accept: '.pdf' },
};

// ── Component ────────────────────────────────────────────────
export default function PdfTool() {
    const [activeTool, setActiveTool] = useState('img2pdf');
    const [files, setFiles] = useState([]);
    const [dragging, setDragging] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [showProgress, setShowProgress] = useState(false);
    const [pageSize, setPageSize] = useState('a4');
    const [imgFormat, setImgFormat] = useState('jpeg');
    const [dpi, setDpi] = useState(150);
    const [result, setResult] = useState(null);   // { blob, name, label }
    const [galleryPages, setGalleryPages] = useState([]);
    const [selectMode, setSelectMode] = useState(false);
    const [selected, setSelected] = useState(new Set());
    const inputRef = useRef(null);

    const toolInfo = TOOL_INFO[activeTool];

    const switchTool = (tool) => {
        setActiveTool(tool);
        setFiles([]);
        setResult(null);
        setGalleryPages([]);
        setSelected(new Set());
        setSelectMode(false);
    };

    const addFiles = useCallback((fileList) => {
        const newFiles = Array.from(fileList).map((f) => ({
            id: Date.now() + Math.random(),
            file: f,
            status: 'ready',
            result: null,
        }));
        setFiles((prev) => [...prev, ...newFiles]);
    }, []);

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
    };

    const removeFile = (id) => setFiles((prev) => prev.filter((f) => f.id !== id));

    const clearAll = () => {
        setFiles([]);
        setResult(null);
        setGalleryPages([]);
        setSelected(new Set());
        setSelectMode(false);
    };

    const updateStatus = (id, status, resultBlob = null) => {
        setFiles((prev) => prev.map((f) => f.id === id ? { ...f, status, result: resultBlob ?? f.result } : f));
    };

    // ── Tool runners ──
    const runImagesToPdf = async (fileItems) => {
        const pdfDoc = await PDFDocument.create();
        const [pw, ph] = pageSize === 'a4' ? [595, 842] : pageSize === 'letter' ? [612, 792] : [0, 0];

        for (let i = 0; i < fileItems.length; i++) {
            setProgress(Math.round((i / fileItems.length) * 90));
            updateStatus(fileItems[i].id, 'working');
            const ab = await fileItems[i].file.arrayBuffer();
            let img;
            try {
                img = fileItems[i].file.type === 'image/png'
                    ? await pdfDoc.embedPng(ab)
                    : await pdfDoc.embedJpg(ab);
            } catch {
                const blob = await imageToJpeg(fileItems[i].file);
                img = await pdfDoc.embedJpg(await blob.arrayBuffer());
            }
            const [pW, pH] = pageSize === 'fit' ? [img.width, img.height] : [pw, ph];
            const scale = Math.min(pW / img.width, pH / img.height);
            const page = pdfDoc.addPage([pW, pH]);
            page.drawImage(img, {
                x: (pW - img.width * scale) / 2,
                y: (pH - img.height * scale) / 2,
                width: img.width * scale,
                height: img.height * scale,
            });
            updateStatus(fileItems[i].id, 'done');
            await sleep(10);
        }
        const bytes = await pdfDoc.save();
        const blob = new Blob([bytes], { type: 'application/pdf' });
        setResult({ blob, name: 'converted.pdf', label: `${fileItems.length} image${fileItems.length > 1 ? 's' : ''} → PDF · ${(blob.size / 1024 / 1024).toFixed(2)} MB` });
    };

    const runPdfToImages = async (fileItems) => {
        const scale = dpi / 72;
        const pages = [];

        for (let fi = 0; fi < fileItems.length; fi++) {
            updateStatus(fileItems[fi].id, 'working');
            try {
                const ab = await fileItems[fi].file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(ab) }).promise;
                for (let p = 1; p <= pdf.numPages; p++) {
                    setProgress(Math.round(((fi * pdf.numPages + p) / (fileItems.length * pdf.numPages)) * 90));
                    const page = await pdf.getPage(p);
                    const vp = page.getViewport({ scale });
                    const canvas = document.createElement('canvas');
                    canvas.width = vp.width; canvas.height = vp.height;
                    await page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise;
                    const blob = await new Promise((r) => canvas.toBlob(r, 'image/' + imgFormat, 0.92));
                    const thumbCanvas = document.createElement('canvas');
                    const ts = Math.min(1, 300 / vp.width);
                    thumbCanvas.width = Math.round(vp.width * ts);
                    thumbCanvas.height = Math.round(vp.height * ts);
                    thumbCanvas.getContext('2d').drawImage(canvas, 0, 0, thumbCanvas.width, thumbCanvas.height);
                    const dataUrl = thumbCanvas.toDataURL('image/jpeg', 0.75);
                    const label = fileItems.length > 1
                        ? `${fileItems[fi].file.name.replace(/\.[^.]+$/, '')} — p.${p}`
                        : `Page ${p}`;
                    const name = `${fileItems[fi].file.name.replace(/\.[^.]+$/, '')}_page_${p}.${imgFormat}`;
                    pages.push({ blob, name, dataUrl, label });
                    await sleep(5);
                }
                updateStatus(fileItems[fi].id, 'done');
            } catch (err) {
                updateStatus(fileItems[fi].id, 'error');
                console.error(err);
            }
        }
        setGalleryPages(pages);
    };

    const runMergePdfs = async (fileItems) => {
        const merged = await PDFDocument.create();
        for (let i = 0; i < fileItems.length; i++) {
            setProgress(Math.round((i / fileItems.length) * 90));
            updateStatus(fileItems[i].id, 'working');
            const ab = await fileItems[i].file.arrayBuffer();
            const src = await PDFDocument.load(ab);
            const pages = await merged.copyPages(src, src.getPageIndices());
            pages.forEach((p) => merged.addPage(p));
            updateStatus(fileItems[i].id, 'done');
            await sleep(10);
        }
        const bytes = await merged.save();
        const blob = new Blob([bytes], { type: 'application/pdf' });
        setResult({ blob, name: 'merged.pdf', label: `${fileItems.length} PDFs merged · ${(blob.size / 1024 / 1024).toFixed(2)} MB` });
    };

    const runCompressPdf = async (fileItems) => {
        const results = [];
        for (let fi = 0; fi < fileItems.length; fi++) {
            updateStatus(fileItems[fi].id, 'working');
            const ab = await fileItems[fi].file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: ab }).promise;
            const newDoc = await PDFDocument.create();
            for (let p = 1; p <= pdf.numPages; p++) {
                setProgress(Math.round(((fi * pdf.numPages + p) / (fileItems.length * pdf.numPages)) * 90));
                const page = await pdf.getPage(p);
                const vp = page.getViewport({ scale: 1.0 });
                const canvas = document.createElement('canvas');
                canvas.width = vp.width; canvas.height = vp.height;
                await page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise;
                const blob = await new Promise((r) => canvas.toBlob(r, 'image/jpeg', 0.6));
                const img = await newDoc.embedJpg(await blob.arrayBuffer());
                const pg = newDoc.addPage([vp.width, vp.height]);
                pg.drawImage(img, { x: 0, y: 0, width: vp.width, height: vp.height });
                await sleep(5);
            }
            const bytes = await newDoc.save();
            const outBlob = new Blob([bytes], { type: 'application/pdf' });
            results.push({ blob: outBlob, name: `compressed_${fileItems[fi].file.name}` });
            updateStatus(fileItems[fi].id, 'done', outBlob);
        }
        if (fileItems.length === 1) {
            const saved = Math.round((1 - results[0].blob.size / fileItems[0].file.size) * 100);
            setResult({ blob: results[0].blob, name: results[0].name,
                label: `${formatBytes(fileItems[0].file.size)} → ${formatBytes(results[0].blob.size)} · saved ${saved}%` });
        } else {
            const totalSaved = Math.round(
                (1 - results.reduce((s, r) => s + r.blob.size, 0) /
                    fileItems.reduce((s, f) => s + f.file.size, 0)) * 100);
            setResult({ blob: null, name: '', label: `${fileItems.length} files compressed · ~${totalSaved}% smaller`, multiResults: results });
        }
    };

    const runTool = async () => {
        if (!files.length) return;
        setProcessing(true);
        setShowProgress(true);
        setProgress(0);
        setResult(null);
        setGalleryPages([]);
        try {
            if      (activeTool === 'img2pdf')  await runImagesToPdf(files);
            else if (activeTool === 'pdf2img')  await runPdfToImages(files);
            else if (activeTool === 'mergepdf') await runMergePdfs(files);
            else if (activeTool === 'compress') await runCompressPdf(files);
        } catch (e) {
            console.error(e);
        }
        setProgress(100);
        setProcessing(false);
        setTimeout(() => setShowProgress(false), 800);
    };

    // ── Gallery helpers ──
    const toggleCard = (idx) => {
        setSelected((prev) => {
            const next = new Set(prev);
            next.has(idx) ? next.delete(idx) : next.add(idx);
            return next;
        });
    };

    const downloadAllPages = async () => {
        for (let i = 0; i < galleryPages.length; i++) {
            triggerDownload(galleryPages[i].blob, galleryPages[i].name);
            if (i < galleryPages.length - 1) await sleep(400);
        }
    };

    const downloadSelected = async () => {
        const indices = [...selected].sort((a, b) => a - b);
        for (let i = 0; i < indices.length; i++) {
            triggerDownload(galleryPages[indices[i]].blob, galleryPages[indices[i]].name);
            if (i < indices.length - 1) await sleep(400);
        }
    };

    return (
        <>
            <SEO
                title="PDF Tools — Convert, Merge, Compress PDFs | ConvertMaster"
                description="Free PDF tools: convert images to PDF, extract PDF pages as images, merge multiple PDFs, and compress PDF file size. All 100% in your browser."
                keywords="pdf converter, pdf to image, image to pdf, merge pdf, compress pdf, pdf tools"
                canonical="/pdf-tools"
            />
            <ToolCard title="PDF Tools" description="Convert, merge, compress PDFs and extract pages — all in your browser.">
                {/* Tool selector */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    {Object.entries(TOOL_INFO).map(([key, info]) => (
                        <button
                            key={key}
                            onClick={() => switchTool(key)}
                            className={cn('ft-tool-card text-left', activeTool === key && 'selected')}
                        >
                            <div className="text-2xl mb-2">{info.icon}</div>
                            <div className="text-sm font-semibold">{info.title}</div>
                            <div className="text-xs text-muted-foreground mt-1">{info.desc}</div>
                        </button>
                    ))}
                </div>

                {/* Drop zone */}
                <div
                    className={cn('ft-dropzone', dragging && 'drag-over')}
                    onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                >
                    <input ref={inputRef} type="file" accept={toolInfo.accept} multiple onChange={(e) => addFiles(e.target.files)} />
                    <div className="text-4xl mb-3">{toolInfo.icon}</div>
                    <p className="font-semibold text-base mb-1">
                        {activeTool === 'img2pdf' ? 'Drop images here' :
                         activeTool === 'pdf2img' ? 'Drop PDF files here' :
                         activeTool === 'mergepdf' ? 'Drop PDF files to merge' :
                         'Drop PDF files to compress'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        {activeTool === 'img2pdf' ? 'JPG, PNG, WEBP, TIFF accepted' :
                         activeTool === 'pdf2img' ? 'Each page will become an image' :
                         activeTool === 'mergepdf' ? 'They will be combined in order' :
                         'Reduces image quality inside PDF'}
                    </p>
                </div>

                {/* Settings */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                    {(activeTool === 'img2pdf') && (
                        <div className="space-y-1">
                            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Page Size</label>
                            <select className="w-full p-2.5 rounded-lg border border-input bg-background text-sm" value={pageSize} onChange={(e) => setPageSize(e.target.value)}>
                                <option value="a4">A4</option>
                                <option value="letter">Letter</option>
                                <option value="fit">Fit to Image</option>
                            </select>
                        </div>
                    )}
                    {(activeTool === 'pdf2img') && (
                        <>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Image Format</label>
                                <select className="w-full p-2.5 rounded-lg border border-input bg-background text-sm" value={imgFormat} onChange={(e) => setImgFormat(e.target.value)}>
                                    <option value="jpeg">JPEG</option>
                                    <option value="png">PNG</option>
                                    <option value="webp">WEBP</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">DPI — {dpi}</label>
                                <input type="range" min={72} max={300} value={dpi} onChange={(e) => setDpi(Number(e.target.value))} className="w-full accent-primary" />
                            </div>
                        </>
                    )}
                </div>

                {/* File list */}
                <AnimatePresence>
                    {files.length > 0 && (
                        <motion.div className="mt-4 space-y-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            {files.map((item) => (
                                <div key={item.id} className="ft-file-item">
                                    <FileText size={20} className="text-muted-foreground shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{item.file.name}</p>
                                        <p className="text-xs text-muted-foreground">{formatBytes(item.file.size)}</p>
                                    </div>
                                    <span className={cn('ft-status-wait',
                                        item.status === 'done' && 'ft-status-done',
                                        item.status === 'error' && 'ft-status-error',
                                    )}>{item.status}</span>
                                    {item.result && (
                                        <button onClick={() => triggerDownload(item.result, `compressed_${item.file.name}`)} className="p-1.5 hover:bg-accent rounded-md">
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
                        onClick={runTool}
                        disabled={processing || !files.length}
                        className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold text-sm disabled:opacity-50 flex items-center gap-2"
                    >
                        {processing ? <><span className="ft-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Processing…</> : '⚡ Run Tool'}
                    </motion.button>
                    {files.length > 0 && (
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            onClick={clearAll}
                            className="px-6 py-2.5 border border-input rounded-lg text-sm flex items-center gap-2 hover:bg-accent"
                        >
                            <Trash2 size={16} /> Clear
                        </motion.button>
                    )}
                </div>

                {/* Result banner */}
                <AnimatePresence>
                    {result && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                            className="mt-6 p-4 rounded-xl border border-green-500/30 bg-green-500/5 flex items-center justify-between gap-4"
                        >
                            <div>
                                <div className="font-semibold text-sm text-green-600 dark:text-green-400">✅ Done!</div>
                                <div className="text-sm text-muted-foreground mt-0.5">{result.label}</div>
                            </div>
                            {result.blob ? (
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                    onClick={() => triggerDownload(result.blob, result.name)}
                                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold flex items-center gap-2 shrink-0"
                                >
                                    <Download size={16} /> Download
                                </motion.button>
                            ) : result.multiResults && (
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                    onClick={async () => { for (let i = 0; i < result.multiResults.length; i++) { triggerDownload(result.multiResults[i].blob, result.multiResults[i].name); if (i < result.multiResults.length - 1) await sleep(400); } }}
                                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold flex items-center gap-2 shrink-0"
                                >
                                    <Download size={16} /> Download All
                                </motion.button>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Page gallery (PDF → Images) */}
                <AnimatePresence>
                    {galleryPages.length > 0 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6">
                            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                                <div>
                                    <div className="font-semibold">📸 Converted Pages</div>
                                    <div className="text-xs text-muted-foreground">{galleryPages.length} page{galleryPages.length > 1 ? 's' : ''}</div>
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                    <button
                                        onClick={() => { setSelectMode((s) => !s); setSelected(new Set()); }}
                                        className="px-3 py-1.5 text-xs font-semibold border border-input rounded-lg hover:bg-accent"
                                    >
                                        {selectMode ? '✕ Exit Select' : '☑️ Select Pages'}
                                    </button>
                                    <button onClick={downloadAllPages} className="px-3 py-1.5 text-xs font-semibold border border-input rounded-lg hover:bg-accent flex items-center gap-1">
                                        <Download size={12} /> Download All
                                    </button>
                                </div>
                            </div>

                            {selectMode && selected.size > 0 && (
                                <div className="flex items-center gap-3 mb-3 p-2 rounded-lg bg-muted/50 text-sm flex-wrap">
                                    <span>{selected.size} selected</span>
                                    <button onClick={() => setSelected(new Set(galleryPages.map((_, i) => i)))} className="text-xs underline">All</button>
                                    <button onClick={() => setSelected(new Set())} className="text-xs underline">None</button>
                                    <button onClick={downloadSelected} className="px-3 py-1 bg-primary text-primary-foreground rounded text-xs font-semibold flex items-center gap-1">
                                        <Download size={12} /> Download Selected
                                    </button>
                                </div>
                            )}

                            <div className="ft-page-grid">
                                {galleryPages.map((pg, idx) => (
                                    <div
                                        key={idx}
                                        className={cn('ft-page-card', selectMode && selected.has(idx) && 'selected')}
                                        onClick={() => selectMode ? toggleCard(idx) : triggerDownload(pg.blob, pg.name)}
                                    >
                                        <div className="ft-page-check">✓</div>
                                        <img src={pg.dataUrl} alt={pg.label} loading="lazy" />
                                        <div className="ft-page-label">{pg.label}</div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </ToolCard>
        </>
    );
}
