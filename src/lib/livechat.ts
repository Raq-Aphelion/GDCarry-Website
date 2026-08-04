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
   out-specify and override it. Blue accent = the site's link blue (#60a5fa,
   same as the gdcarry.com link in the widget footer). */
const ORDER_CSS = `
#messagesBlock .message-row.gd-order {
  max-width: 100% !important;
  width: 100% !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
  justify-content: flex-start !important;
  text-align: left !important;
}
#messagesBlock .message-row.gd-order .msg-body,
#messagesBlock .message-row.gd-order .msg-body-media {
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
.gd-order .msg-body strong { color: #60a5fa !important; letter-spacing: .04em; }
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
  border-radius: 6px !important;
  border: 1px solid rgba(96, 165, 250, .4) !important;
  margin: 0 !important;
}
.gd-item-text { flex: 1 1 auto !important; min-width: 0 !important; padding: 0 !important; }
`;

/** First line of every order message — used to spot order rows in the chat. */
const ORDER_MARKER = 'NEW GRAND DICE ORDER';

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
  if (!doc.getElementById('gd-order-css')) {
    const style = doc.createElement('style');
    style.id = 'gd-order-css';
    style.textContent = ORDER_CSS;
    doc.head?.appendChild(style);
  }
};

/** Order-message styler that survives page reloads. The order handoff styles
    the message when it lands, but after a reload LHC re-renders the chat
    history from the server and the raw BBCode layout returns — this sweep
    (re)styles every unprocessed order message it finds in the widget
    document. Called once from LiveChatWidget. */
export function initOrderMessageStyler() {
  const sweep = () => {
    const el = document.getElementById('lhc_widget_v2') as HTMLIFrameElement | null;
    let doc: Document | null | undefined;
    try {
      doc = el?.contentDocument;
    } catch {
      return; // cross-origin — nothing we can do
    }
    if (!doc) return;
    doc.querySelectorAll('.message-row').forEach((row) => {
      if (row.textContent?.includes(ORDER_MARKER)) styleOrderRow(doc, row);
    });
  };
  sweep();
  setInterval(sweep, 1000);
}

/** Starts an LHC chat with the order as the first message and reveals the
    widget only once the message has landed — the customer never sees the
    start form at all.

    Mechanics (verified against the react.app.js build served by
    chat.gdcarry.com):
    - `api_data` carries the submitted fields (Username/Email/Question).
    - This LHC build has NO command that starts a chat from the start form
      (its only `startChat` listener sits on the message-input box of an
      already-open chat), so we first try `chat_ui.auto_start` — the start
      form auto-submits with the api_data fields as soon as it mounts. The
      flag is always reset afterwards so later widget opens don't auto-fire.
    - Fallback: if no chat has materialised after ~4s (auto_start conditions
      not met), the form's own Start button is clicked — the old, proven
      path. Either way the iframe stays at opacity 0 + pointer-events none
      until the order message renders, so the form paste is never visible.
    - The child is rebooted first (reloadWidget) so a stale session/form
      never interferes; the attr_sets queue behind the reload. */
export function openLiveChatPrefill(data: LiveChatPrefill, attemptsLeft = 10) {
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
  const setStatusHidden = (hidden: boolean) => {
    try {
      lhc.attributes?.shidden?.next(hidden);
    } catch {
      /* older wrapper without shidden — cosmetic only */
    }
  };

  const fields: Record<string, string> = {};
  if (data.username) fields.Username = data.username;
  if (data.email) fields.Email = data.email;
  if (data.question) fields.Question = data.question;
  const setAutoStart = (on: boolean) => {
    emit('sendChildEvent', [
      { cmd: 'attr_set', arg: { type: 'attr_set', attr: ['chat_ui', 'auto_start'], data: on } },
    ]);
  };
  const setOrderData = () => {
    emit('sendChildEvent', [
      { cmd: 'attr_set', arg: { type: 'attr_set', attr: ['api_data'], data: { ...fields } } },
    ]);
    setAutoStart(true);
  };

  /** Drives the hidden widget: waits for the auto-started chat, falls back
      to clicking the form's Start button, styles the landed order message
      and fades the widget in. */
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
      // handoff controls its visibility
      if (el && el.style.opacity !== '1') {
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
        } else if (!clicked && ticks >= 8) {
          // auto_start didn't fire — submit the start form ourselves
          // (proven path; the form is invisible to the visitor regardless)
          const btn = ([...doc.querySelectorAll('button, input[type="submit"]')] as HTMLElement[]).find(
            (b) => /start/i.test(b.innerText ?? (b as unknown as HTMLInputElement).value ?? ''),
          );
          if (btn) {
            btn.click();
            clicked = true;
          }
        }
      }

      if (done || ticks >= 28) {
        // Always disarm auto_start so a later manual widget open doesn't
        // auto-submit a stale order
        setAutoStart(false);
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

  // Hide the chat bubble so it can't be clicked while the data is swapped in
  setStatusHidden(true);
  // Close if open, then reboot the child — the api_data set queues behind
  // the reload and lands before the fresh app mounts
  emit('closeWidget');
  emit('reloadWidget');
  driveWidget();
  setTimeout(setOrderData, 300);
  setTimeout(() => {
    setStatusHidden(false);
    emit('showWidget');
  }, 3000);
  // Slow-boot safety net — showing an already-open widget is harmless
  setTimeout(() => emit('showWidget'), 6000);
}
