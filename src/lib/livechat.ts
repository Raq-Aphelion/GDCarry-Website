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

/* Styles for the order message once it lands in the chat. Mirrors the
   checkout order list: square thumbnail top-left, bold title + meta +
   diamond bullets right, left-aligned on the plain dark widget background
   (no chat bubble). The theme styles visitor bubbles with !important +
   high-specificity selectors and right-aligns visitor rows, so these must
   out-specify and override it. Bold accents use the site's light blue
   (#93c5fd); the header keeps the link blue (#60a5fa).
   The body rules are scoped to DIRECT children — a width:100% media box
   inside the flex .gd-item crushes the text column to zero width. */
const ORDER_CSS = `
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
}
.gd-order .msg-body strong { color: #93c5fd !important; letter-spacing: .04em; }
/* Header — bigger, keeps the site's link blue */
.gd-order > .msg-body:first-of-type > strong:first-child {
  color: #60a5fa !important;
  font-size: 16px !important;
  letter-spacing: .06em !important;
}
/* Total — muted label, bold white price (the site's "From X €" style) */
.gd-order > .msg-body:last-of-type { color: #94a3b8 !important; }
.gd-order > .msg-body:last-of-type strong {
  color: #ffffff !important;
  font-size: 15px !important;
  letter-spacing: 0 !important;
}
.gd-item {
  display: flex !important;
  align-items: flex-start !important;
  gap: 10px !important;
  margin-top: 10px !important;
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
.gd-item .img_embed img {
  display: block !important;
  width: 56px !important;
  height: 56px !important;
  max-height: 56px !important;
  object-fit: cover !important;
  object-position: top !important;
  border-radius: 6px !important;
  border: 1px solid rgba(147, 197, 253, .4) !important;
  margin: 0 !important;
}
.gd-item-text { flex: 1 1 auto !important; min-width: 0 !important; padding: 0 !important; }
`;

/** First line of every order message — used to spot order rows in the chat. */
const ORDER_MARKER = 'ORDER DETAILS';

/** Rebuilds an order message row: LHC renders text as one .msg-body per
    paragraph block and each [img] as its own .msg-body-media. For every
    image we wrap it with the text body above it into a thumbnail-left flex
    row (the first one is split at the "Items:" marker so the contact block
    stays put), then injects the order styles. Idempotent — processed rows
    are tagged, so the reload styler can sweep freely. */
const styleOrderRow = (doc: Document, row: Element) => {
  if ((row as HTMLElement).dataset.gdStyled) return;
  (row as HTMLElement).dataset.gdStyled = '1';
  row.classList.add('gd-order');
  // Inline !important beats the theme's bubble styles regardless of
  // selector specificity — plain dark background, no chat bubble. Padding
  // stays in ORDER_CSS (inline would win over the 14px left pad).
  const resetBubble = (el: HTMLElement) => {
    const s = el.style;
    s.setProperty('background', 'none', 'important');
    s.setProperty('background-color', 'transparent', 'important');
    s.setProperty('background-image', 'none', 'important');
    s.setProperty('border', 'none', 'important');
    s.setProperty('box-shadow', 'none', 'important');
  };
  row.querySelectorAll('.msg-body, .msg-body-media').forEach((el) => resetBubble(el as HTMLElement));
  const medias = [...row.querySelectorAll('.msg-body-media')];
  medias.forEach((media, i) => {
    // The text body sits above the image with <br> elements in between
    let textBody = media.previousElementSibling;
    while (
      textBody &&
      !(textBody.classList.contains('msg-body') && !textBody.classList.contains('msg-body-media'))
    ) {
      textBody = textBody.previousElementSibling;
    }
    if (!textBody) return;
    let itemHtml = textBody.innerHTML;
    let consumedWholeBody = true;
    if (i === 0) {
      // The first text body holds the contact block AND the first item —
      // split at the Items: marker; contact lines stay where they are.
      const m = itemHtml.match(/^([\s\S]*?<strong>\s*Items:\s*<\/strong><br>\s*)([\s\S]*)$/i);
      if (m) {
        textBody.innerHTML = m[1];
        itemHtml = m[2];
        consumedWholeBody = false;
      }
    }
    const wrap = doc.createElement('div');
    wrap.className = 'gd-item';
    const textCol = doc.createElement('div');
    textCol.className = 'gd-item-text msg-body';
    textCol.innerHTML = itemHtml;
    resetBubble(textCol); // created after the reset sweep above
    media.before(wrap);
    wrap.appendChild(media);
    wrap.appendChild(textCol);
    if (consumedWholeBody) textBody.remove();
  });
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
