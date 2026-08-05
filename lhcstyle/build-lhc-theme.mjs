// Generates lhcstyle/gdcarry-lhc-theme.json — an importable Live Helper Chat
// widget theme matching the GD Carry site style.
// Usage: node lhcstyle/build-lhc-theme.mjs
//
// Schema notes (verified against LHC master, modules/lhtheme/import.php):
// - The import file is a FLAT object (no wrapper); unknown keys are ignored.
// - The four custom-CSS fields and native fields are top-level keys.
// - All custom-HTML fields, custom_page_css, icons_order, wwidth/wheight live
//   inside `bot_configuration`, which is a JSON-encoded STRING.

import { writeFileSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));

// Default operator image (GD dice) — imported as the theme's operator_image,
// shown in the profile strip and beside operator messages when the chatting
// operator has no photo of their own
const operatorImageData = readFileSync(join(here, '..', 'public', 'images', 'gd_favicon.png')).toString('base64');

// ---------------------------------------------------------------- SVG icons

const svgChat = (color) =>
  `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23${color}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z'/%3E%3C/svg%3E`;

const svgSend = (color) =>
  `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23${color}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='22' y1='2' x2='11' y2='13'/%3E%3Cpolygon points='22 2 15 22 11 13 2 9 22 2'/%3E%3C/svg%3E`;

const svgClose = (color) =>
  `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23${color}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='18' y1='6' x2='6' y2='18'/%3E%3Cline x1='6' y1='6' x2='18' y2='18'/%3E%3C/svg%3E`;

const svgSmile = (color) =>
  `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23${color}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Cpath d='M8 14s1.5 2 4 2 4-2 4-2'/%3E%3Cline x1='9' y1='9' x2='9.01' y2='9'/%3E%3Cline x1='15' y1='9' x2='15.01' y2='9'/%3E%3C/svg%3E`;

// ---------------------------------------------------------------- CSS blocks

const customStatusCss = `#lhc_status_container {
  background: transparent !important;
}

#status-icon {
  background: linear-gradient(135deg, #1b1b20 0%, #151519 100%) !important;
  border: 1px solid rgba(59, 130, 246, 0.35) !important;
  border-radius: 999px !important;
  box-shadow:
    0 8px 24px -8px rgba(37, 99, 235, 0.45),
    0 10px 25px -5px rgba(0, 0, 0, 0.5) !important;
}

#status-icon:hover {
  box-shadow:
    0 8px 28px -6px rgba(37, 99, 235, 0.6),
    0 10px 25px -5px rgba(0, 0, 0, 0.5) !important;
}

/* Custom chat-bubble glyph (replaces the default font icon) */
#lhc_status_container #status-icon:before {
  content: '' !important;
  display: block !important;
  width: 100% !important;
  height: 100% !important;
  background: transparent url("${svgChat('93c5fd')}") center center / 20px 20px no-repeat !important;
}

#status-icon.offline-status {
  background: #1b1b20 !important;
  border-color: #34343e !important;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5) !important;
}

#lhc_status_container #status-icon.offline-status:before {
  background-image: url("${svgChat('64748b')}") !important;
}

#unread-msg-number {
  background: #dc2626 !important;
  color: #ffffff !important;
  font-weight: 700 !important;
  font-style: normal !important;
  font-size: 12px !important;
  line-height: 22px !important;
  min-width: 22px !important;
  height: 22px !important;
  padding: 0 !important;
  text-align: center !important;
  border: none !important;
  border-radius: 999px !important;
}`;

// Raw declarations — applied directly to the chat iframe element.
const customContainerCss =
  'border: none !important; border-radius: 12px !important; overflow: hidden !important; ' +
  'box-shadow: 0 0 0 1px rgba(59,130,246,.22), 0 24px 60px -24px rgba(59,130,246,.30), 0 25px 50px -12px rgba(0,0,0,.55) !important;';

