import { SERVICE_PAGES } from '@/data/servicePages';
import type { Service } from '@/data/games';

/** Searchable subpage text (rewards + accordions) per service — cached, since
    content only changes with the build. */
const contentCache = new Map<string, string>();
export const contentOf = (serviceId: string): string => {
  let c = contentCache.get(serviceId);
  if (c !== undefined) return c;
  const page = SERVICE_PAGES[serviceId];
  const parts: string[] = [];
  if (page) {
    for (const rw of page.rewards) {
      parts.push(rw.title, rw.text ?? '', ...(rw.items ?? []), rw.dutyButton?.label ?? '');
    }
    for (const a of page.accordion ?? []) {
      const textOf = (it: string | { text: string; link?: { label: string } }) =>
        typeof it === 'string' ? it : `${it.link?.label ?? ''}${it.text}`;
      parts.push(
        a.title,
        ...(a.items ?? []).map(textOf),
        ...(a.groups ?? []).flatMap((g) => [g.heading, ...g.items.map(textOf)]),
      );
    }
  }
  c = parts.join(' ').toLowerCase();
  contentCache.set(serviceId, c);
  return c;
};

/** A short fragment around the match for display in search results. */
export const matchSnippet = (content: string, q: string): string => {
  const i = content.indexOf(q);
  if (i < 0) return '';
  const start = Math.max(0, i - 24);
  const end = Math.min(content.length, i + q.length + 36);
  return `${start > 0 ? '…' : ''}${content.slice(start, end)}${end < content.length ? '…' : ''}`;
};

/** Match rank for a service against the lowercase query:
    0 = name/game/category, 1 = card tags + subtext, 2 = subpage content,
    -1 = no match. */
export const rankService = (
  service: Service,
  q: string,
  opts?: { gameName?: string; subName?: string },
): number => {
  if (
    service.name.toLowerCase().includes(q) ||
    (opts?.gameName ?? '').toLowerCase().includes(q) ||
    (opts?.subName ?? '').toLowerCase().includes(q)
  )
    return 0;
  if (
    [service.tag1, service.tag2, service.tag3, service.longDescription]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(q)
  )
    return 1;
  return contentOf(service.id).includes(q) ? 2 : -1;
};
