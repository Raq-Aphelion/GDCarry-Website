/** Opens the Live Helper Chat widget (injected by LiveChatWidget).
    The LHC script loads async, so if it isn't ready yet we retry a few times
    before giving up silently. API: https://doc.livehelperchat.com/docs/javascript-arguments */
export function openLiveChat(attemptsLeft = 10) {
  const w = window as unknown as {
    $_LHC?: { eventListener?: { emitEvent?: (event: string) => void } };
  };
  if (w.$_LHC?.eventListener?.emitEvent) {
    w.$_LHC.eventListener.emitEvent('showWidget');
  } else if (attemptsLeft > 0) {
    setTimeout(() => openLiveChat(attemptsLeft - 1), 500);
  }
}

export interface LhcSession {
  /** Visitor tracking id — always present once the widget wrapper loaded */
  vid?: string;
  /** Chat id + hash — present only while a chat is active */
  id?: number;
  hash?: string;
}

/** Reads the LHC visitor session from the widget wrapper (null when the
    wrapper hasn't loaded yet). Used by the server-side order injection:
    id+hash let the worker post into the open chat, vid lets it start one
    attached to this visitor. */
export function getLhcSession(): LhcSession | null {
  const w = window as unknown as {
    $_LHC?: { attributes?: { userSession?: { getSessionAttributes?: () => LhcSession } } };
  };
  try {
    return w.$_LHC?.attributes?.userSession?.getSessionAttributes?.() ?? null;
  } catch {
    return null;
  }
}

export interface LiveChatPrefill {
  /** Start-form Username field */
  username?: string;
  /** Start-form Email field */
  email?: string;
  /** Start-form Question/message field (BBCode supported: [b] [img] [url]) */
  question?: string;
}

/* Styles for the order message once it lands in the chat. Mirrors the site's
   cart drawer + service card: square 64px thumbnail top-left, white Sora
   title, uppercase light-blue meta (game · method · qty · price), slate
   detail lines behind light-blue diamonds, and the bottom Total with the
   card's big white Sora price — left-aligned on the plain dark widget
   background (no chat bubble). The theme styles visitor bubbles with
   !important + high-specificity selectors and right-aligns visitor rows, so
   these must out-specify and override it. The whole message shares the item
   palette: light-blue (#93c5fd) labels and header, slate (#94a3b8) contact
   values and detail text. Sora/Inter are imported so the widget uses the
   same fonts as the site.
   The body rules are scoped to DIRECT children — a width:100% media box
   inside the flex .gd-item crushes the text column to zero width.
   Images are made non-interactive (pointer-events none + anchors unwrapped in
   styleOrderRow) so visitors can't click them open in full view. */
const ORDER_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600&display=swap');
#messagesBlock .message-row.gd-order {
  max-width: 100% !important;
  width: 100% !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
  justify-content: flex-start !important;
  text-align: left !important;
}
#messagesBlock .message-row.gd-order > .msg-body,
#messagesBlock .message-row.gd-order > .msg-body-media {
  background: none !important;
  border: none !important;
  box-shadow: none !important;
  float: none !important;
  display: block !important;
  width: 100% !important;
  max-width: 100% !important;
  box-sizing: border-box !important;
  margin: 0 !important;
  padding: 2px 0 2px 14px !important;
  text-align: left !important;
  font-family: 'Inter', sans-serif !important;
}
.gd-order .msg-body strong { color: #93c5fd !important; letter-spacing: .04em; }
/* The original LHC-rendered bodies/medias stay in the DOM (React owns them —
   moving or removing them crashes React's removeChild on the next render)
   but never show; the styled layout is rebuilt from clones inside
   .gd-order-content */
#messagesBlock .message-row.gd-order > .msg-body,
#messagesBlock .message-row.gd-order > .msg-body-media {
  display: none !important;
}
#messagesBlock .message-row.gd-order > .gd-order-content {
  width: 100%;
  max-width: 100%;
}
/* No timestamp on order prints — .response in the selector lifts specificity
   above the theme's last-of-run display:block rules (they re-show timestamps
   on the final visitor row) */