const customWidgetCss = `/* ===== GD Carry dark theme — widget interior v17 ===== */

:root { --lhc-message-padding: 7px 10px; }

/* The window never scrolls or overflows — only designated areas do */
html, body {
  height: 100% !important;
  overflow: hidden !important;
}
body { background-color: #0f0f11 !important; }
.widget-body,
.desktop-body,
.mobile-body,
.popup-body,
.start-chat,
.online-chat,
.offline-chat {
  background-color: #0f0f11 !important;
  border: none !important;
  color: #f1f5f9;
  font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
}
.widget-body {
  overflow: hidden !important;
  height: 100% !important;
  max-height: 100% !important;
}

/* Conversation area: scrollbar only when actually overflowing. Modest side
   padding — the real bubble side spacing lives on the rows themselves so it
   holds whatever container pads the list. Glow background ONLY here
   (painting it on the inner scroller too produced a visible seam with few
   messages). */
#messagesBlock {
  overflow-y: auto !important;
  overflow-x: hidden !important;
  flex: 1 1 auto !important;
  min-height: 0 !important;
  max-width: 100% !important;
  background-color: #0f0f11 !important;
  background-image:
    radial-gradient(600px 300px at 85% -10%, rgba(96, 165, 250, 0.06), transparent 60%),
    radial-gradient(450px 250px at -10% 10%, rgba(96, 165, 250, 0.04), transparent 55%);
  padding: 12px 10px 12px 10px !important;
}
#messages-scroll {
  overflow-x: hidden !important;
  background: transparent !important;
}

/* "Encrypted and private" note — lives at the top of the scrollable message
   flow and scrolls away with it */
#messages-scroll::before {
  content: 'Your conversation is encrypted and private.';
  display: block;
  text-align: center;
  font-size: 11px;
  color: #64748b;
  padding: 10px 14px 14px;
}

.message-row { max-width: 100% !important; }

/* Start-chat / offline form view:
   #id-container-fluid gets a FIXED share of the window (flex:1 inside the
   100% widget-body) — LHC resizes the iframe from this element's
   offsetHeight, which now never changes. The whole column (intro card +
   fields + button) packs to the BOTTOM, so hidden Name/E-mail fields leave
   quiet space ABOVE the intro instead of a dead gap between the intro and
   the question field. */
.start-chat #id-container-fluid,
.offline-chat #id-container-fluid {
  display: flex !important;
  flex-direction: column !important;
  flex: 1 1 auto !important;
  min-height: 0 !important;
  overflow: hidden !important;
}
.start-chat #id-container-fluid > .container-fluid,
.offline-chat #id-container-fluid > .container-fluid {
  display: flex !important;
  flex-direction: column !important;
  justify-content: flex-end !important;
  flex: 1 1 auto !important;
  min-height: 0 !important;
  overflow: hidden !important;
  padding: 4px 16px 16px !important;
}

/* Intro card gets the same side inset as the form columns (12px col padding),
   so the card is exactly as wide as the text field and the button */
.start-chat .custom-html-container,
.offline-chat .custom-html-container {
  flex: 0 1 auto !important;
  min-height: 0 !important;
  overflow-y: auto !important;
  padding: 0 12px !important;
}
/* The form no longer grows — it bottom-packs with the intro card above it
   (container is justify-content:flex-end) and scrolls itself if the fields
   ever exceed the window height */
.start-chat form,
.offline-chat form {
  display: flex !important;
  flex-direction: column !important;
  flex: 0 1 auto !important;
  min-height: 0 !important;
  margin: 0 !important;
}
.start-chat form .row.pt-2,
.offline-chat form .row.pt-2 {
  flex: 1 1 auto !important;
  min-height: 0 !important;
  overflow-y: auto !important;
  display: flex !important;
  flex-direction: column !important;
  justify-content: flex-end !important;
  margin: 0 !important;
}
.start-chat form .row.pt-2 > [class*="col"],
.offline-chat form .row.pt-2 > [class*="col"] {
  width: 100% !important;
  max-width: 100% !important;
  flex: 0 0 auto !important;
}
.start-chat form .row:last-child,
.offline-chat form .row:last-child {
  flex: 0 0 auto !important;
  margin: 4px 0 10px !important;
}

/* Name + e-mail fields stick to the top of the question field: the whole
   field group packs to the bottom of the form. margin-top:auto on the first
   column (not a growing question column) so the scroller can still reach
   the top when the form overflows. The composer is a snug one-line box,
   growing line-by-line up to 3 rows, then scrolling */
.start-chat form .row.pt-2 > [class*="col"]:first-child,
.offline-chat form .row.pt-2 > [class*="col"]:first-child {
  margin-top: auto !important;
}

/* Submit button pinned to the bottom of the form — the question composer
   grows upward (then scrolls at 3 rows), never pushes the button down. The
   form scrolls vertically if the fields overflow (x stays hidden); the
   sticky submit rides its bottom edge */
.start-chat form,
.offline-chat form {
  overflow: hidden auto !important;
}
.start-chat form .row.pt-2 > [class*="col"]:has([type="submit"]),
.offline-chat form .row.pt-2 > [class*="col"]:has([type="submit"]) {
  position: sticky !important;
  bottom: 0 !important;
  z-index: 5 !important;
  background-color: #0f0f11 !important;
}
.start-chat form .row.pt-2 > [class*="col"]:has(.form-group textarea),
.offline-chat form .row.pt-2 > [class*="col"]:has(.form-group textarea) {
  flex: 0 0 auto !important;
  display: flex !important;
  flex-direction: column !important;
  min-height: 0 !important;
}
/* The question group reserves the composer's full 3-row height up front
   (label ~24px + 76px composer) and bottom-anchors its content — the
   textarea grows into empty reserved space, so the total form height never
   changes and the Start chat button never moves */
.start-chat .form-group:has(textarea),
.offline-chat .form-group:has(textarea) {
  flex: 0 0 auto !important;
  height: 100px !important;
  display: flex !important;
  flex-direction: column !important;
  justify-content: flex-end !important;
  margin-bottom: 6px !important;
}
.start-chat .form-group textarea.form-control {
  flex: 0 0 auto !important;
  min-height: 42px !important;
  max-height: 76px !important;
  padding: 9px 12px !important;
  overflow-y: auto !important;
  resize: none !important;
  field-sizing: content;
}
.start-chat .form-group {
  margin-bottom: 6px !important;
}

/* Name + e-mail fields — single row, same height as the composer.
   (Enable both in Start chat form settings: Name = required, E-mail =
   optional; LHC validates the e-mail format server-side when filled.) */
.start-chat input[name="Username"].form-control,
.offline-chat input[name="Username"].form-control,
.start-chat input[name="Email"].form-control,
.offline-chat input[name="Email"].form-control {
  height: 42px !important;
  min-height: 42px !important;
}

/* Safety net: hides any leftover "before header" injection (gradient strip) */
.lhc-custom-header-above { display: none !important; }

/* Need-help / proactive invitation never shows inside the widget either */
.proactive-need-help,
#proactive-wrapper,
#id-invitation-height {
  display: none !important;
}

/* Rating thumbs stay hidden */
.up-vote-action,
.down-vote-action,
.up-voted,
.down-voted {
  display: none !important;
}

/* Operator strip — compact one-row badge in the site's cyan accent: small
   round avatar + name over a cyan-tinted bar (crank the rgba alphas up for
   a more solid look). In the React widget #chat-status-container itself
   carries .operator-info; the classic path injects .operator-info as a
   child (both covered). Left-aligned — the name is injected by header_html
   when the widget renders a bare centered avatar with no name. */
#lhc-profile-body:has(.operator-info),
#chat-status-container:has(.operator-info),
#chat-status-container.operator-info {
  display: flex !important;
  align-items: center !important;
  justify-content: flex-start !important;
  gap: 8px !important;
  padding: 8px 16px !important;
  text-align: left !important;
  background: rgba(59, 130, 246, 0.14) !important;
  border-bottom: 1px solid rgba(59, 130, 246, 0.35) !important;
}
.operator-info {
  display: inline-flex !important;
  align-items: center !important;
  gap: 8px !important;
  font-size: 12px !important;
  color: #93c5fd !important;
}
.operator-info img,
.op-photo img {
  width: 24px !important;
  height: 24px !important;
  border-radius: 999px !important;
  object-fit: cover !important;
  margin: 0 !important;
}
.operator-info .fw-bold,
.operator-profile-content,
.gdc-op-name {
  font-size: 12px !important;
  color: #60a5fa !important;
}

/* No operator photo? LHC falls back to .icon-assistant — restyle it as a
   small theme badge instead of hiding the whole strip */
.operator-info .icon-assistant,
.op-photo .icon-assistant {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 24px !important;
  height: 24px !important;
  border-radius: 999px !important;
  background: #1b1b20 !important;
  border: 1px solid #34343e !important;
  color: #93c5fd !important;
  font-size: 15px !important;
}

/* Operator avatar — small circle to the left of operator messages */
.profile-msg-pic {
  display: inline-flex !important;
  width: 26px !important;
  height: 26px !important;
  margin: 0 22px 0 0 !important;
  border-radius: 999px !important;
  overflow: hidden !important;
  vertical-align: bottom !important;
  flex: 0 0 auto !important;
  align-self: flex-end !important;
}
.profile-msg-pic img {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  border-radius: 999px !important;
}

/* Classic server-rendered rows nest the avatar img inside the otherwise
   hidden .chat-operators icon — re-show only the ones carrying an avatar */
.chat-operators:has(.profile-msg-pic) {
  display: inline-flex !important;
  margin: 0 22px 0 0 !important;
  vertical-align: bottom !important;
}

/* Operator rows without the avatar (chain followers, or the first row after
   the avatar was moved to the chain's last message) keep their bubble aligned
   with the avatar row: 26px avatar + 22px gap */
.message-row.message-admin:not(:has(.profile-msg-pic)) .msg-body {
  margin-left: 48px !important;
}

/* No visitor avatar — the right lane belongs to the bubble alone */
.message-row.response .profile-msg-pic,
.message-row.response .chat-operators {
  display: none !important;
}
.message-row.response { padding-right: 0 !important; }
.message-row.response .msg-body {
  margin-right: 0 !important;
}

/* Header — brand block left, close (X) right, one row, generous spacing */
#widget-header-content,
.header-chat {
  background-color: #151519 !important;
  border-bottom: 1px solid #26262e !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  flex-wrap: nowrap !important;
  flex: 0 0 auto !important;
  padding: 18px 16px 16px !important;
}
.lhc-custom-header-inside { flex: 1 1 auto !important; padding: 0 !important; }
#widget-header-content .widget-header-menu {
  flex: 0 0 auto !important;
  width: auto !important;
  max-width: none !important;
  padding: 0 0 0 10px !important;
}

/* Online/offline status line under the "Grand Dice" title */
.offline-header .gdc-status-online { display: none !important; }
.offline-header .gdc-status-offline { display: flex !important; }
.online-header .gdc-status-offline { display: none !important; }

/* Minimize control restyled as a theme-matching X (minimizes to the circle) —
   big glyph + big click target */
.header-chat .minimize-icon,
.header-chat .minimize-icon.header-link {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 40px !important;
  height: 40px !important;
  margin: -8px -10px -8px 0 !important;
  float: none !important;
}
.header-chat .minimize-icon i.material-icons { display: none !important; }
.header-chat .minimize-icon::before {
  content: '' !important;
  width: 20px !important;
  height: 20px !important;
  background: url("${svgClose('94a3b8')}") center center / contain no-repeat !important;
}
.header-chat .minimize-icon:hover::before {
  background-image: url("${svgClose('93c5fd')}") !important;
}

/* Other header controls */
.header-chat .header-link,
#headerDropDown {
  color: #94a3b8 !important;
}
.header-chat .header-link:hover,
#headerDropDown:hover {
  color: #93c5fd !important;
}
.header-chat a[title="Popup"] { display: none !important; }

/* Dropdown menus (header burger + send-area options) */
.dropdown-menu.lhc-dropdown-menu {
  background-color: #1b1b20 !important;
  border: 1px solid #26262e !important;
  border-radius: 8px !important;
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.6) !important;
}
.dropdown-menu.lhc-dropdown-menu .header-link,
.dropdown-menu.lhc-dropdown-menu .chat-setting-item,
.dropdown-menu.lhc-dropdown-menu .menu-text {
  color: #e2e8f0 !important;
}
.dropdown-menu.lhc-dropdown-menu .header-link:hover {
  color: #93c5fd !important;
}

/* Queue / pending status strip — navy gradient fading downward, centered,
   with a matching divider line at the bottom */
#lhc-profile-body,
#chat-status-container {
  background: linear-gradient(180deg, #151519 0%, rgba(21, 21, 25, 0) 100%) !important;
  border: none !important;
  border-bottom: 1px solid #26262e !important;
  color: #f1f5f9;
  padding: 14px 16px 10px !important;
  text-align: center !important;
}
.status-text {
  color: #94a3b8 !important;
  margin: 0 !important;
  text-align: center !important;
}

/* Messages area base — flush vertical rhythm: 2px between rows in both
   block (margin) and flex-column (gap) layouts, nothing between a bubble
   and its timestamp */
.message-row { margin-bottom: 2px !important; gap: 0 !important; }
#messages-scroll, #messages, #messagesBlock { gap: 2px !important; }

/* Side spacing — row-level so it holds whatever container pads the list:
   operator rows leave room for the avatar from the window's left edge,
   visitor bubbles sit a comfortable step off the right edge */
.message-row.message-admin { padding-left: 12px !important; }
.message-row.response { padding-right: 6px !important; }

/* Bubbles — smaller text, tight radius, capped width with real side
   margins, long words always wrap */
.message-row .msg-body {
  background-color: #26262e !important;
  color: #f1f5f9 !important;
  border-radius: 8px !important;
  font-size: 13px !important;
  line-height: 1.45 !important;
  position: relative !important;
  display: inline-block !important;
  max-width: 80% !important;
  min-width: 0 !important;
  overflow-wrap: anywhere !important;
  word-break: break-word !important;
}

/* Image bubbles — extra breathing room top/bottom, images never overflow */
.msg-body.msg-body-media {
  padding-top: 10px !important;
  padding-bottom: 10px !important;
}
.msg-body img {
  max-width: 100% !important;
  border-radius: 6px;
}

/* Visitor bubble — the site's blue accent gradient (#3b82f6 family) */
.message-row.response .msg-body {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%) !important;
  color: #ffffff !important;
}
.message-row.response .msg-body a { color: #dbeafe !important; }
.msg-body a, .msg-body a.link { color: #60a5fa; }

/* Delivery ticks — tiny, pinned to the bubble's bottom-right corner */
.msg-body span[class*="msg-del-st-"] {
  position: absolute !important;
  right: 5px !important;
  bottom: 2px !important;
  font-size: 9px !important;
  width: 9px !important;
  height: 9px !important;
  line-height: 9px !important;
  margin: 0 !important;
  color: rgba(255, 255, 255, 0.7) !important;
}
.msg-body:has(span[class*="msg-del-st-"]) {
  padding-right: 18px !important;
  padding-bottom: 12px !important;
}
.message-row.message-admin .msg-body span[class*="msg-del-st-"] {
  color: #64748b !important;
}
.message-row.message-admin .msg-body span.msg-del-st-3 {
  color: #60a5fa !important;
}

/* Timestamps — small and quiet; flush (2px) under the bubble, aligned to
   their sender's side, and shown only on the LAST message of each sender's
   run (before the other person replies), plus the final message */
.msg-date {
  font-size: 10px !important;
  color: #64748b !important;
  font-style: normal !important;
  margin: 2px 2px 0 !important;
  padding: 0 !important;
  line-height: 1.3 !important;
}
.message-row.response .msg-date,
#messagesBlock .message-row.response .msg-date {
  display: block !important;
  width: 100% !important;
  text-align: right !important;
  align-self: flex-end !important;
  margin-right: 4px !important;
}
.message-row.message-admin .msg-date {
  text-align: left !important;
  align-self: flex-start !important;
}
/* Timestamps under avatar-less operator rows line up with the bubble */
.message-row.message-admin:not(:has(.profile-msg-pic)) .msg-date {
  margin-left: 50px !important;
}
#messagesBlock .message-row .msg-date { display: none !important; }
#messagesBlock .message-row.response:has(+ .message-row:not(.response)) .msg-date,
#messagesBlock .message-row.message-admin:has(+ .message-row:not(.message-admin)) .msg-date,
#messagesBlock .message-row.response:last-child .msg-date,
#messagesBlock .message-row.message-admin:last-child .msg-date {
  display: block !important;
}

/* Per-message stamps LHC renders on every run-follower (.msg-date-vi /
   .msg-date-op, absolute at the row's top edge) — collapse them to the same
   last-of-run rule as .msg-date, statically placed below the bubble */
#messagesBlock .message-row .msg-date-vi,
#messagesBlock .message-row .msg-date-op {
  display: none !important;
  position: static !important;
  left: auto !important;
  right: auto !important;
  margin: 2px 2px 0 !important;
  padding: 0 !important;
  background: transparent !important;
  border: none !important;
  font-size: 10px !important;
  color: #64748b !important;
}
#messagesBlock .message-row.response:has(+ .message-row:not(.response)) .msg-date-vi,
#messagesBlock .message-row.response:last-child .msg-date-vi,
#messagesBlock .message-row.message-admin:has(+ .message-row:not(.message-admin)) .msg-date-op,
#messagesBlock .message-row.message-admin:last-child .msg-date-op {
  display: block !important;
}
#messagesBlock .message-row.response .msg-date-vi {
  text-align: right !important;
  margin-right: 4px !important;
}

/* System messages */
.system-response,
.system-response .msg-date,
.sys-tit {
  color: #64748b !important;
}

/* Typing indicator — fully suppressed, never rendered. Scoped to
   .online-chat: the start form reuses the same id for validation errors */
.online-chat #id-operator-typing {
  display: none !important;
}

/* Same id in the start/offline form = validation error — readable, no white bg */
.start-chat #id-operator-typing,
.offline-chat #id-operator-typing {
  background: transparent !important;
  color: #fca5a5 !important;
  font-size: 12px !important;
}

/* Sender name — no italics, no icon, slightly smaller */
.usr-tit,
.user-nick-title,
.op-nick-title {
  font-style: normal !important;
  font-size: 11px !important;
  color: #64748b !important;
}
.vis-icon-hld,
.usr-tit .material-icons,
.chat-operators {
  display: none !important;
}

.new-msg {
  background: #2563eb !important;
  color: #ffffff !important;
}

/* Scroll-to-bottom button — centered pill sized to its text, always on top
   of any in-widget overlay (e.g. the image download icon) */
#id-btn-bottom-scroll {
  bottom: 14px !important;
  left: 0 !important;
  right: 0 !important;
  width: max-content !important;
  max-width: 90% !important;
  margin: 0 auto !important;
  display: block !important;
  z-index: 60 !important;
}
#id-btn-bottom-scroll .btn {
  background: #26262e !important;
  color: #93c5fd !important;
  border: none !important;
  font-size: 11px !important;
  padding: 3px 9px !important;
  width: auto !important;
}

/* Send area — dark divider, no cogwheel, centered row with side padding */
.message-send-area,
.message-send-area.border-top,
.widget-body .border-top {
  background-color: #151519 !important;
  border-top: 1px solid #26262e !important;
}
.message-send-area {
  flex: 0 0 auto !important;
  align-items: center !important;
  padding: 8px 12px !important;
}
.message-send-area > .mx-auto {
  display: flex !important;
  align-items: center !important;
  margin: 0 !important;
  min-width: 0 !important;
}

/* Send button — its own fixed lane, never pushed by the growing input */
#send-button-wrapper {
  justify-content: center !important;
  align-self: center !important;
  flex: 0 0 auto !important;
  margin-left: 10px !important;
}
#ChatSendButtonContainer {
  display: flex !important;
  align-items: center !important;
  padding: 0 !important;
}
#chat-dropdown-options-wrapper { display: none !important; }

/* Widget body bottom corners square — LHC's default rounds .desktop-body
   10px, which shows below the send area at the window's bottom edge */
.widget-body,
.desktop-body {
  border-bottom-left-radius: 0 !important;
  border-bottom-right-radius: 0 !important;
}

/* Message input — one line, grows to max 3 rows, then scrolls internally;
   no resize handle. Enter sends (script in header_html), no line breaks.
   Bottom corners square — the box meets the window's bottom edge flat.
   Covers the send-area container itself and the inner wrapper at any depth —
   LHC's default rounded box is what shows below the textarea. */
.message-send-area,
.message-send-area .mx-auto,
#CSChatMessage {
  border-bottom-left-radius: 0 !important;
  border-bottom-right-radius: 0 !important;
}
#CSChatMessage {
  background-color: transparent !important;
  color: #f1f5f9 !important;
  font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
  font-size: 13px !important;
  border: none !important;
  min-height: 38px !important;
  height: auto !important;
  max-height: 72px !important;
  overflow-y: auto !important;
  resize: none !important;
  padding: 8px 10px 8px 4px !important;
  margin: 0 !important;
  field-sizing: content;
}
/* Placeholder — same formatting as the site's need-help card input */
#CSChatMessage::placeholder {
  color: #64748b !important;
  font-size: 11px !important;
  font-weight: 600 !important;
  letter-spacing: 0.05em !important;
  text-transform: uppercase !important;
}

/* No scrollbar on the message input, ever — it stays scrollable/draggable,
   just with no native bar and no overlay thumb (excluded from the custom
   scrollbar engine in header_html) */
#CSChatMessage { scrollbar-width: none !important; }
#CSChatMessage::-webkit-scrollbar { display: none !important; }

/* Send button — theme-matching paper plane in its own outlined circle;
   dimmed + inert when LHC marks it unavailable (empty input / closed chat) */
#ChatSendButtonContainer .material-icons,
.send-icon {
  font-size: 0 !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 34px !important;
  height: 34px !important;
  flex: 0 0 auto !important;
  cursor: pointer !important;
  background: #1b1b20 !important;
  border: 1px solid rgba(59, 130, 246, 0.35) !important;
  border-radius: 999px !important;
}
.send-icon.text-muted-light {
  opacity: 0.45 !important;
  pointer-events: none !important;
}
#ChatSendButtonContainer .material-icons::before,
.send-icon::before {
  content: '' !important;
  width: 16px !important;
  height: 16px !important;
  background: url("${svgSend('60a5fa')}") center center / contain no-repeat !important;
}
#ChatSendButtonContainer .material-icons:hover,
.send-icon:hover {
  border-color: rgba(59, 130, 246, 0.6) !important;
}
#ChatSendButtonContainer .material-icons:hover::before,
.send-icon:hover::before {
  background-image: url("${svgSend('93c5fd')}") !important;
}
.record-icon,
.direct-icon {
  color: #60a5fa !important;
}

/* Emoji button + picker (engine in header_html) — smiley left of the chat
   input, panel pops above the send area */
.gdc-emoji-btn {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 34px !important;
  height: 34px !important;
  flex: 0 0 auto !important;
  margin: 0 2px 0 0 !important;
  padding: 0 !important;
  background: transparent !important;
  border: none !important;
  border-radius: 999px !important;
  cursor: pointer !important;
}
.gdc-emoji-btn img {
  width: 20px !important;
  height: 20px !important;
  opacity: 0.75;
}
.gdc-emoji-btn:hover img { opacity: 1; }
.gdc-emoji-panel {
  position: fixed !important;
  z-index: 90 !important;
  display: grid !important;
  grid-template-columns: repeat(6, 1fr) !important;
  gap: 2px !important;
  padding: 8px !important;
  background: #1b1b20 !important;
  border: 1px solid #26262e !important;
  border-radius: 8px !important;
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.6) !important;
}
.gdc-emoji-panel button {
  width: 32px !important;
  height: 32px !important;
  font-size: 18px !important;
  line-height: 1 !important;
  padding: 0 !important;
  background: transparent !important;
  border: none !important;
  border-radius: 5px !important;
  cursor: pointer !important;
}
.gdc-emoji-panel button:hover { background: #26262e !important; }

/* Start-chat / offline form fields */
.form-group { margin-bottom: 14px !important; }
.control-label,
.form-check-label {
  color: #94a3b8 !important;
  font-size: 12px;
  margin-bottom: 6px !important;
}
/* Required-field asterisk (wrapped by the header_html observer) — theme blue */
.gdc-req { color: #60a5fa !important; }
.form-control,
.form-select {
  background-color: #1b1b20 !important;
  border: 1px solid #34343e !important;
  color: #f1f5f9 !important;
  font-size: 13px !important;
  border-radius: 5px !important;
}
textarea.form-control {
  min-height: 40px !important;
  height: auto !important;
  max-height: 76px !important;
  overflow-y: auto !important;
  resize: none !important;
  field-sizing: content;
}
.form-control:focus,
.form-select:focus {
  background-color: #1b1b20 !important;
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.22) !important;
  color: #f1f5f9 !important;
}
.form-control::placeholder { color: #64748b !important; }
.form-control.is-invalid { border-color: #dc2626 !important; }
.offline-intro { color: #f1f5f9 !important; }

/* Submit buttons — the site's purchase-cta look, full width */
.start-chat .btn-secondary[type="submit"],
.offline-chat .btn-secondary[type="submit"],
form .btn-secondary[type="submit"] {
  background: linear-gradient(90deg, #60a5fa, #2563eb) !important;
  border: none !important;
  border-radius: 5px !important;
  color: #0f0f11 !important;
  font-family: 'Sora', 'Inter', ui-sans-serif, sans-serif;
  font-weight: 700;
  font-size: 14px;
  width: 100% !important;
  padding: 12px 18px !important;
  margin: 0 !important;
  box-shadow:
    0 10px 30px -10px rgba(37, 99, 235, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.18);
}
form .btn-secondary[type="submit"]:hover { filter: brightness(1.1); }
.start-chat form .row:last-child .col-12,
.offline-chat form .row:last-child .col-12 {
  padding-bottom: 0 !important;
}
.btn-link { color: #60a5fa !important; }

/* Footer strip — hidden everywhere EXCEPT the live conversation view
   (body:has works no matter where LHC mounts the footer element) */
.lhc-custom-footer-below {
  display: none !important;
}
body:has(.online-chat) .lhc-custom-footer-below {
  display: block !important;
  background-color: #0f0f11 !important;
  border-top: 1px solid #26262e !important;
  flex: 0 0 auto !important;
  box-sizing: border-box !important;
  width: 100vw !important;
  max-width: 100vw !important;
  margin: 0 calc(50% - 50vw) !important;
  padding: 0 !important;
}

/* Error alerts */
.alert-danger {
  background-color: rgba(220, 38, 38, 0.12) !important;
  border: 1px solid rgba(220, 38, 38, 0.4) !important;
  color: #fca5a5 !important;
  border-radius: 5px;
}

/* Scrollbars — the site's style: thin navy pill, transparent track, and NO
   arrow buttons anywhere (desktop + mobile) */
* { scrollbar-width: thin !important; scrollbar-color: #3a3a46 transparent; }
::-webkit-scrollbar { width: 10px; height: 10px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-button,
::-webkit-scrollbar-button:vertical:start:decrement,
::-webkit-scrollbar-button:vertical:start:increment,
::-webkit-scrollbar-button:vertical:end:decrement,
::-webkit-scrollbar-button:vertical:end:increment,
::-webkit-scrollbar-button:horizontal:start:decrement,
::-webkit-scrollbar-button:horizontal:start:increment,
::-webkit-scrollbar-button:horizontal:end:decrement,
::-webkit-scrollbar-button:horizontal:end:increment {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
}
::-webkit-scrollbar-corner { background: transparent !important; }
::-webkit-scrollbar-thumb {
  background: #3a3a46;
  border-radius: 999px;
  border: 2px solid transparent;
  background-clip: padding-box;
}
::-webkit-scrollbar-thumb:hover {
  background: #52525f;
  border: 2px solid transparent;
  background-clip: padding-box;
}

/* Custom JS overlay scrollbar (engine in header_html): once active, native
   bars are fully hidden — Windows Chrome's Fluent scrollbar ignores
   ::-webkit-scrollbar-button and cannot be de-arrowed with CSS alone */
html.gdc-cscroll * { scrollbar-width: none !important; }
html.gdc-cscroll ::-webkit-scrollbar { display: none !important; }
.gdc-scroll-thumb {
  position: fixed;
  width: 6px;
  border-radius: 999px;
  background: #3a3a46;
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 80;
}
.gdc-scroll-thumb:hover,
.gdc-scroll-thumb.gdc-drag {
  background: #52525f;
}
.gdc-scroll-thumb.gdc-visible { opacity: 1; }`;

