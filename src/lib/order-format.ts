/* Single source of truth for the order chat-message wire format.

   Producers:
   - worker/orders-proxy.js builds the message server-side for chat injection
     (wrangler bundles this TS import, same as the pricing engine)
   - src/pages/CheckoutPage.tsx builds the same message client-side as the
     fallback when server-side injection fails (start-form prefill flow)

   Consumer:
   - src/lib/livechat.ts parses the rendered message back into a styled
     receipt; its label regexes derive from the constants below, so a label
     change here propagates to all three places.

   Chat history persists server-side — old formats live on in stored chats,
   so changes here must stay ADDITIVE (livechat.ts keeps legacy branches for
   the pre-unification formats). */

export const ORDER_MARKER = 'ORDER DETAILS';
export const ORDER_ID_LABEL = 'Order ID:';
export const ITEMS_LABEL = 'Items:';
export const TOTAL_LABEL = 'Total:';
export const PRICE_LABEL = 'Price:';
export const IMAGE_LABEL = 'Image:';
export const DETAIL_PREFIX = '◆';
/** Item cap per order print — keeps the chat message readable. (The proxy
    payload itself is capped separately, higher, in the worker.) */
export const MAX_ORDER_ITEMS = 5;

export interface OrderMessageItem {
  name: string;
  /** Game · method · qty meta line (the price travels on its own Price: line) */
  meta?: string;
  details?: string[];
  unitPrice?: string;
  /** Thumbnail URL — same-origin https only (the worker enforces this via
      safeImage before calling; the client builds it from SITE_URL). Emitted
      as a plain-text `Image: <url>` marker line, NOT [img] BBCode: the
      operator chat renders text only, while the visitor-side styler in
      livechat.ts turns the marker back into a thumbnail. */
  image?: string;
}

export interface OrderMessageInput {
  orderId: string;
  /** 'Name' for live-chat orders, 'Discord' for discord-contact orders */
  contactLabel?: string;
  contact: string;
  email?: string;
  payment: string;
  total: string;
  items: OrderMessageItem[];
}

/* Strips BBCode brackets AND control chars (incl. newlines) from free-text
   fields before interpolation — otherwise a "name" like
   "[img]https://evil/x.png[/img]" would render in the operator's chat, and a
   smuggled newline could fake an Items:/Total: line that the visitor-side
   styler would then parse as message structure. */
const bb = (v: unknown, max: number) =>
  // eslint-disable-next-line no-control-regex -- stripping control chars is the point
  (typeof v === 'string' ? v.slice(0, max) : '').replace(/[[\]\x00-\x1f]/g, '').trim();

/** The one order-message builder. Layout: bold ORDER DETAILS header, order
    id, emoji contact block (👤 ✉️ 💳), Items: list (bold name / meta /
    ◆ details / Price: line / Image: marker), then the Total: line — exactly
    what styleOrderRow in livechat.ts parses. */
export function buildOrderMessage(o: OrderMessageInput): string {
  const itemBlocks = o.items
    .slice(0, MAX_ORDER_ITEMS)
    .map((it) => {
      const unit = bb(it.unitPrice, 30);
      const image = bb(it.image, 200);
      return [
        `[b]${bb(it.name, 120)}[/b]`,
        bb(it.meta, 80),
        (it.details ?? []).map((d) => `${DETAIL_PREFIX} ${bb(d, 120)}`).join('\n'),
        unit ? `${PRICE_LABEL} [b]${unit}[/b]` : '',
        image ? `${IMAGE_LABEL} ${image}` : '',
      ]
        .filter(Boolean)
        .join('\n');
    })
    .join('\n');
  return [
    `[b]${ORDER_MARKER}[/b]`,
    `[b]${ORDER_ID_LABEL}[/b] ${bb(o.orderId, 30)}`,
    '',
    `👤 [b]${o.contactLabel ?? 'Name'}:[/b] ${bb(o.contact, 60)}`,
    `✉️ [b]E-mail:[/b] ${bb(o.email, 60) || '—'}`,
    `💳 [b]Payment:[/b] ${bb(o.payment, 40)}`,
    '',
    `[b]${ITEMS_LABEL}[/b]`,
    itemBlocks,
    '',
    `${TOTAL_LABEL} [b]${bb(o.total, 30)}[/b]`,
  ].join('\n');
}
