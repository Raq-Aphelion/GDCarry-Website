// Generates docs/gdcarry-lhc-theme.json — an importable Live Helper Chat
// widget theme matching the GD Carry site style.
// Usage: node docs/build-lhc-theme.mjs
//
// Schema notes (verified against LHC master, modules/lhtheme/import.php):
// - The import file is a FLAT object (no wrapper); unknown keys are ignored.
// - The four custom-CSS fields and native fields are top-level keys.
// - All custom-HTML fields, custom_page_css, icons_order, wwidth/wheight live
//   inside `bot_configuration`, which is a JSON-encoded STRING.

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------- SVG icons

const svgChat = (color) =>
  `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23${color}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z'/%3E%3C/svg%3E`;

const svgSend = (color) =>
  `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23${color}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='22' y1='2' x2='11' y2='13'/%3E%3Cpolygon points='22 2 15 22 11 13 2 9 22 2'/%3E%3C/svg%3E`;

const svgClose = (color) =>
  `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23${color}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='18' y1='6' x2='6' y2='18'/%3E%3Cline x1='6' y1='6' x2='18' y2='18'/%3E%3C/svg%3E`;

// ---------------------------------------------------------------- CSS blocks

const customStatusCss = `#lhc_status_container {
  background: transparent !important;
}

#status-icon {
  background: linear-gradient(135deg, #1b1b20 0%, #151519 100%) !important;
  border: 1px solid rgba(59, 130, 246, 0.35) !important;
  border-radius: 999px !important;
  box-shadow:
    0 0 0 1px rgba(59, 130, 246, 0.22),
    0 8px 24px -8px rgba(37, 99, 235, 0.45),
    0 10px 25px -5px rgba(0, 0, 0, 0.5) !important;
}

#status-icon:hover {
  box-shadow:
    0 0 0 1px rgba(59, 130, 246, 0.4),
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
  background: linear-gradient(90deg, #60a5fa, #2563eb) !important;
  color: #0f0f11 !important;
  font-weight: 700 !important;
  border: none !important;
}`;

// Raw declarations — applied directly to the chat iframe element.
const customContainerCss =
  'border: none !important; border-radius: 12px !important; overflow: hidden !important; ' +
  'box-shadow: 0 0 0 1px rgba(59,130,246,.22), 0 24px 60px -24px rgba(59,130,246,.30), 0 25px 50px -12px rgba(0,0,0,.55) !important;';