const popupExtra = `body {
  background-color: #0f0f11 !important;
  border: none !important;
  color: #f1f5f9;
  font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
}`;

const customPopupCss = customWidgetCss + '\n\n' + popupExtra;

const customPageCss = `#lhc_container_v2 #lhc_status_widget_v2 {
  bottom: 20px !important;
  right: 20px !important;
}

#lhc_container_v2 #lhc_widget_v2 {
  bottom: 20px !important;
  right: 20px !important;
  border: 0 !important;
  border-radius: 12px !important;
  overflow: hidden !important;
  max-width: 100vw !important;
  max-height: 100dvh !important;
  box-shadow:
    0 0 0 1px rgba(59, 130, 246, 0.22),
    0 24px 60px -24px rgba(59, 130, 246, 0.30),
    0 25px 50px -12px rgba(0, 0, 0, 0.55) !important;
}

/* Need-help widget fully suppressed */
#lhc_container_v2 #lhc_needhelp_widget_v2 {
  display: none !important;
}

/* Mobile: widget goes full-screen so it can never overflow the viewport */
@media (max-width: 520px) {
  #lhc_container_v2 #lhc_widget_v2 {
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    width: 100vw !important;
    max-width: 100vw !important;
    height: 100dvh !important;
    max-height: 100dvh !important;
    border-radius: 0 !important;
  }

  #lhc_container_v2 #lhc_status_widget_v2 {
    bottom: 16px !important;
    right: 16px !important;
  }
}`;

