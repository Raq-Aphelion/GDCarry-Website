@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 226 69% 6%;
    --foreground: 210 40% 96%;
    --card: 224 60% 9%;
    --card-foreground: 210 40% 96%;
    --popover: 224 60% 8%;
    --popover-foreground: 210 40% 96%;
    --primary: 43 85% 56%;
    --primary-foreground: 226 69% 8%;
    --secondary: 224 45% 16%;
    --secondary-foreground: 210 40% 96%;
    --muted: 224 45% 14%;
    --muted-foreground: 217 20% 65%;
    --accent: 189 94% 43%;
    --accent-foreground: 226 69% 8%;
    --destructive: 0 72% 51%;
    --destructive-foreground: 0 0% 98%;
    --border: 224 40% 20%;
    --input: 224 40% 22%;
    --ring: 43 85% 56%;
    --radius: 0.75rem;
    --sidebar-background: 224 60% 8%;
    --sidebar-foreground: 210 40% 96%;
    --sidebar-primary: 43 85% 56%;
    --sidebar-primary-foreground: 226 69% 8%;
    --sidebar-accent: 224 45% 16%;
    --sidebar-accent-foreground: 210 40% 96%;
    --sidebar-border: 224 40% 20%;
    --sidebar-ring: 43 85% 56%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  /* The viewport never scrolls — the #page-scroll container (which starts
     below the navbar) is the page's scroller, so the scrollbar physically
     begins under the navbar and is fully stylable in every browser. */
  html,
  body {
    overflow: hidden;
  }

  #page-scroll {
    scroll-behavior: smooth;
    scroll-padding-top: 16px;
    /* JS handles floating-element positioning; native scroll anchoring makes
       instant compensating jumps that can fling the price block off-screen
       for a frame when accordions resize above it. */
    overflow-anchor: none;
  }

  /* Inner scrollers (dropdowns, cart item list): thin, transparent track,
     no arrow buttons, no corner block. */
  * {
    scrollbar-width: thin;
    scrollbar-color: #1c2f66 transparent;
  }
  ::-webkit-scrollbar-button {
    display: none;
    width: 0;
    height: 0;
  }
  ::-webkit-scrollbar-corner {
    background: transparent;
  }

  /* Desktop: the page's native scrollbar is replaced by a custom overlay
     scrollbar (components/Scrollbar.tsx) that floats over the content — the
     page visually continues to the screen edge, with no gutter and no arrow
     buttons. Mobile keeps its native overlay scrollbar. */
  @media (min-width: 1024px) {
    #page-scroll {
      scrollbar-width: none;
    }
    #page-scroll::-webkit-scrollbar {
      display: none;
    }
  }

  /* Cart open: scrollbar hidden visually. Scroll keeps working and the
     layout never shifts (the overlay scrollbar takes no layout space). */
  html.cart-scroll-hidden .page-scrollbar {
    opacity: 0 !important; /* beats the component's opacity utilities */
    pointer-events: none;
  }

  /* The cart item list uses the same overlay scrollbar as the page, so its
     native scrollbar is always hidden (all viewports). */
  .cart-items-scroll {
    scrollbar-width: none;
  }
  .cart-items-scroll::-webkit-scrollbar {
    display: none;
  }
  body {
    @apply bg-navy-900 text-foreground font-sans antialiased;
    background-image:
      radial-gradient(1200px 600px at 85% -10%, rgba(34, 211, 238, 0.08), transparent 60%),
      radial-gradient(900px 500px at -10% 10%, rgba(238, 178, 50, 0.05), transparent 55%);
    background-attachment: fixed;
  }
  ::selection {
    background: rgba(34, 211, 238, 0.35);
    color: #e0faff;
  }
  /* Transparent track: page backgrounds continue under the scrollbar. The
     thumb's transparent border keeps it the same 10px footprint while leaving
     a slim visual pill floating over the content. */
  ::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }
  ::-webkit-scrollbar-track {
    background: transparent;
  }
  ::-webkit-scrollbar-thumb {
    background: #1c2f66;
    border-radius: 999px;
    border: 2px solid transparent;
    background-clip: padding-box;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: #2a4188;
    border: 2px solid transparent;
    background-clip: padding-box;
  }
}

@layer utilities {
  .text-gradient-gold {
    background: linear-gradient(100deg, #a5f3fc 0%, #22d3ee 45%, #67e8f9 70%, #0e7490 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
  .text-gradient-cyan {
    background: linear-gradient(100deg, #ffe08a 0%, #eeb232 60%, #b97e10 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
  .card-surface {
    @apply bg-navy-850 backdrop-blur-sm;
  }
  .gold-glow {
    box-shadow: 0 0 24px -6px rgba(34, 211, 238, 0.45);
  }
  /* Soft, slow easing for the Additional Options collapse/extend */
  .ease-soft {
    transition-timing-function: cubic-bezier(0.32, 0.72, 0, 1);
  }
  /* Subtle cyan glow along the top edge of the floating price block while it
     overlaps page content; removed as soon as it rests in its natural spot. */
  .price-block-glow {
    box-shadow:
      0 -14px 28px -14px rgba(103, 232, 249, 0.35),
      0 25px 50px -12px rgba(0, 0, 0, 0.55);
  }
  .cyan-glow {
    box-shadow: 0 0 24px -6px rgba(238, 178, 50, 0.4);
  }
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
}

/* Reveal-on-scroll base states (toggled by the Reveal component) */
.reveal-hidden {
  opacity: 0;
  transform: translateY(28px);
}
.reveal-visible {
  opacity: 1;
  transform: translateY(0);
}

/* Remove native number input spinners */
input[type='number']::-webkit-outer-spin-button,
input[type='number']::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type='number'] {
  -moz-appearance: textfield;
  appearance: textfield;
}

/* Navbar dropdown entrance */
@keyframes dropdown-in {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.dropdown-in {
  animation: dropdown-in 0.18s ease-out both;
}

/* Toast entrance */
@keyframes toast-in {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
.toast-in {
  animation: toast-in 0.28s cubic-bezier(0.21, 1.02, 0.73, 1) both;
}

/* Infinite review marquee */
@keyframes marquee {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}
.marquee {
  animation: marquee 46s linear infinite;
}

/* Slow float for hero dice accents */
@keyframes float-slow {
  0%,
  100% {
    transform: translateY(0) rotate(-8deg);
  }
  50% {
    transform: translateY(-14px) rotate(-2deg);
  }
}
.float-slow {
  animation: float-slow 7s ease-in-out infinite;
}