#messagesBlock .message-row.gd-order.response .msg-date,
#messagesBlock .message-row.gd-order.response .msg-date-vi,
#messagesBlock .message-row.gd-order.response .msg-date-op {
  display: none !important;
}
/* Clone reset — same intent as the direct-child reset above, but for the
   cloned bodies/medias inside .gd-order-content (no width: the .gd-item
   flex rules size them). Inline !important resets are ALSO applied at
   creation time (styleOrderRow) — the theme's visitor-bubble styles carry
   !important on ID-level selectors, which would beat this rule alone */
#messagesBlock .message-row.gd-order .gd-order-content .msg-body,
#messagesBlock .message-row.gd-order .gd-order-content .msg-body-media {
  background: none !important;
  background-color: transparent !important;
  background-image: none !important;
  border: none !important;
  box-shadow: none !important;
  float: none !important;
  display: block;
  box-sizing: border-box !important;
  padding: 0 !important;
  margin: 0 !important;
  text-align: left !important;
  font-family: 'Inter', sans-serif !important;
}
/* Contact block clone (styled like the old direct-child first body). Needs
   .gd-order-content.msg-body in the selector — the clone reset above is
   (1,4,0), anything weaker loses padding to it */
#messagesBlock .message-row.gd-order .gd-order-content .msg-body.gd-contact {
  color: #94a3b8 !important;
  padding: 2px 0 2px 14px !important;
  font-size: 12px !important;
}
#messagesBlock .message-row.gd-order .gd-order-content .msg-body.gd-contact a { color: #94a3b8 !important; }
#messagesBlock .message-row.gd-order .gd-order-content .msg-body.gd-contact > strong:first-child {
  color: #93c5fd !important;
  font-size: 14px !important;
  letter-spacing: .06em;
  font-family: 'Sora', sans-serif !important;
}
/* Total clone (styled like the old direct-child .gd-total) */
#messagesBlock .message-row.gd-order .gd-order-content .msg-body.gd-total {
  color: #94a3b8 !important;
  font-size: 12px !important;
  margin-top: 16px !important;
  padding: 2px 0 2px 14px !important;
}
#messagesBlock .message-row.gd-order .gd-order-content .msg-body.gd-total strong {
  color: #ffffff !important;
  font-size: 18px !important;
  font-weight: 700 !important;
  letter-spacing: 0 !important;
  font-family: 'Sora', sans-serif !important;
}
/* Header — same light-blue family as the labels at item-title size, so the
   whole message reads as one print instead of a banner above a list */
.gd-order > .msg-body:first-of-type > strong:first-child {
  color: #93c5fd !important;
  font-size: 14px !important;
  letter-spacing: .06em !important;
  font-family: 'Sora', sans-serif !important;
}
/* Contact block text (Order ID + Name/E-mail/Payment values) — the same
   slate as the item detail lines; labels keep their light-blue bold. Needs
   the #messagesBlock prefix to beat the theme's body/link colors */
#messagesBlock .message-row.gd-order > .msg-body:first-of-type { color: #94a3b8 !important; }
#messagesBlock .message-row.gd-order > .msg-body:first-of-type a { color: #94a3b8 !important; }
/* Total — tagged .gd-total by styleOrderRow (a :last-of-type selector misses
   once item rows are wrapped in .gd-item divs): small label in the same slate
   as the detail lines + big bold white Sora price, the service card's "From"
   price style. The 16px top gap matches the item rows' rhythm. Needs the same
   #messagesBlock-prefixed specificity as the reset above — that reset's
   margin:0 (and the theme's ID-level text color) would otherwise win */