// ---------------------------------------------------------------- HTML blocks

// Intro block — centered, no card chrome: bare chat icon on top, tagline,
// then the reply-time line
const introCardOperator = `<div style="margin:16px 0 0;padding:8px 16px;text-align:center;">
  <img src="${svgChat('93c5fd')}" alt="" style="width:28px;height:28px;display:inline-block;">
  <p style="margin:10px 0 0;font-size:13px;line-height:1.5;color:#f1f5f9;">Tell us your personalized custom order</p>
  <div style="font-size:12px;color:#93c5fd;margin-top:2px;">Average reply: under 5 mins</div>
</div>`;

const introCardBot = `<div style="margin:16px 0 0;padding:8px 16px;text-align:center;">
  <img src="${svgChat('93c5fd')}" alt="" style="width:28px;height:28px;display:inline-block;">
  <p style="margin:10px 0 0;font-size:13px;line-height:1.5;color:#f1f5f9;">Tell us your personalized custom order</p>
  <div style="font-size:12px;color:#93c5fd;margin-top:2px;">Instant answers, 24/7</div>
</div>`;

const headerIdentity = `<div style="display:flex;align-items:center;gap:10px;">
  <img src="https://gdcarry.com/images/gd_favicon.png" alt="" style="width:32px;height:32px;border-radius:8px;">
  <div style="line-height:1.3;">
    <div style="font-family:Sora,Inter,sans-serif;font-weight:700;font-size:14px;color:#f1f5f9;">Grand Dice</div>
    <div class="gdc-status gdc-status-online" style="display:flex;align-items:center;gap:5px;font-size:11px;color:#94a3b8;"><span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#22c55e;"></span>Live support online</div>
    <div class="gdc-status gdc-status-offline" style="display:none;align-items:center;gap:5px;font-size:11px;color:#94a3b8;"><span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#eab308;"></span>Live support offline</div>
  </div>
</div>`;

