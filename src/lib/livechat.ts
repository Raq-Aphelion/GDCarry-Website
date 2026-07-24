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
   checkout order list: square thumbnail left, bold title + meta + diamond
   bullets right, on the plain dark widget background (no chat bubble).
   The theme styles visitor bubbles with !important + high-specificity
   selectors, so these must out-specify it. */
const ORDER_CSS = `
#messagesBlock .message-row.gd-order .msg-body,
#messagesBlock .message-row.gd-order .msg-body-media {
  background: none !important;
  border: none !important;
  box-shadow: none !important;
  padding: 1px 0 !important;
}
.gd-order .msg-body strong { color: #67e8f9 !important; letter-spacing: .04em; }
.gd-order .msg-body-media { padding: 0 !important; }
.gd-item {
  display: flex !important;
  align-items: flex-start !important;
  gap: 10px !important;
  margin-top: 10px !important;
  clear: both !important;
}
.gd-item .msg-body-media { flex: 0 0 auto !important; margin: 0 !important; }
.gd-item .img_embed img {
  width: 56px !important;
  height: 56px !important;
  max-height: 56px !important;
  object-fit: cover !important;
  border-radius: 6px !important;
  border: 1px solid rgba(34, 211, 238, .35) !important;
}
.gd-item-text { flex: 1 1 auto !important; min-width: 0 !important; }
`;

/** Prefills the LHC start-chat form fields, auto-starts the chat and reveals
    the widget only once the order message has landed — the customer never
    sees the start form at all.

    Mechanics (all verified against the live widget):
    - The start form fills from `attr_prefill` (array of state objects);
      `api_data` additionally feeds the submitted fields. An already-mounted
      form NEVER re-applies attr_prefill, so the child is rebooted
      (reloadWidget) and the sets are queued behind the reload, landing
      before the fresh form mounts.
    - The widget iframe element is kept at opacity 0 + pointer-events none
      from before showWidget until the chat screen renders — no flash.
    - The auto submit is done by clicking the form's own Start button (the
      iframe is about:blank, so it inherits our origin and we can drive its
      DOM; LHC's own auto_start flag is unreliable). */
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
  const setPrefill = () => {
    emit('sendChildEvent', [
      { cmd: 'attr_set', arg: { type: 'attr_set', attr: ['attr_prefill'], data: [fields] } },
    ]);
    emit('sendChildEvent', [
      { cmd: 'attr_set', arg: { type: 'attr_set', attr: ['api_data'], data: fields } },
    ]);
  };

  /** Rebuilds the landed order message: LHC renders text as one .msg-body
      per paragraph block and each [img] as its own .msg-body-media. For every
      image we wrap it with the text body above it into a thumbnail-left flex
      row (the first one is split at the "Items:" marker so the contact block
      stays put), then injects the order styles. */
  const styleOrderRow = (doc: Document, row: Element) => {
    row.classList.add('gd-order');
    // Inline !important beats the theme's bubble styles regardless of
    // selector specificity — plain dark background, no chat bubble
    const resetBubble = (el: HTMLElement) => {
      const s = el.style;
      s.setProperty('background', 'none', 'important');
      s.setProperty('background-color', 'transparent', 'important');
      s.setProperty('background-image', 'none', 'important');
      s.setProperty('border', 'none', 'important');
      s.setProperty('box-shadow', 'none', 'important');
      s.setProperty('padding', '1px 0', 'important');
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
    const style = doc.createElement('style');
    style.textContent = ORDER_CSS;
    doc.head?.appendChild(style);
  };

  /** Drives the hidden widget: click Start when the form is ready, then
      style the landed order message and fade the widget in. */
  const driveWidgetForm = () => {
    const marker = (fields.Question ?? '')
      .split('\n')[0]
      .replace(/\[\/?[a-z]+(?:=[^\]]*)?\]/gi, '')
      .trim();
    let clicked = false;
    let ticks = 0;
    const tick = () => {
      ticks++;
      const el = document.getElementById('lhc_widget_v2') as HTMLIFrameElement | null;
      // Keep the whole widget invisible + inert until the chat is running —
      // re-applied every tick because reloadWidget recreates the element.
      if (el && el.style.opacity !== '1') {
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
        if (!clicked) {
          const btn = ([...doc.querySelectorAll('button, input[type="submit"]')] as HTMLElement[]).find(
            (b) => /start/i.test(b.innerText ?? (b as unknown as HTMLInputElement).value ?? ''),
          );
          if (btn) {
            btn.click();
            clicked = true;
          }
        } else {
          const orderRow = [...doc.querySelectorAll('.message-row')].find(
            (r) => marker && r.textContent?.includes(marker),
          );
          if (orderRow) {
            styleOrderRow(doc, orderRow);
            done = true;
          }
        }
      }

      if (done || ticks >= 28) {
        // Fade in — either with the styled order message, or (fallback) with
        // the prefilled form so the user can finish manually
        if (el) {
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
  // Close if open, then reboot the child — our attr_sets queue behind the
  // reload and land before the fresh start form mounts
  emit('closeWidget');
  emit('reloadWidget');
  driveWidgetForm();
  setTimeout(setPrefill, 300);
  setTimeout(() => {
    setStatusHidden(false);
    emit('showWidget');
  }, 3000);
  // Slow-boot safety net — showing an already-open widget is harmless
  setTimeout(() => emit('showWidget'), 6000);
}
