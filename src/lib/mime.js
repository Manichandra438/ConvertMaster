/** Sniffs a file's MIME type from its leading magic bytes. Returns '' if unrecognized. */
export function getMimeTypeFromBytes(arr) {
    const header = arr.subarray(0, 4).reduce((acc, byte) => acc + byte.toString(16).padStart(2, '0'), '').toUpperCase();
    if (header.startsWith('89504E47')) return 'image/png';
    if (header.startsWith('FFD8FF')) return 'image/jpeg';
    if (header.startsWith('47494638')) return 'image/gif';
    if (header.startsWith('25504446')) return 'application/pdf';
    if (header.startsWith('504B0304')) return 'application/zip';
    if (header.startsWith('424D')) return 'image/bmp';
    if (header.startsWith('52494646') && arr.subarray(8, 12).reduce((acc, byte) => acc + byte.toString(16).padStart(2, '0'), '').toUpperCase() === '57454250') return 'image/webp';
    return '';
}