const footerHtml = `<div style="padding:8px 12px;text-align:center;font-size:11px;color:#64748b;">
  Professional boosting &bull; <a href="https://gdcarry.com" target="_blank" rel="noopener" style="color:#60a5fa;text-decoration:none;">gdcarry.com</a>
</div>`;

const introMessageHtml = `<div style="padding:12px 14px;border-radius:10px;background:#1b1b20;border:1px solid #26262e;"><div style="font-family:Sora,Inter,sans-serif;font-weight:700;color:#93c5fd;font-size:13px;margin-bottom:4px;">Welcome to Grand Dice</div><div style="color:#f1f5f9;font-size:13px;line-height:1.5;">Hey! Tell me what you're playing and what you need — I'll get you a quote and an ETA right away.</div></div>`;

// Fonts + scripts:
// 1. Enter-to-send: capture-phase listener intercepts Enter (no Shift) in the
//    chat input before React sees it and clicks the send button.
// 2. Name-field label: start chat form settings must enable the Name field
//    (visible + required); this observer just renames its label, and keeps
//    the label correct across React re-renders.
const headerHtml = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&amp;family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet">
<script>
document.addEventListener('keydown', function (e) {
  if (e.key === 'Enter' && !e.shiftKey && e.target && e.target.id === 'CSChatMessage') {
    e.preventDefault();
    e.stopPropagation();
    var btn = document.querySelector('#ChatSendButtonContainer a') || document.querySelector('.send-icon');
    if (btn) btn.click();
  }
}, true);

