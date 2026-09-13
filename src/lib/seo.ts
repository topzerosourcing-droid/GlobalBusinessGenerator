/**
 * Dynamic SEO metadata manager for public business plan and business idea pages.
 * Dynamically updates head tags (title, description, keywords, Open Graph, Twitter).
 */

export interface SeoMetadataOptions {
  title: string;
  description: string;
  keywords?: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogUrl?: string;
  ogType?: 'website' | 'article';
}

const DEFAULT_METADATA: SeoMetadataOptions = {
  title: 'Global Business Generator — Turn Your Business Idea Into a Real Business Plan',
  description: 'AI-powered platform to turn business ideas into professional, actionable 34-section business plans for entrepreneurs worldwide.',
  keywords: ['business plan', 'startup generator', 'financial model', 'entrepreneurship', 'AI business plan'],
  ogTitle: 'Global Business Generator',
  ogDescription: 'Turn any business idea into an investor-grade 34-section plan with localized market estimates.',
  ogType: 'website',
};

function setMetaTag(nameOrProperty: 'name' | 'property', key: string, content: string) {
  let element = document.querySelector(`meta[${nameOrProperty}="${key}"]`) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(nameOrProperty, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

export function updateSeoMetadata(options: Partial<SeoMetadataOptions>) {
  const merged: SeoMetadataOptions = {
    ...DEFAULT_METADATA,
    ...options,
  };

  // 1. Update Title
  document.title = merged.title;

  // 2. Standard Meta Tags
  setMetaTag('name', 'description', merged.description);
  if (merged.keywords && merged.keywords.length > 0) {
    setMetaTag('name', 'keywords', merged.keywords.join(', '));
  }

  // 3. Open Graph Tags
  setMetaTag('property', 'og:title', merged.ogTitle || merged.title);
  setMetaTag('property', 'og:description', merged.ogDescription || merged.description);
  setMetaTag('property', 'og:type', merged.ogType || 'website');
  if (merged.ogUrl) {
    setMetaTag('property', 'og:url', merged.ogUrl);
  } else if (typeof window !== 'undefined') {
    setMetaTag('property', 'og:url', window.location.href);
  }

  // 4. Twitter Tags
  setMetaTag('name', 'twitter:title', merged.ogTitle || merged.title);
  setMetaTag('name', 'twitter:description', merged.ogDescription || merged.description);
  setMetaTag('name', 'twitter:card', 'summary_large_image');
}

export function resetSeoMetadata() {
  updateSeoMetadata(DEFAULT_METADATA);
}
