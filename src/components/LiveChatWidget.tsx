import { useEffect } from 'react';

/** Live Helper Chat widget — injects the LHC embed script once on app mount.
    Snippet generated in LHC admin → Embed code → Widget embed code (new). */
export default function LiveChatWidget() {
  useEffect(() => {
    const w = window as unknown as { LHC_API?: { args?: Record<string, unknown> } };
    w.LHC_API = w.LHC_API || {};
    w.LHC_API.args = {
      mode: 'widget',
      lhc_base_url: '//chat.gdcarry.com/index.php/',
      wheight: 450,
      wwidth: 350,
      pheight: 520,
      pwidth: 500,
      domain: 'gdcarry.com',
      leaveamessage: true,
      check_messages: false,
    };
    const po = document.createElement('script');
    po.type = 'text/javascript';
    po.setAttribute('crossorigin', 'anonymous');
    po.async = true;
    const date = new Date();
    po.src =
      '//chat.gdcarry.com/design/defaulttheme/js/widgetv2/index.js?' +
      ('' + date.getFullYear() + date.getMonth() + date.getDate());
    const s = document.getElementsByTagName('script')[0];
    s.parentNode?.insertBefore(po, s);
  }, []);

  return null;
}
