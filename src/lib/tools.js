// Single source of truth for all ConvertMaster tool definitions.
// Import this in Layout, HomePage, and ToolCard — never duplicate tool lists.

export const categories = {
    'text-data': {
        label: 'Text & Data',
        emoji: '⌨️',
        color: '#8B5CF6',
        desc: 'Encode, decode, format and inspect text-based formats',
    },
    'image-files': {
        label: 'Image & Files',
        emoji: '🖼️',
        color: '#22D3EE',
        desc: 'Convert, compress and transform images and PDF documents',
    },
};

export const tools = [
    {
        id: 'base64',
        path: '/base64',
        name: 'Base64',
        emoji: '🔢',
        color: '#8B5CF6',
        category: 'text-data',
        desc: 'Encode & decode Base64 text and files',
    },
    {
        id: 'url',
        path: '/url',
        name: 'URL Encoder',
        emoji: '🔗',
        color: '#22D3EE',
        category: 'text-data',
        desc: 'Encode & decode URL strings',
    },
    {
        id: 'json',
        path: '/json',
        name: 'JSON Formatter',
        emoji: '{ }',
        color: '#F472B6',
        category: 'text-data',
        desc: 'Format, validate & minify JSON',
    },
    {
        id: 'jwt',
        path: '/jwt',
        name: 'JWT Decoder',
        emoji: '🔑',
        color: '#34D399',
        category: 'text-data',
        desc: 'Decode & inspect JWT tokens',
    },
    {
        id: 'html',
        path: '/html',
        name: 'HTML Entities',
        emoji: '🏷️',
        color: '#F59E0B',
        category: 'text-data',
        desc: 'Encode & decode HTML entities',
    },
    {
        id: 'image-converter',
        path: '/image-converter',
        name: 'Image Converter',
        emoji: '🖼️',
        color: '#8B5CF6',
        category: 'image-files',
        desc: 'Convert images between PNG, JPG, WebP, AVIF…',
    },
    {
        id: 'pdf-tools',
        path: '/pdf-tools',
        name: 'PDF Tools',
        emoji: '📄',
        color: '#22D3EE',
        category: 'image-files',
        desc: 'Convert, merge & compress PDF files',
    },
    {
        id: 'resize-compress',
        path: '/resize-compress',
        name: 'Resize & Compress',
        emoji: '📐',
        color: '#F472B6',
        category: 'image-files',
        desc: 'Resize images by pixels, percent or DPI',
    },
];

/** Returns all tools in the same category as the given toolId, excluding itself. */
export function getRelatedTools(toolId) {
    const tool = tools.find(t => t.id === toolId);
    if (!tool) return [];
    return tools.filter(t => t.category === tool.category && t.id !== toolId);
}

/** Returns tools grouped by category: { 'text-data': [...], 'image-files': [...] } */
export function getToolsByCategory() {
    return tools.reduce((acc, tool) => {
        if (!acc[tool.category]) acc[tool.category] = [];
        acc[tool.category].push(tool);
        return acc;
    }, {});
}
