import { useEffect } from 'react';

/** Live Helper Chat widget — injects the LHC embed script once on app mount.
    Snippet generated in LHC admin → Embed code → Widget embed code (new). */
export default function LiveChatWidget() {
  useEffect(() => {
    // React StrictMode double-invokes effects in dev — bail if already injected.
    if (document.getElementById('lhc-loader')) return;

    const w = window as unknown as { LHC_API?: { args?: Record<string, unknown> } };
    w.LHC_API = w.LHC_API || {};
    w.LHC_API.args = {
      mode: 'widget',
      // Explicit https:// (not protocol-relative): on an http:// page (local
      // dev) "//" resolves to http, and the server's http→https redirect
      // doesn't carry CORS headers, so the widget's XHR would be blocked.
      lhc_base_url: 'https://chat.gdcarry.com/index.php/',
      wheight: 450,
      wwidth: 350,
      pheight: 520,
      pwidth: 500,
      domain: 'gdcarry.com',
      leaveamessage: true,
      check_messages: false,
      // No proactive invitations — the widget only opens on explicit user action
      proactive: false,
    };
    const po = document.createElement('script');
    po.id = 'lhc-loader';
    po.type = 'text/javascript';
    // No crossorigin attribute: the LHC server (Nginx) doesn't send
    // Access-Control-Allow-Origin on static files, so a CORS-mode script
    // fetch would be blocked and the widget would never start.
    po.async = true;
    const date = new Date();
    po.src =
      'https://chat.gdcarry.com/design/defaulttheme/js/widgetv2/index.js?' +
      ('' + date.getFullYear() + date.getMonth() + date.getDate());
    const s = document.getElementsByTagName('script')[0];
    s.parentNode?.insertBefore(po, s);
  }, []);

  return null;
}
