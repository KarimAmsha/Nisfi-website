/** Nisfi wordmark glyph — the «وَقار» emerald tile with a gold monogram stroke. */
export function BrandMark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 34 34" fill="none" aria-hidden>
      <rect x="1" y="1" width="32" height="32" rx="9" fill="#0A4D3C" />
      <path
        d="M11 23V11l12 12V11"
        stroke="#C49A55"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="17" cy="17" r="13" stroke="#0E6650" strokeWidth="1" opacity="0.5" />
    </svg>
  );
}