const customWidgetCss = `/* ===== GD Carry dark theme — widget interior v9 ===== */

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

/* Conversation area: always-on styled scrollbar (desktop AND mobile),
   generous side padding, glow background ONLY here (painting it on the
   inner scroller too produced a visible seam with few messages). */
#messagesBlock {
  overflow-y: scroll !important;
  overflow-x: hidden !important;
  flex: 1 1 auto !important;
  min-height: 0 !important;
  max-width: 100% !important;
  background-color: #0f0f11 !important;
  background-image:
    radial-gradient(600px 300px at 85% -10%, rgba(96, 165, 250, 0.06), transparent 60%),
    radial-gradient(450px 250px at -10% 10%, rgba(96, 165, 250, 0.04), transparent 55%);
  padding: 12px 22px !important;
}
#messages-scroll {
  overflow-x: hidden !important;
  background: transparent !important;
}

/* "Encrypted and private" note — lives at the top of the scrollable message
   flow and scrolls away with it (replaces the theme's after-status field,
   which rendered as a fixed background strip behind the messages) */
#messages-scroll::before {
  content: 'Your conversation is encrypted and private.';
  display: block;
  text-align: center;
  font-size: 11px;
  color: #64748b;
  padding: 2px 14px 8px;
}

.message-row { max-width: 100% !important; }

/* Start-chat / offline form view:
   #id-container-fluid gets a FIXED share of the window (flex:1 inside the
   100% widget-body). This also fixes the "window stretches when typing" bug —
   LHC resizes the iframe from this element's offsetHeight, which now never
   changes. The form fields + button are pinned to the bottom above the
   footer; the intro card area is the flexible/scrollable middle. */
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
.start-chat form,
.offline-chat form {
  display: flex !important;
  flex-direction: column !important;
  flex: 1 1 auto !important;
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

/* The question column fills the middle; the composer is a snug one-line box
   pinned to the bottom that grows line-by-line with the input. Its growth
   is capped and the fields row scrolls, so it can never overlap the card. */
.start-chat form .row.pt-2 > [class*="col"]:has(.form-group textarea) {
  flex: 1 1 auto !important;
  display: flex !important;
  flex-direction: column !important;
  min-height: 0 !important;
}
.start-chat .form-group:has(textarea) {
  flex: 1 1 auto !important;
  display: flex !important;
  flex-direction: column !important;
  justify-content: flex-end !important;
  margin-bottom: 6px !important;
}
.start-chat .form-group textarea.form-control {
  flex: 0 0 auto !important;
  min-height: 42px !important;
  max-height: 110px !important;
  padding: 9px 12px !important;
  overflow-y: auto !important;
  resize: none !important;
  field-sizing: content;
}
.start-chat .form-group {
  margin-bottom: 6px !important;
}

/* Name field — single row, same height as the composer */
.start-chat input[name="Username"].form-control,
.offline-chat input[name="Username"].form-control {
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

/* Operator/assistant profile block — gone entirely: the block itself, the
   whole profile strip whenever it contains one (photo or assistant icon),
   sender avatars in the message flow, and the rating thumbs */
.operator-info,
.up-vote-action,
.down-vote-action,
.up-voted,
.down-voted,
.profile-msg-pic {
  display: none !important;
}
#lhc-profile-body:has(.operator-info),
#lhc-profile-body:has(.op-photo),
#lhc-profile-body:has(.icon-assistant) {
  display: none !important;
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

/* Queue / pending status strip — navy at the top, fading to transparent
   at the bottom, centered, no divider lines */
#lhc-profile-body,
#chat-status-container {
  background: linear-gradient(180deg, #151519 0%, rgba(21, 21, 25, 0) 100%) !important;
  border: none !important;
  border-bottom: none !important;
  color: #f1f5f9;
  padding: 14px 16px 10px !important;
  text-align: center !important;
}
.status-text {
  color: #94a3b8 !important;
  margin: 0 !important;
  text-align: center !important;
}

/* Messages area base */
.message-row { margin-bottom: 10px !important; }

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

/* Visitor bubble — site CTA gradient */
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

/* Timestamps — small and quiet; shown only on the LAST message of each
   sender's run (before the other person replies), plus the final message.
   Requires the theme's timestamp options enabled (show below message). */
.msg-date {
  font-size: 10px !important;
  color: #64748b !important;
  font-style: normal !important;
  margin: 2px 2px 0 !important;
}
#messagesBlock .message-row .msg-date { display: none !important; }
#messagesBlock .message-row.response:has(+ .message-row:not(.response)) .msg-date,
#messagesBlock .message-row.message-admin:has(+ .message-row:not(.message-admin)) .msg-date,
#messagesBlock .message-row.response:last-child .msg-date,
#messagesBlock .message-row.message-admin:last-child .msg-date {
  display: block !important;
}

/* System messages, typing indicator */
.system-response,
.system-response .msg-date,
.sys-tit {
  color: #64748b !important;
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

#id-operator-typing {
  background: #0f0f11 !important;
  color: #94a3b8 !important;
}
.new-msg {
  background: #2563eb !important;
  color: #ffffff !important;
}

/* Scroll-to-bottom button — lifted up, smaller label */
#id-btn-bottom-scroll {
  bottom: 14px !important;
}
#id-btn-bottom-scroll .btn {
  background: #26262e !important;
  color: #93c5fd !important;
  border: none !important;
  font-size: 11px !important;
  padding: 3px 9px !important;
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

/* Message input — one line, grows to max 3 rows, then scrolls internally
   with a visible scrollbar; no resize handle. Enter sends (script in
   header_html), no line breaks. */
#CSChatMessage {
  background-color: transparent !important;
  color: #f1f5f9 !important;
  font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
  font-size: 13px !important;
  border: none !important;
  min-height: 38px !important;
  height: auto !important;
  max-height: 72px !important;
  overflow-y: scroll !important;
  resize: none !important;
  padding: 8px 4px !important;
  margin: 0 !important;
  field-sizing: content;
}
#CSChatMessage::placeholder { color: #94a3b8 !important; }

/* Send button — theme-matching paper plane in its own outlined circle */
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

/* Start-chat / offline form fields */
.form-group { margin-bottom: 14px !important; }
.control-label,
.form-check-label {
  color: #94a3b8 !important;
  font-size: 12px;
  margin-bottom: 6px !important;
}
.form-control,
.form-select {
  background-color: #1b1b20 !important;
  border: 1px solid #34343e !important;
  color: #f1f5f9 !important;
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
.form-control::placeholder { color: #94a3b8 !important; }
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

/* Footer strip — opaque, pinned to the bottom, bled to the window edges
   (the 50% - 50vw margins cancel any parent padding, killing the
   transparent side strips) */
.lhc-custom-footer-below {
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

/* Scrollbars — same as the site, visible everywhere (desktop + mobile) */
* { scrollbar-width: thin !important; scrollbar-color: #3a3a46 transparent; }
::-webkit-scrollbar { width: 10px; height: 10px; }
::-webkit-scrollbar-track { background: transparent; }
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
}`;

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

