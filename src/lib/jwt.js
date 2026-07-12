/** Decodes one base64url-encoded JWT segment into pretty-printed JSON. Throws on invalid input. */
export function decodeJwtPart(part) {
    try {
        return JSON.stringify(JSON.parse(atob(part.replace(/-/g, '+').replace(/_/g, '/'))), null, 2);
    } catch {
        throw new Error('Failed to decode part');
    }
}
