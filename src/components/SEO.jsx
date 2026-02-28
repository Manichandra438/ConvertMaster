import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function SEO({
    title = 'DevToolBox - Developer Tools Online',
    description = 'Free online developer tools including Base64 encoder/decoder, URL encoder, JSON formatter, JWT decoder, and HTML entity converter.',
    keywords = 'developer tools, base64 encoder, url encoder, json formatter, jwt decoder, html entities',
    canonical = '',
    ogType = 'website',
    ogImage = '/og-image.png'
}) {
    const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const fullUrl = canonical ? `${siteUrl}${canonical}` : (typeof window !== 'undefined' ? window.location.href : siteUrl);

    return (
        <Helmet>
            {/* Basic Meta Tags */}
            <title>{title}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />
            <link rel="canonical" href={fullUrl} />

            {/* Open Graph Tags for Social Media */}
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:type" content={ogType} />
            <meta property="og:url" content={fullUrl} />
            <meta property="og:image" content={`${siteUrl}${ogImage}`} />
            <meta property="og:site_name" content="DevToolBox Developer Tools" />

            {/* Twitter Card Tags */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={`${siteUrl}${ogImage}`} />

            {/* Additional SEO Tags */}
            <meta name="robots" content="index, follow" />
            <meta name="author" content="DevToolBox" />
            <meta httpEquiv="Content-Language" content="en" />

            {/* JSON-LD Structured Data */}
            <script type="application/ld+json">
                {JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "WebApplication",
                    "name": title,
                    "description": description,
                    "url": fullUrl,
                    "applicationCategory": "DeveloperApplication",
                    "operatingSystem": "Any",
                    "offers": {
                        "@type": "Offer",
                        "price": "0",
                        "priceCurrency": "USD"
                    },
                    "creator": {
                        "@type": "Organization",
                        "name": "DevToolBox"
                    }
                })}
            </script>
        </Helmet>
    );
}
