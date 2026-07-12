import { describe, it, expect } from 'vitest';
import { getMimeTypeFromBytes } from './mime';

describe('getMimeTypeFromBytes', () => {
    it('detects PNG', () => {
        expect(getMimeTypeFromBytes(new Uint8Array([0x89, 0x50, 0x4E, 0x47]))).toBe('image/png');
    });

    it('detects JPEG', () => {
        expect(getMimeTypeFromBytes(new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0]))).toBe('image/jpeg');
    });

    it('detects PDF', () => {
        expect(getMimeTypeFromBytes(new Uint8Array([0x25, 0x50, 0x44, 0x46]))).toBe('application/pdf');
    });

    it('detects WEBP (requires WEBP marker at offset 8)', () => {
        const bytes = new Uint8Array([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]);
        expect(getMimeTypeFromBytes(bytes)).toBe('image/webp');
    });

    it('does not misdetect RIFF without WEBP marker as webp', () => {
        const bytes = new Uint8Array([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0, 0, 0, 0]);
        expect(getMimeTypeFromBytes(bytes)).toBe('');
    });

    it('returns empty string for unrecognized bytes', () => {
        expect(getMimeTypeFromBytes(new Uint8Array([0, 0, 0, 0]))).toBe('');
    });
});
