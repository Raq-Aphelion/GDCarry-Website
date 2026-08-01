/** "Save X%" pill pinned to the top-right corner of a relatively-positioned
    parent (e.g. a discounted boost-method button). Category-agnostic — any
    purchase box can drop one onto a discounted option. */
export default function DiscountTag({ label }: { label: string }) {
  return (
    <span className="absolute -right-1 -top-2 z-10 rounded-[3px] bg-cyan-600 px-1.5 py-px text-[9px] font-bold uppercase tracking-wide text-navy-900 shadow-[0_2px_8px_rgb(0_0_0/0.45)]">
      {label}
    </span>
  );
}