new MutationObserver(function () {
  var input = document.querySelector('.start-chat input[name="Username"], .offline-chat input[name="Username"]');
  if (input) {
    var group = input.closest('.form-group');
    var lbl = group && group.querySelector('.control-label');
    if (lbl && lbl.textContent !== 'Your name (or Discord username)*') {
      lbl.textContent = 'Your name (or Discord username)*';
    }
  }
  /* Required-field asterisks — wrapped in a span so CSS can paint them blue.
     Idempotent: labels already containing .gdc-req are skipped */
  document.querySelectorAll('.start-chat .control-label, .offline-chat .control-label').forEach(function (l) {
    if (l.querySelector('.gdc-req') || l.textContent.indexOf('*') === -1) return;
    var parts = l.textContent.split('*');
    l.textContent = '';
    parts.forEach(function (part, i) {
      if (i > 0) {
        var s = document.createElement('span');
        s.className = 'gdc-req';
        s.textContent = '*';
        l.appendChild(s);
      }
      if (part) l.appendChild(document.createTextNode(part));
    });
  });
}).observe(document.documentElement, { childList: true, subtree: true });

/* Smooth scroll-to-bottom (capture phase, beats React's instant jump) */
document.addEventListener('click', function (e) {
  var pill = e.target && e.target.closest ? e.target.closest('#id-btn-bottom-scroll') : null;
  if (pill) {
    e.preventDefault();
    e.stopPropagation();
    var m = document.getElementById('messagesBlock') || document.getElementById('messages-scroll');
    if (m) m.scrollTo({ top: m.scrollHeight, behavior: 'smooth' });
  }
}, true);

