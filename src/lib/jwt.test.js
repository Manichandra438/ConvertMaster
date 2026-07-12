import { describe, it, expect } from 'vitest';
import { decodeJwtPart } from './jwt';

describe('decodeJwtPart', () => {
    it('decodes a standard base64url JSON segment', () => {
        // {"alg":"HS256","typ":"JWT"}
        const part = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
        expect(decodeJwtPart(part)).toBe(JSON.stringify({ alg: 'HS256', typ: 'JWT' }, null, 2));
    });

    it('handles base64url characters (- and _) not present in standard base64', () => {
        // {"a":"b?c"} base64url-encoded, contains a '_' after url-safe substitution
        const payload = JSON.stringify({ sub: '>>>???' });
        const b64url = btoa(payload).replace(/\+/g, '-').replace(/\//g, '_');
        expect(decodeJwtPart(b64url)).toBe(JSON.stringify({ sub: '>>>???' }, null, 2));
    });

    it('throws on invalid base64', () => {
        expect(() => decodeJwtPart('not-valid-base64!!!')).toThrow('Failed to decode part');
    });

    it('throws on valid base64 that is not JSON', () => {
        expect(() => decodeJwtPart(btoa('not json'))).toThrow('Failed to decode part');
    });
});
