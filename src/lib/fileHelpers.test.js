import { describe, it, expect } from 'vitest';
import { formatBytes } from './fileHelpers';

describe('formatBytes', () => {
    it('formats bytes under 1KB', () => {
        expect(formatBytes(500)).toBe('500 B');
    });

    it('formats kilobytes with one decimal', () => {
        expect(formatBytes(1536)).toBe('1.5 KB');
    });

    it('formats megabytes with two decimals', () => {
        expect(formatBytes(5 * 1024 * 1024)).toBe('5.00 MB');
    });

    it('treats exactly 1024 bytes as the KB boundary', () => {
        expect(formatBytes(1024)).toBe('1.0 KB');
    });
});