/* Custom overlay scrollbar — same look as the site's; native bars get
   hidden via html.gdc-cscroll (Windows Chrome Fluent scrollbars ignore
   ::-webkit-scrollbar-button, so CSS alone can't remove their arrows).
   The chat input is NOT a host — it must stay scrollable with no bar at all */
(function () {
  var hosts = ['#messagesBlock', '#messages-scroll', '#messages', '.start-chat textarea.form-control'];
  function attach(host) {
    if (host.__gdcSb) return;
    host.__gdcSb = true;
    document.documentElement.classList.add('gdc-cscroll');
    var thumb = document.createElement('div');
    thumb.className = 'gdc-scroll-thumb';
    document.body.appendChild(thumb);
    var hideT = null;
    function update() {
      if (!host.isConnected) { thumb.remove(); return; }
      var r = host.getBoundingClientRect();
      var sh = host.scrollHeight, st = host.scrollTop;
      if (sh <= r.height + 1 || r.height === 0) { thumb.classList.remove('gdc-visible'); return; }
      var ratio = r.height / sh;
      thumb.style.height = Math.max(r.height * ratio, 24) + 'px';
      thumb.style.top = (r.top + st * ratio) + 'px';
      thumb.style.left = (r.right - 7) + 'px';
      thumb.classList.add('gdc-visible');
      clearTimeout(hideT);
      hideT = setTimeout(function () { thumb.classList.remove('gdc-visible'); }, 1200);
    }
    host.addEventListener('scroll', update, { passive: true });
    host.addEventListener('mouseenter', update);
    new ResizeObserver(update).observe(host);
    thumb.addEventListener('mousedown', function (e) {
      e.preventDefault();
      thumb.classList.add('gdc-drag');
      var y0 = e.clientY, s0 = host.scrollTop;
      var ratio = host.getBoundingClientRect().height / host.scrollHeight;
      function mv(ev) { host.scrollTop = s0 + (ev.clientY - y0) / ratio; }
      function up() {
        thumb.classList.remove('gdc-drag');
        document.removeEventListener('mousemove', mv);
        document.removeEventListener('mouseup', up);
      }
      document.addEventListener('mousemove', mv);
      document.addEventListener('mouseup', up);
    });
    update();
  }
  new MutationObserver(function () {
    hosts.forEach(function (sel) {
      var el = document.querySelector(sel);
      if (el) attach(el);
    });
  }).observe(document.documentElement, { childList: true, subtree: true });
})();

/* Emoji picker — smiley button left of the chat input, theme-matched panel.
   Re-attached via observer (React re-renders the send area). The value is
   set through the native setter so React actually picks the emoji up. */
(function () {
  var EMOJIS = ['\u{1F600}','\u{1F602}','\u{1F642}','\u{1F609}','\u{1F60D}','\u{1F60E}','\u{1F914}','\u{1F605}','\u{1F62D}','\u{1F44D}','\u{1F64F}','\u{1F44F}','\u{1F525}','\u{1F389}','\u{1F4AF}','\u{2764}\u{FE0F}','\u{2694}\u{FE0F}','\u{1F3C6}','\u{1F4B0}','\u{1F3AE}','\u{2705}','\u{1F680}','\u{1F4AA}','\u{1F91D}'];
  var SMILE = "${svgSmile('94a3b8')}";
  var panel = null;
  function closePanel() { if (panel) { panel.remove(); panel = null; } }
  function insertEmoji(ta, emoji) {
    var s = ta.selectionStart == null ? ta.value.length : ta.selectionStart;
    var e = ta.selectionEnd == null ? s : ta.selectionEnd;
    var next = ta.value.slice(0, s) + emoji + ta.value.slice(e);
    var proto = ta instanceof HTMLInputElement
      ? window.HTMLInputElement.prototype
      : window.HTMLTextAreaElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(ta, next);
    ta.dispatchEvent(new Event('input', { bubbles: true }));
    ta.focus();
    var pos = s + emoji.length;
    try { ta.setSelectionRange(pos, pos); } catch (err) {}
  }
  function togglePanel(btn, ta) {
    if (panel) { closePanel(); return; }
    panel = document.createElement('div');
    panel.className = 'gdc-emoji-panel';
    EMOJIS.forEach(function (em) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = em;
      b.addEventListener('click', function (ev) {
        ev.preventDefault();
        insertEmoji(ta, em);
        closePanel();
      });
      panel.appendChild(b);
    });
    document.body.appendChild(panel);
    var r = btn.getBoundingClientRect();
    panel.style.left = Math.max(4, Math.min(r.left, window.innerWidth - panel.offsetWidth - 4)) + 'px';
    panel.style.bottom = (window.innerHeight - r.top + 6) + 'px';
  }
  function attach() {
    var ta = document.getElementById('CSChatMessage');
    if (!ta) return;
    var area = ta.closest('.message-send-area');
    var row = area && area.querySelector('.mx-auto');
    if (!row || row.querySelector('.gdc-emoji-btn')) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'gdc-emoji-btn';
    btn.setAttribute('aria-label', 'Insert emoji');
    btn.innerHTML = '<img src="' + SMILE + '" alt="">';
    btn.addEventListener('click', function (ev) {
      ev.preventDefault();
      ev.stopPropagation();
      togglePanel(btn, ta);
    });
    row.insertBefore(btn, row.firstChild);
  }
  document.addEventListener('click', function (e) {
    if (panel && !(e.target.closest && (e.target.closest('.gdc-emoji-panel') || e.target.closest('.gdc-emoji-btn')))) {
      closePanel();
    }
  }, true);
  new MutationObserver(attach).observe(document.documentElement, { childList: true, subtree: true });
  attach();
})();

