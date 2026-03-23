/** Default cover image gradients keyed by a hash of the name. */

const GRADIENT_PAIRS = [
  ["#1e3a5f", "#3b82f6"], // deep blue → blue
  ["#1e293b", "#6366f1"], // slate → indigo
  ["#701a75", "#c026d3"], // dark magenta → fuchsia
  ["#064e3b", "#10b981"], // emerald dark → emerald
  ["#7c2d12", "#f97316"], // brown → orange
  ["#1e1b4b", "#8b5cf6"], // midnight → violet
  ["#0c4a6e", "#06b6d4"], // sky dark → cyan
  ["#3f0000", "#dc2626"], // dark red → red
  ["#365314", "#84cc16"], // olive → lime
  ["#44403c", "#78716c"], // warm stone tones
];

function hashString(s: string): number {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = (hash * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/**
 * Returns a CSS gradient string for a given name to use as a
 * fallback when no cover image URL is provided.
 */
export function getDefaultGradient(name: string): string {
  const pair = GRADIENT_PAIRS[hashString(name) % GRADIENT_PAIRS.length];
  return `linear-gradient(135deg, ${pair[0]}, ${pair[1]})`;
}

/**
 * Returns the inline style for a cover image area.
 * If imageUrl is provided, uses it as a background image with a dark overlay.
 * Otherwise, falls back to a deterministic gradient based on the name.
 */
export function coverStyle(
  name: string,
  imageUrl?: string,
): React.CSSProperties {
  if (imageUrl) {
    return {
      backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.55), rgba(0,0,0,0.15)), url(${imageUrl})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  }
  return {
    background: getDefaultGradient(name),
  };
}