#messagesBlock .message-row.gd-order > .msg-body.gd-total {
  color: #94a3b8 !important;
  font-size: 12px !important;
  margin-top: 16px !important;
}
#messagesBlock .message-row.gd-order > .msg-body.gd-total strong {
  color: #ffffff !important;
  font-size: 18px !important;
  font-weight: 700 !important;
  letter-spacing: 0 !important;
  font-family: 'Sora', sans-serif !important;
}
.gd-item {
  display: flex !important;
  align-items: flex-start !important;
  gap: 12px !important;
  margin-top: 12px !important;
  clear: both !important;
  width: 100% !important;
  box-sizing: border-box !important;
  padding-left: 14px !important;
}
.gd-item .msg-body-media {
  flex: 0 0 auto !important;
  align-self: flex-start !important;
  width: auto !important;
  margin: 0 !important;
  padding: 0 !important;
}
.gd-item .img_embed { display: block !important; }
/* Cart drawer thumbnail: 64px square, slight rounding, no border */
.gd-item .img_embed img {
  display: block !important;
  width: 64px !important;
  height: 64px !important;
  max-height: 64px !important;
  object-fit: cover !important;
  object-position: top !important;
  border-radius: 5px !important;
  border: none !important;
  margin: 0 !important;
}
/* Visitors must not be able to click an order image open in full view */
.gd-order .msg-body-media a,
.gd-order .msg-body-media img {
  pointer-events: none !important;
  cursor: default !important;
}
.gd-item-text { flex: 1 1 auto !important; min-width: 0 !important; padding: 0 !important; }
/* Item name — cart drawer / service card title: white, semibold, Sora 14px */
.gd-item-text .gd-name strong {
  color: #ffffff !important;
  font-size: 14px !important;
  font-weight: 600 !important;
  letter-spacing: 0 !important;
  font-family: 'Sora', sans-serif !important;
}
/* Meta line — game · method · qty · price: uppercase in the same light blue
   as the contact block accents (Items: header) */
