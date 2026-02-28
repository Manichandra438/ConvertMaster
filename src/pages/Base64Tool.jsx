import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Trash2, Upload, Download, ExternalLink, FileText, Image as ImageIcon, File, Type, Check } from 'lucide-react';
import ToolCard from '../components/ToolCard';
import SEO from '../components/SEO';
import { cn } from '../lib/utils';

export default function Base64Tool() {
  const [activeTab, setActiveTab] = useState('text'); // 'text' or 'file'
  const [copied, setCopied] = useState(null); // Track which element was copied

  // Text Mode State
  const [textInput, setTextInput] = useState('');
  const [textOutput, setTextOutput] = useState('');
  const [textMode, setTextMode] = useState('encode'); // 'encode' or 'decode'
  const [textError, setTextError] = useState(null);

  // File Mode State
  // Left Side (File -> Base64)
  const [fileToEncode, setFileToEncode] = useState(null);
  const [encodedFileBase64, setEncodedFileBase64] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Right Side (Base64 -> File)
  const [base64ToFileInput, setBase64ToFileInput] = useState('');
  const [decodedFileBlob, setDecodedFileBlob] = useState(null);
  const [decodedFileMime, setDecodedFileMime] = useState('');
  const [decodedFilePreviewUrl, setDecodedFilePreviewUrl] = useState('');
  const [fileDecodeError, setFileDecodeError] = useState(null);

  // --- Text Mode Logic ---
  useEffect(() => {
    setTextError(null);
    if (!textInput) {
      setTextOutput('');
      return;
    }
    try {
      if (textMode === 'encode') {
        setTextOutput(btoa(textInput));
      } else {
        setTextOutput(atob(textInput));
      }
    } catch (err) {
      setTextError('Invalid input for ' + textMode);
    }
  }, [textInput, textMode]);

  // --- File Mode Logic: File -> Base64 ---
  const handleFileSelect = (file) => {
    if (!file) return;
    setFileToEncode(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target.result;
      setEncodedFileBase64(result);
    };
    reader.readAsDataURL(file);
  };

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, []);

  // --- File Mode Logic: Base64 -> File ---
  const getMimeTypeFromBytes = (arr) => {
    const header = arr.subarray(0, 4).reduce((acc, byte) => acc + byte.toString(16).padStart(2, '0'), '').toUpperCase();
    if (header.startsWith('89504E47')) return 'image/png';
    if (header.startsWith('FFD8FF')) return 'image/jpeg';
    if (header.startsWith('47494638')) return 'image/gif';
    if (header.startsWith('25504446')) return 'application/pdf';
    if (header.startsWith('504B0304')) return 'application/zip';
    if (header.startsWith('424D')) return 'image/bmp';
    if (header.startsWith('52494646') && arr.subarray(8, 12).reduce((acc, byte) => acc + byte.toString(16).padStart(2, '0'), '').toUpperCase() === '57454250') return 'image/webp';
    return '';
  };

  useEffect(() => {
    setFileDecodeError(null);
    setDecodedFileBlob(null);
    setDecodedFilePreviewUrl('');
    setDecodedFileMime('');

    if (!base64ToFileInput) return;

    try {
      const cleanInput = base64ToFileInput.replace(/\s/g, '');
      let base64Data = cleanInput;
      let detectedMime = '';

      if (cleanInput.startsWith('data:')) {
        const matches = cleanInput.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.*)$/);
        if (matches) {
          detectedMime = matches[1];
          base64Data = matches[2];
        }
      }

      const decoded = atob(base64Data);
      const byteNumbers = new Array(decoded.length);
      for (let i = 0; i < decoded.length; i++) {
        byteNumbers[i] = decoded.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);

      if (!detectedMime) {
        detectedMime = getMimeTypeFromBytes(byteArray) || 'application/octet-stream';
      }

      const blob = new Blob([byteArray], { type: detectedMime });
      setDecodedFileBlob(blob);
      setDecodedFileMime(detectedMime);
      setDecodedFilePreviewUrl(URL.createObjectURL(blob));

    } catch (err) {
      setFileDecodeError('Invalid Base64 string');
    }
  }, [base64ToFileInput]);

  // Cleanup object URL
  useEffect(() => {
    return () => {
      if (decodedFilePreviewUrl) URL.revokeObjectURL(decodedFilePreviewUrl);
    };
  }, [decodedFilePreviewUrl]);


  const handleCopy = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const downloadDecodedFile = () => {
    if (!decodedFileBlob) return;
    const url = URL.createObjectURL(decodedFileBlob);
    const link = document.createElement('a');
    link.href = url;

    // Guess extension
    let ext = '';
    if (decodedFileMime === 'image/png') ext = '.png';
    else if (decodedFileMime === 'image/jpeg') ext = '.jpg';
    else if (decodedFileMime === 'application/pdf') ext = '.pdf';
    else if (decodedFileMime === 'text/plain') ext = '.txt';

    link.download = `decoded_file${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <SEO
        title="Base64 Encoder/Decoder - Convert PDF, Images, Files to Base64 | Free Online Tool"
        description="Free online Base64 encoder and decoder. Convert PDF to Base64, Base64 to PDF, image to Base64, and any file format. Instant conversion with preview."
        keywords="base64 encoder, base64 decoder, pdf to base64, base64 to pdf, image to base64, base64 to image, file to base64, base64 converter, base64 encode, base64 decode, encode base64, decode base64"
        canonical="/base64"
      />
      <ToolCard
        title="Text & File Encoder / Decoder"
        description="Encode and decode text or files using Base64."
      >
        {/* Tabs */}
        <div className="flex border-b border-border mb-6 relative">
          {[
            { id: 'text', icon: Type, label: 'Text' },
            { id: 'file', icon: File, label: 'File' }
          ].map(tab => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors relative z-10",
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <tab.icon size={16} />
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          ))}
        </div>

        {/* Text Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'text' && (
            <motion.div
              key="text-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="grid gap-6"
            >
              <div className="flex justify-center">
                <div className="bg-muted p-1 rounded-lg flex items-center relative">
                  <motion.div
                    className="absolute inset-y-1 left-1 bg-background shadow-sm rounded-md"
                    animate={{
                      x: textMode === 'encode' ? 0 : 'calc(100% - 4px)',
                    }}
                    style={{ width: 'calc(50% - 4px)' }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setTextMode('encode')}
                    className={cn(
                      "px-4 py-2 rounded-md text-sm font-medium transition-colors relative z-10",
                      textMode === 'encode' ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    Encode
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setTextMode('decode')}
                    className={cn(
                      "px-4 py-2 rounded-md text-sm font-medium transition-colors relative z-10",
                      textMode === 'decode' ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    Decode
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
                    <label className="text-sm font-medium">Input</label>
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setTextInput('')}
                        className="p-1.5 hover:bg-accent rounded-md text-muted-foreground hover:text-foreground transition-colors"
                        title="Clear"
                      >
                        <Trash2 size={16} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleCopy(textInput, 'input')}
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
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    className="w-full h-64 p-4 rounded-lg border border-input bg-background focus:ring-2 focus:ring-ring focus:border-input resize-none font-mono text-sm transition-all"
                    placeholder={textMode === 'encode' ? "Type text to encode..." : "Paste Base64 to decode..."}
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
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleCopy(textOutput, 'output')}
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
                  <div className="relative">
                    <textarea
                      readOnly
                      value={textOutput}
                      className={cn(
                        "w-full h-64 p-4 rounded-lg border border-input bg-muted/50 focus:outline-none resize-none font-mono text-sm transition-all",
                        textError && "border-destructive focus:border-destructive"
                      )}
                      placeholder="Result will appear here..."
                    />
                    <AnimatePresence>
                      {textError && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute bottom-4 left-4 right-4 text-destructive text-sm bg-destructive/10 p-2 rounded border border-destructive/20"
                        >
                          {textError}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* File Tab Content */}
          {activeTab === 'file' && (
            <motion.div
              key="file-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="grid lg:grid-cols-2 gap-8"
            >
              {/* Left Column: File to Base64 */}
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
                  <Upload size={20} /> File to Base64
                </h3>

                {/* Dropzone */}
                <motion.div
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                  animate={{
                    scale: isDragging ? 1.02 : 1,
                    borderColor: isDragging ? 'rgb(59, 130, 246)' : 'rgba(156, 163, 175, 0.25)'
                  }}
                  whileHover={{ scale: 1.01 }}
                  className={cn(
                    "border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer",
                    isDragging ? "bg-primary/5" : "hover:bg-muted/50",
                    "h-48 flex flex-col items-center justify-center gap-3"
                  )}
                  onClick={() => document.getElementById('file-upload').click()}
                >
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    onChange={(e) => handleFileSelect(e.target.files[0])}
                  />
                  <motion.div
                    animate={{ y: isDragging ? [-5, 5] : 0 }}
                    transition={{ repeat: isDragging ? Infinity : 0, repeatType: "reverse", duration: 0.5 }}
                  >
                    <Upload size={32} className="text-muted-foreground" />
                  </motion.div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Drag & drop a file here</p>
                    <p className="text-xs text-muted-foreground">or click to browse</p>
                  </div>
                </motion.div>

                {/* Selected File Info */}
                <AnimatePresence>
                  {fileToEncode && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-muted/50 rounded-lg p-3 flex items-center justify-between border border-border overflow-hidden"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <motion.div
                          initial={{ rotate: -180, scale: 0 }}
                          animate={{ rotate: 0, scale: 1 }}
                          className="p-2 bg-background rounded-md border border-border"
                        >
                          <FileText size={20} className="text-primary" />
                        </motion.div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{fileToEncode.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(fileToEncode.size / 1024).toFixed(2)} KB • {fileToEncode.type || 'Unknown type'}
                          </p>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => { setFileToEncode(null); setEncodedFileBase64(''); }}
                        className="p-1.5 hover:bg-background rounded-md text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Trash2 size={16} />
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Output */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Base64 Output</label>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleCopy(encodedFileBase64, 'fileOutput')}
                      disabled={!encodedFileBase64}
                      className="p-1.5 hover:bg-accent rounded-md text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
                      title="Copy"
                    >
                      <AnimatePresence mode="wait">
                        {copied === 'fileOutput' ? (
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
                    value={encodedFileBase64}
                    className="w-full h-48 p-4 rounded-lg border border-input bg-muted/50 focus:outline-none resize-none font-mono text-xs transition-all"
                    placeholder="Encoded string will appear here..."
                  />
                </div>
              </motion.div>

              {/* Right Column: Base64 to File */}
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
                  <Download size={20} /> Base64 to File
                </h3>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Base64 Input</label>
                  <textarea
                    value={base64ToFileInput}
                    onChange={(e) => setBase64ToFileInput(e.target.value)}
                    className="w-full h-48 p-4 rounded-lg border border-input bg-background focus:ring-2 focus:ring-ring focus:border-input resize-none font-mono text-xs transition-all"
                    placeholder="Paste your Base64 string here..."
                  />
                </div>

                {/* Preview Area */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium flex items-center gap-2">
                      {decodedFileMime && (decodedFileMime.startsWith('image/') ? <ImageIcon size={16} /> : <FileText size={16} />)}
                      {decodedFileMime ? 'Preview' : 'Preview'}
                    </label>
                    {decodedFilePreviewUrl && (
                      <motion.a
                        whileHover={{ scale: 1.05 }}
                        href={decodedFilePreviewUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs flex items-center gap-1 text-primary hover:underline"
                      >
                        Open in new tab <ExternalLink size={12} />
                      </motion.a>
                    )}
                  </div>

                  <div className="h-64 rounded-lg border border-input bg-muted/50 flex items-center justify-center overflow-hidden relative">
                    <AnimatePresence mode="wait">
                      {fileDecodeError ? (
                        <motion.div
                          key="error"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="text-destructive text-sm flex items-center gap-2"
                        >
                          <span className="font-medium">Error:</span> {fileDecodeError}
                        </motion.div>
                      ) : decodedFilePreviewUrl ? (
                        <motion.div
                          key="preview"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="w-full h-full flex items-center justify-center"
                        >
                          {decodedFileMime.startsWith('image/') ? (
                            <img src={decodedFilePreviewUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
                          ) : decodedFileMime === 'application/pdf' ? (
                            <iframe src={decodedFilePreviewUrl} className="w-full h-full" title="PDF Preview" />
                          ) : (
                            <div className="text-center p-4">
                              <FileText size={48} className="mx-auto text-muted-foreground mb-2" />
                              <p className="text-sm text-muted-foreground">Preview not available for this file type.</p>
                              <p className="text-xs text-muted-foreground mt-1">({decodedFileMime})</p>
                            </div>
                          )}
                        </motion.div>
                      ) : (
                        <motion.p
                          key="placeholder"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="text-sm text-muted-foreground"
                        >
                          Enter Base64 to see preview
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={downloadDecodedFile}
                  disabled={!decodedFileBlob}
                  className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Download size={18} />
                  Download File
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </ToolCard>
    </>
  );
}