/* Need-help widget fully suppressed (also disabled server-side — see notes) */
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

const chatBadgeIcon = `<div style="width:34px;height:34px;border-radius:999px;background:linear-gradient(135deg,#1b1b20 0%,#151519 100%);border:1px solid rgba(59,130,246,.35);display:flex;align-items:center;justify-content:center;flex-shrink:0;"><img src="${svgChat('93c5fd')}" alt="" style="width:18px;height:18px;"></div>`;

const introCardOperator = `<div style="margin:16px 0 0;padding:16px;border:1px solid #26262e;border-radius:8px;background:linear-gradient(180deg,rgba(38,38,46,.35),#151519 55%);box-shadow:0 0 0 1px rgba(59,130,246,.12);">
  <div style="display:flex;align-items:center;gap:14px;">
    ${chatBadgeIcon}
    <div style="line-height:1.2;">
      <div style="font-family:Sora,Inter,sans-serif;font-weight:700;font-size:15px;color:#f1f5f9;">Chat with Grand Dice</div>
      <div style="font-size:12px;color:#93c5fd;margin-top:1px;">Average reply under 5 mins</div>
    </div>
  </div>
  <p style="margin:10px 0 0;font-size:12px;line-height:1.5;color:#94a3b8;">Tell us your game and what you need — raids, dungeons, leveling, coaching. Our staff will reach out to you.</p>
</div>`;

const introCardBot = `<div style="margin:16px 0 0;padding:16px;border:1px solid #26262e;border-radius:8px;background:linear-gradient(180deg,rgba(38,38,46,.35),#151519 55%);box-shadow:0 0 0 1px rgba(59,130,246,.12);">
  <div style="display:flex;align-items:center;gap:14px;">
    ${chatBadgeIcon}
    <div style="line-height:1.2;">
      <div style="font-family:Sora,Inter,sans-serif;font-weight:700;font-size:15px;color:#f1f5f9;">Grand Dice Assistant</div>
      <div style="font-size:12px;color:#93c5fd;margin-top:1px;">Instant answers, 24/7</div>
    </div>
  </div>
  <p style="margin:10px 0 0;font-size:12px;line-height:1.5;color:#94a3b8;">Our assistant will collect the details first — our staff will reach out to you.</p>
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
}).observe(document.documentElement, { childList: true, subtree: true });
</script>`;

// ---------------------------------------------------------------- Theme object

const botConfiguration = {
  icons_order: 'right_min',
  wwidth: '370',
  wheight: '520',
  show_ts: '1',
  show_ts_below: '1',
  custom_html_widget: introCardOperator,
  custom_html: introCardOperator,
  custom_html_widget_bot: introCardBot,
  custom_html_bot: introCardBot,
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
  bot_configuration: JSON.stringify(botConfiguration),
};

const outPath = join(here, 'gdcarry-lhc-theme.json');
writeFileSync(outPath, JSON.stringify(theme, null, 2) + '\n', 'utf8');
console.log(`Wrote ${outPath}`);