.gd-item-text .gd-meta {
  color: #93c5fd !important;
  font-size: 12px !important;
  font-weight: 500 !important;
  text-transform: uppercase !important;
  letter-spacing: .05em !important;
  margin-top: 2px !important;
}
/* Detail lines — slate 12px behind a small diamond in the same light blue */
.gd-item-text .gd-detail {
  display: flex !important;
  align-items: center !important;
  gap: 6px !important;
  color: #94a3b8 !important;
  font-size: 12px !important;
  margin-top: 3px !important;
}
.gd-item-text .gd-detail::before {
  content: '';
  flex: 0 0 auto;
  width: 4px;
  height: 4px;
  transform: rotate(45deg);
  background: rgba(147, 197, 253, .7);
}
/* "From PRICE" — service card: small slate label + big bold white Sora price */
.gd-item-text .gd-price {
  display: flex !important;
  align-items: baseline !important;
  gap: 6px !important;
  margin-top: 10px !important;
  color: #94a3b8 !important;
  font-size: 12px !important;
}
.gd-item-text .gd-price strong {
  color: #ffffff !important;
  font-size: 18px !important;
  font-weight: 700 !important;
  letter-spacing: 0 !important;
  font-family: 'Sora', sans-serif !important;
}
`;

/** First line of every order message — used to spot order rows in the chat. */
const ORDER_MARKER = 'ORDER DETAILS';

/** Wraps each line of an item's text body in a typed div (name / meta /
    detail / price) so ORDER_CSS can style them like the site's cart drawer
    and service card. Detail markers (◆/🔹) are stripped — the CSS ::before
    diamond replaces them. Tolerates the older message format (numbered
    names, "meta — price" line, 🔹 markers) that the server-side worker or
    stored chat history may still render. */
/** Allowlist sanitizer for LHC-rendered message HTML before it is re-injected
    via innerHTML. LHC escapes/BBCode-renders server-side, but if that ever
    lets raw markup through we must not amplify it: only the formatting tags
    LHC's BBCode produces survive, unknown tags are unwrapped (their text is
    kept), and href/src are restricted to http(s). Parsing happens in an inert
    <template>, so nothing executes while sanitizing. */
const sanitizeOrderHtml = (html: string): string => {
  const ALLOWED: Record<string, string[]> = {
    STRONG: [],
    B: [],
    EM: [],
    I: [],
    U: [],
    SPAN: [],
    BR: [],
    A: ['href'],
    IMG: ['src', 'alt'],
  };
  const escapeText = (s: string) =>
    s
      // Private-use-area chars are icon-font ligatures (LHC message-status
      // icons) — outside their font they render as tofu boxes
      .replace(/[-]/g, '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  const tpl = document.createElement('template');
  tpl.innerHTML = html;
  const clean = (node: ChildNode): string => {
    if (node.nodeType === Node.TEXT_NODE) return escapeText(node.textContent ?? '');
    if (node.nodeType !== Node.ELEMENT_NODE) return '';
    const el = node as Element;
    const tag = el.tagName.toUpperCase();
    // LHC message-status / icon-font spans (msg-del-st-*, material-icons):
    // their text is an icon-font ligature glyph — with the class stripped
    // (allowlist below keeps no span attrs) it renders as a tofu box, and a
    // leading glyph breaks Total-line detection, so drop them wholesale
    if (tag === 'SPAN' && /msg-del-st|material-icons|vis-icon/.test(el.getAttribute('class') ?? ''))
      return '';
    const inner = [...el.childNodes].map(clean).join('');
    if (!(tag in ALLOWED)) return inner;
    const attrs = ALLOWED[tag]
      .filter((a) => el.hasAttribute(a))
      .map((a) => {
        const v = el.getAttribute(a) ?? '';
        if ((a === 'href' || a === 'src') && !/^https?:\/\//i.test(v)) return '';
        return `${a}="${v.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}"`;
      })
      .filter(Boolean)
      .join(' ');
    if (tag === 'BR') return '<br>';
    if (tag === 'IMG') return `<img ${attrs}>`;
    const t = tag.toLowerCase();
    return `<${t}${attrs ? ` ${attrs}` : ''}>${inner}</${t}>`;
  };
  return [...tpl.content.childNodes].map(clean).join('');
};

const wrapItemLines = (html: string) =>
  html
    .split(/<br\s*\/?>/i)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      if (/^(?:◆|🔹)/.test(l)) return `<div class="gd-detail">${l.replace(/^(?:◆|🔹)\s*/, '')}</div>`;
      if (/^From[:\s]/i.test(l)) return `<div class="gd-price">${l}</div>`;
      if (/^<strong>[\s\S]*<\/strong>$/.test(l)) return `<div class="gd-name">${l}</div>`;
      return `<div class="gd-meta">${l}</div>`;
    })
    .join('');

/** Inline !important reset for our CLONES (never applied to React-owned
    originals) — beats the theme's visitor-bubble styles regardless of
    selector specificity. Paddings/margins stay in ORDER_CSS. */
const resetCloneBubble = (el: HTMLElement) => {
  const s = el.style;
  s.setProperty('background', 'none', 'important');
  s.setProperty('background-color', 'transparent', 'important');
  s.setProperty('background-image', 'none', 'important');
  s.setProperty('border', 'none', 'important');
  s.setProperty('box-shadow', 'none', 'important');
};

/** Rebuilds an order message row NON-DESTRUCTIVELY. LHC's React owns the
    message DOM: the old styler reparented medias into wrappers, removed
    consumed bodies and rewrote innerHTML — React then crashed with
    NotFoundError (removeChild) on the next re-render. Now the original
    bodies/medias are never moved, edited or removed — they stay in place,
    hidden via CSS (display:none in ORDER_CSS), and the styled layout is
    rebuilt from deep CLONES inside an appended .gd-order-content container.
    A foreign extra child is safe: React only ever removes/updates nodes it
    created itself.

    Rebuilds are guarded by a signature of the originals' content: our own
    clone insertions trigger the MutationObserver too, and the guard stops
    that loop; if React genuinely re-renders the row (new content), the
    signature changes and the clones are rebuilt fresh. */
const styleOrderRow = (doc: Document, row: Element) => {
  const rowEl = row as HTMLElement;
  // The direct children LHC rendered — never touched beyond being read
  const originals = [...row.children].filter(
    (c): c is HTMLElement =>
      c.classList.contains('msg-body') || c.classList.contains('msg-body-media'),
  );
  const isTextBody = (el: HTMLElement) =>
    el.classList.contains('msg-body') && !el.classList.contains('msg-body-media');

  const sig = originals
    .map((c) => `${c.textContent ?? ''}~${c.querySelector('img')?.getAttribute('src') ?? ''}`)
    .join('␟');
  if (rowEl.dataset.gdSig === sig) return;
  rowEl.dataset.gdSig = sig;
  rowEl.classList.add('gd-order');

  row.querySelector(':scope > .gd-order-content')?.remove();
  const content = doc.createElement('div');
  content.className = 'gd-order-content';

  // Pair each image with the text body directly above it (LHC renders the
  // item's text body first, then its [img] media)
  const paired = new Map<HTMLElement, HTMLElement>(); // media -> textBody
  for (const el of originals) {
    if (!el.classList.contains('msg-body-media')) continue;
    for (let i = originals.indexOf(el) - 1; i >= 0; i--) {
      if (isTextBody(originals[i])) {
        paired.set(el, originals[i]);
        break;
      }
    }
  }
  const consumedBodies = new Set(paired.values());

  let contactEmitted = false;
  for (const el of originals) {
    if (isTextBody(el)) {
      const html = sanitizeOrderHtml(el.innerHTML);
      if (consumedBodies.has(el)) {
        // The first item's body also carries the contact block — split it off
        // at the Items: marker and emit it here, ahead of the item rows
        if (!contactEmitted) {
          contactEmitted = true;
          const m = html.match(/^([\s\S]*?<strong>\s*Items:\s*<\/strong><br>\s*)([\s\S]*)$/i);
          if (m) {
            const contact = doc.createElement('div');
            contact.className = 'msg-body gd-contact';
            contact.innerHTML = m[1];
            resetCloneBubble(contact);
            content.appendChild(contact);
          }
        }
        continue;
      }
      // Standalone body (e.g. the Total line) — cloned straight through.
      // Total detection tolerates leading non-word chars (a stray icon glyph
      // would otherwise lose the line its big-price style)
      const clone = doc.createElement('div');
      clone.className = 'msg-body';
      clone.innerHTML = html;
      if ((clone.textContent ?? '').trim().replace(/^[\W_]+/, '').startsWith('Total:'))
        clone.classList.add('gd-total');
      resetCloneBubble(clone);
      content.appendChild(clone);
      continue;
    }
    // Media → thumbnail-left item row with the paired text in a styled column
    const textBody = paired.get(el);
    if (!textBody) continue;
    let itemHtml = sanitizeOrderHtml(textBody.innerHTML);
    // The contact part (if any) was already emitted at the body's position
    const m = itemHtml.match(/^([\s\S]*?<strong>\s*Items:\s*<\/strong><br>\s*)([\s\S]*)$/i);
    if (m) itemHtml = m[2];

    const wrap = doc.createElement('div');
    wrap.className = 'gd-item';
    const mediaClone = el.cloneNode(true) as HTMLElement;
    resetCloneBubble(mediaClone);
    mediaClone.querySelectorAll('.msg-body, .msg-body-media').forEach((n) => resetCloneBubble(n as HTMLElement));
    // Read-receipt icons are noise on an order print (and their ligature
    // glyphs tofu without the icon font)
    mediaClone
      .querySelectorAll('span[class*="msg-del-st"], .material-icons')
      .forEach((n) => n.remove());
    // Static thumbnail: strip the full-view link (CSS pointer-events backup)
    mediaClone.querySelectorAll('a').forEach((a) => a.replaceWith(...a.childNodes));
    const textCol = doc.createElement('div');
    textCol.className = 'gd-item-text msg-body';
    textCol.innerHTML = wrapItemLines(itemHtml);
    resetCloneBubble(textCol);
    wrap.appendChild(mediaClone);
    wrap.appendChild(textCol);
    content.appendChild(wrap);
  }

  row.appendChild(content);
  ensureOrderCss(doc);
};

/** Injects the order styles into the widget document (once per document). */
const ensureOrderCss = (doc: Document) => {
  if (doc.getElementById('gd-order-css')) return;
  const style = doc.createElement('style');
  style.id = 'gd-order-css';
  style.textContent = ORDER_CSS;
  doc.head?.appendChild(style);
};

/** Order-message styler that survives page reloads. The order handoff styles
    the message when it lands, but after a reload LHC re-renders the chat
    history from the server and the raw BBCode layout returns. A
    MutationObserver on the widget document styles rows the moment they
    render — no unstyled flash. LHC swaps the iframe document on
    reloadWidget, so the observer re-attaches on a slow tick.
    Called once from LiveChatWidget. */
export function initOrderMessageStyler() {
  const process = (doc: Document) => {
    doc.querySelectorAll('.message-row').forEach((row) => {
      if (row.textContent?.includes(ORDER_MARKER)) styleOrderRow(doc, row);
    });
  };
  let observedDoc: Document | null = null;
  const ensureObserver = () => {
    const el = document.getElementById('lhc_widget_v2') as HTMLIFrameElement | null;
    let doc: Document | null | undefined;
    try {
      doc = el?.contentDocument;
    } catch {
      return; // cross-origin — nothing we can do
    }
    if (!doc || doc === observedDoc) return;
    observedDoc = doc;
    ensureOrderCss(doc); // styles in place before any row can render
    process(doc);
    new MutationObserver(() => process(doc)).observe(doc, { childList: true, subtree: true });
  };
  ensureObserver();
  setInterval(ensureObserver, 500);
}

/** Starts an LHC chat with the order as the first message and reveals the
    widget only once the message has landed — the customer never sees the
    start form at all.

    Mechanics (verified against the react.app.js build served by
    chat.gdcarry.com):
    - The start form's visible fields fill from `attr_prefill` (array of
      state objects); `api_data` additionally feeds the submitted values.
      An already-mounted form NEVER re-applies attr_prefill, so the child is
      rebooted first (reloadWidget) and the sets queue behind the reload,
      landing before the fresh form mounts.
    - This LHC build has NO command that starts a chat from the start form,
      and its `chat_ui.auto_start` flag double-submits (every order created
      TWO chats), so the form's own Start button is clicked exactly once —
      and only after the prefilled order text is present in the form, so an
      empty form is never submitted. The click is also guarded by LHC's
      'chatStarted' event (LiveChatWidget loadcb): if a chat already
      exists, nothing is clicked.
    - The widget iframe stays at opacity 0 + pointer-events none until the
      order message renders, so the form paste is never visible. */
export function openLiveChatPrefill(data: LiveChatPrefill, attemptsLeft = 10, forceRestart = false) {
  const w = window as unknown as {
    $_LHC?: {
      eventListener?: { emitEvent?: (event: string, payload?: unknown) => void };
      attributes?: { shidden?: { next: (hidden: boolean) => void } };
    };
  };
  const lhc = w.$_LHC;
  if (!lhc?.eventListener?.emitEvent) {
    if (attemptsLeft > 0) setTimeout(() => openLiveChatPrefill(data, attemptsLeft - 1), 500);
    return;
  }
  const emit = (event: string, payload?: unknown) => lhc.eventListener!.emitEvent!(event, payload);

  const fields: Record<string, string> = {};
  if (data.username) fields.Username = data.username;
  if (data.email) fields.Email = data.email;
  if (data.question) fields.Question = data.question;
  const setOrderData = () => {
    // attr_prefill fills the visible form fields; api_data feeds the
    // submitted values. Both queue behind the reload and land before the
    // fresh form mounts (a mounted form never re-applies attr_prefill).
    emit('sendChildEvent', [
      { cmd: 'attr_set', arg: { type: 'attr_set', attr: ['attr_prefill'], data: [fields] } },
    ]);
    emit('sendChildEvent', [
      { cmd: 'attr_set', arg: { type: 'attr_set', attr: ['api_data'], data: { ...fields } } },
    ]);
  };

  /** Drives the hidden widget: clicks the form's Start button once (never if
      a chat already exists), styles the landed order message and fades the
      widget in. */
  const driveWidget = () => {
    const marker = (fields.Question ?? '')
      .split('\n')[0]
      .replace(/\[\/?[a-z]+(?:=[^\]]*)?\]/gi, '')
      .trim();
    let clicked = false;
    let ticks = 0;
    const tick = () => {
      ticks++;
      const el = document.getElementById('lhc_widget_v2') as HTMLIFrameElement | null;
      // Tell the fx watcher to leave this element alone while the order
      // handoff controls its visibility. Guard on the dataset flag (not the
      // opacity value): after earlier normal use the iframe sits at
      // opacity 1, and the fill would be visible while the form mounts.
      if (el && !el.dataset.gdOrderFlow) {
        el.dataset.gdOrderFlow = '1';
        el.style.transition = 'opacity .45s ease';
        el.style.opacity = '0';
        el.style.pointerEvents = 'none';
      }

      let doc: Document | null | undefined;
      try {
        doc = el?.contentDocument;
      } catch {
        doc = undefined; // cross-origin — give up below
      }

      let done = false;
      if (doc) {
        const orderRow = [...doc.querySelectorAll('.message-row')].find(
          (r) => marker && r.textContent?.includes(marker),
        );
        if (orderRow) {
          styleOrderRow(doc, orderRow);
          done = true;
        } else if (!clicked) {
          // Never submit if a chat already exists — a second submit starts a
          // second chat and the LHC bot prints the order twice. Checked via
          // LHC's own 'chatStarted' event AND the rendered chat screen.
          const chatUp =
            (window as unknown as { __gdChatStarted?: boolean }).__gdChatStarted ||
            doc.querySelector('#CSChatMessage, #messagesBlock .message-row');
          if (chatUp) {
            clicked = true;
          } else {
            // Click only once the prefilled order text is in the form —
            // submitting an empty form just bounces off validation
            const filled = [...doc.querySelectorAll('textarea')].some((t) => t.value.includes(marker));
            const btn = filled
              ? ([...doc.querySelectorAll('button, input[type="submit"]')] as HTMLElement[]).find(
                  (b) => /start/i.test(b.innerText ?? (b as unknown as HTMLInputElement).value ?? ''),
                )
              : undefined;
            if (btn) {
              btn.click();
              clicked = true;
            }
          }
        }
      }

      if (done || ticks >= 28) {
        // Fade in — either with the styled order message, or (fallback) with
        // whatever the widget shows so the user can finish manually
        if (el) {
          delete el.dataset.gdOrderFlow;
          el.style.opacity = '1';
          el.style.pointerEvents = '';
        }
        return;
      }
      setTimeout(tick, 500);
    };
    setTimeout(tick, 250);
  };

  // Arm the chat-started detector for this flow (set by the loadcb listener
  // in LiveChatWidget) — the double-submit guard reads it
  (window as unknown as { __gdChatStarted?: boolean }).__gdChatStarted = false;
  // Hide the widget iframe immediately — the tick guard keeps it hidden
  // until the order message lands (or the fallback reveals it)
  const iframe = document.getElementById('lhc_widget_v2') as HTMLIFrameElement | null;
  if (iframe) {
    iframe.dataset.gdOrderFlow = '1';
    iframe.style.transition = 'opacity .45s ease';
    iframe.style.opacity = '0';
    iframe.style.pointerEvents = 'none';
  }
  // A stale closed chat blocks the start form — kill its session first so
  // the widget boots back to a fresh form (server-side injection reported
  // the chat as closed)
  if (forceRestart) emit('endChatCookies', [{ force: true }]);
  // Close if open, then reboot the child — the api_data set queues behind
  // the reload and lands before the fresh app mounts
  emit('closeWidget');
  emit('reloadWidget');
  driveWidget();
  setTimeout(setOrderData, 300);
  setTimeout(() => emit('showWidget'), 3000);
  // Slow-boot safety net — showing an already-open widget is harmless
  setTimeout(() => emit('showWidget'), 6000);
}
