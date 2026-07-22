/** Custom validation bubble — replaces native browser popups. Anchored above
    the right edge of a `relative` field wrapper. */
export default function FieldPopup({ message }: { message: string }) {
  if (!message) return null;
  return (
    // pointer-events-none: the bubble must never block the field it overlaps
    <span className="pointer-events-none absolute bottom-full right-0 z-10 mb-2 rounded-[5px] border border-red-500/40 bg-navy-800 px-3 py-2 text-xs font-medium text-slate-200 shadow-xl">
      {message}
    </span>
  );
}
