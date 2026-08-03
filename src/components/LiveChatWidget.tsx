import { useEffect } from 'react';

/** Live Helper Chat widget — injects the LHC embed script once on app mount.
    Legacy (iframe) embed: unlike the widgetv2/React embed, the classic
    widget renders the theme's header_html, so its scripts execute (custom
    scrollbar, avatar pinning, timestamp trimming, same-minute dedupe).
    Snippet shape from LHC admin → Embed code → Widget embed code (legacy);
    the (theme)/<id> segment comes from the generator's Design tab. */

// GD Carry Dark theme (id 22) + widget geometry, mirroring lhcstyle/gdcarry-lhc-theme.json
const LHC_GETSTATUS =
  'https://chat.gdcarry.com/index.php/chat/getstatus/(click)/internal/(position)/bottom_right/(ma)/br' +
  '/(theme)/22/(top)/350/(units)/pixels/(leaveamessage)/true';

export default function LiveChatWidget() {
  useEffect(() => {
    // React StrictMode double-invokes effects in dev — bail if already injected.
    if (document.getElementById('lhc-loader')) return;

    const w = window as unknown as { LHCChatOptions?: { opt: Record<string, unknown> } };
    w.LHCChatOptions = {
      opt: {
        widget_height: 520,
        widget_width: 370,
        popup_height: 520,
        popup_width: 500,
        domain: 'gdcarry.com',
      },
    };

    const po = document.createElement('script');
    po.id = 'lhc-loader';
    po.type = 'text/javascript';
    po.async = true;
    const referrer = document.referrer
      ? encodeURIComponent(document.referrer.substr(document.referrer.indexOf('://') + 1))
      : '';
    const location = document.location
      ? encodeURIComponent(window.location.href.substring(window.location.protocol.length))
      : '';
    po.src = `${LHC_GETSTATUS}?r=${referrer}&l=${location}`;
    const s = document.getElementsByTagName('script')[0];
    s.parentNode?.insertBefore(po, s);
  }, []);

  return null;
}
