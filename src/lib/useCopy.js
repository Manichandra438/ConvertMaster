import { useState } from 'react';

/** Copies text to clipboard, tracking which id was last copied for UI feedback. */
export function useCopy(resetDelay = 2000) {
    const [copied, setCopied] = useState(null);

    const copy = async (text, id) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(id);
            setTimeout(() => setCopied(null), resetDelay);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return { copied, copy };
}