/* Live fixes — one observer (+ a slow interval safety net for anything the
   observer misses):
   1. Operator avatar pinned to the LAST message of each operator chain (LHC
      renders it on the first). Rows left without the avatar stay aligned via
      the .message-admin:not(:has(.profile-msg-pic)) indent in the CSS.
   2. Timestamps trimmed to no year, no seconds, whatever LHC emits.
   3. Operator strip: the React widget can render a bare centered avatar with
      no name — inject the operator's name (first operator nick in the
      conversation, else 'Grand Dice'). */
(function () {
  var moving = false;
  function fixAvatars() {
    if (moving) return;
    document.querySelectorAll('#messagesBlock .message-row.message-admin').forEach(function (row) {
      var pic = row.querySelector('.profile-msg-pic');
      if (!pic) return;
      var last = row;
      while (last.nextElementSibling && last.nextElementSibling.matches('.message-row.message-admin')) {
        last = last.nextElementSibling;
      }
      if (last === row) return;
      var host = pic.closest('.chat-operators') || pic;
      var anchor = last.querySelector('.msg-body');
      moving = true;
      last.insertBefore(host, anchor || last.firstChild);
      moving = false;
    });
  }
  function fixTimestamps() {
    // Trim year/seconds, then collapse runs of identical timestamps: only
    // the first message of a same-minute run keeps its stamp (inline
    // !important so it beats the per-run display rules in the CSS)
    var lastText = null;
    document.querySelectorAll('.msg-date').forEach(function (el) {
      var t = el.textContent;
      var nt = t.replace(/^\s*\d{4}[-/]/, '').replace(/(:\d{2}):\d{2}(\s*(?:[AP]M|am|pm))?\s*$/, '$1$2');
      if (nt !== t) el.textContent = nt;
      var visible = el.offsetParent !== null;
      if (!visible) { lastText = null; return; }
      if (nt.trim() !== '' && nt.trim() === lastText) {
        el.style.setProperty('display', 'none', 'important');
      } else {
        el.style.removeProperty('display');
        lastText = nt.trim();
      }
    });
  }
  function fixStrip() {
    var strip = document.querySelector('#chat-status-container.operator-info, #chat-status-container .operator-info, #lhc-profile-body .operator-info');
    if (!strip || (strip.textContent || '').trim() !== '') return;
    var nick = document.querySelector('.message-row.message-admin .op-nick-title, .op-nick-title');
    var name = ((nick && nick.textContent) || 'Grand Dice').trim();
    var span = document.createElement('span');
    span.className = 'gdc-op-name';
    span.textContent = name;
    strip.appendChild(span);
  }
  function fix() { fixAvatars(); fixTimestamps(); fixStrip(); }
  new MutationObserver(fix).observe(document.documentElement, { childList: true, subtree: true });
  setInterval(fix, 1500);
  fix();
})();
</script>`;

// ---------------------------------------------------------------- Theme object

const botConfiguration = {
  icons_order: 'right_min',
  wwidth: '370',
  wheight: '520',
  show_ts: '1',
  show_ts_below: '1',
  uprev: '1',
  // Operator avatars inside message rows (classic rows read this; the React
  // widget also gets profile_pic from the site's embed args)
  bubble_style_profile: '1',
  // The script rides along inside the raw-rendered custom HTML fields:
  // header_html is only served to the React (v2) widget, which injects it
  // via innerHTML — inert. In the CLASSIC widget (theme option "Use a new
  // widget look for old embed code" = load_w2 OFF) these custom_html fields
  // are echoed unescaped into the chat iframe, where the script executes.
  custom_html_widget: introCardOperator + headerHtml,
  custom_html: introCardOperator + headerHtml,
  custom_html_widget_bot: introCardBot + headerHtml,
  custom_html_bot: introCardBot + headerHtml,
  custom_html_header: '',
  custom_html_header_body: headerIdentity,
  custom_html_footer: footerHtml,
  pre_chat_html: '',
  pre_offline_chat_html: '',
  after_chat_status: '',
  intro_message_html: introMessageHtml,
  header_html: headerHtml,
  custom_page_css: customPageCss,
};

const theme = {
  name: 'GD Carry Dark',
  alias: 'gdcarry-dark',
  widget_border_color: '26262e',
  widget_border_width: '0',
  header_background: '151519',
  header_height: '64',
  header_padding: '14',
  hide_popup: '1',
  hide_ts: '3',
  hide_op_ts: '1',
  show_voting: '0',
  buble_visitor_background: '2563eb',
  buble_visitor_title_color: 'bfdbfe',
  buble_visitor_text_color: 'ffffff',
  buble_operator_background: '26262e',
  buble_operator_title_color: '93c5fd',
  buble_operator_text_color: 'f1f5f9',
  custom_status_css: customStatusCss,
  custom_container_css: customContainerCss,
  custom_widget_css: customWidgetCss,
  custom_popup_css: customPopupCss,
  operator_image_data: operatorImageData,
  operator_image_data_ext: 'png',
  bot_configuration: JSON.stringify(botConfiguration),
};

const outPath = join(here, 'gdcarry-lhc-theme.json');
writeFileSync(outPath, JSON.stringify(theme, null, 2) + '\n', 'utf8');
console.log(`Wrote ${outPath}`);
