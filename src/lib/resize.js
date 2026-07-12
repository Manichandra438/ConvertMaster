/**
 * Computes output pixel dimensions for a resize operation.
 * mode 'exact': opts.width required, opts.height optional (0/falsy = auto, preserves aspect ratio).
 * mode 'percent': opts.percent is the scale percentage (100 = unchanged).
 * Any other mode returns the source dimensions unchanged.
 */
export function computeResizedDimensions(mode, srcWidth, srcHeight, opts) {
    if (mode === 'exact') {
        const w = opts.width || srcWidth;
        const h = opts.height ? opts.height : Math.round(srcHeight * (w / srcWidth));
        return { width: w, height: h };
    }
    if (mode === 'percent') {
        const pct = opts.percent / 100;
        return { width: Math.round(srcWidth * pct), height: Math.round(srcHeight * pct) };
    }
    return { width: srcWidth, height: srcHeight };
}
