import { useEffect } from 'react';

export const SITE_URL = 'https://gdcarry.com';
const SITE_NAME = 'GD Carry — Grand Dice';
const DEFAULT_OG_IMAGE = `${SITE_URL}/images/gd_logo.png`;

function setMeta(selector: string, attrs: Record<string, string>) {
  let el = document.head.querySelector<HTMLMetaElement | HTMLLinkElement>(selector);
  if (!el) {
    el = document.createElement(selector.startsWith('link') ? 'link' : 'meta');
    if (selector.includes('[rel="canonical"]')) el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  Object.entries(attrs).forEach(([k, v]) => el!.setAttribute(k, v));
}

export interface PageMetaOptions {
  /** Becomes the document title; site name is appended automatically */
  title: string;
  description: string;
  /** Absolute path for canonical/OG URL, e.g. '/guides'. Defaults to the current pathname. */
  path?: string;
  ogImage?: string;
  /** Sets meta robots noindex,nofollow — for utility pages like checkout */
  noIndex?: boolean;
}

/** Sets document title, meta description, canonical URL and Open Graph /
    Twitter tags for the current route. Render once per page component. */
export default function PageMeta({ title, description, path, ogImage, noIndex }: PageMetaOptions) {
  useEffect(() => {
    const url = `${SITE_URL}${path ?? window.location.pathname}`;
    const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;

    document.title = fullTitle;
    setMeta('meta[name="description"]', { name: 'description', content: description });
    setMeta('meta[name="robots"]', { name: 'robots', content: noIndex ? 'noindex, nofollow' : 'index, follow' });
    setMeta('link[rel="canonical"]', { href: url });

    setMeta('meta[property="og:title"]', { property: 'og:title', content: fullTitle });
    setMeta('meta[property="og:description"]', { property: 'og:description', content: description });
    setMeta('meta[property="og:url"]', { property: 'og:url', content: url });
    setMeta('meta[property="og:type"]', { property: 'og:type', content: 'website' });
    setMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: SITE_NAME });
    setMeta('meta[property="og:image"]', { property: 'og:image', content: ogImage ?? DEFAULT_OG_IMAGE });

    setMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
    setMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: fullTitle });
    setMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description });
    setMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: ogImage ?? DEFAULT_OG_IMAGE });
  }, [title, description, path, ogImage, noIndex]);

  return null;
}

/** Renders a JSON-LD structured-data script tag (FAQPage, Organization, …). */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json">{JSON.stringify(data)}</script>;
}
