// Client-side generator for shareable adoption tiles (1080×1080 PNGs) that
// admins can post to Instagram / WhatsApp. Rendered directly on a <canvas>
// (instead of html2canvas) so photo cropping is pixel-accurate and the brand
// fonts are respected. Remote photos are fetched as blobs first to avoid
// tainting the canvas (which would make toBlob() throw).

export interface TileListing {
  id: string;
  species: string;
  species_other: string | null;
  breed: string | null;
  age: string | null;
  gender: string | null;
  spayed_neutered?: boolean | null;
  location: string | null;
  description: string | null;
  photos: string[] | null;
  foster_name: string;
}

const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

function computedFont(className: string): string {
  const el = document.createElement("span");
  el.className = className;
  el.style.position = "absolute";
  el.style.visibility = "hidden";
  document.body.appendChild(el);
  const ff = getComputedStyle(el).fontFamily || "sans-serif";
  document.body.removeChild(el);
  return ff;
}

async function loadImage(url: string): Promise<HTMLImageElement | null> {
  try {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) return null;
    const blob = await res.blob();
    const objUrl = URL.createObjectURL(blob);
    const img = new Image();
    img.src = objUrl;
    await img.decode();
    URL.revokeObjectURL(objUrl);
    return img;
  } catch {
    return null;
  }
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.replace(/\s+/g, " ").trim().split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export async function generateAdoptionTile(listing: TileListing): Promise<Blob | null> {
  if (typeof document === "undefined") return null;
  // Make sure the brand webfonts are ready before we measure/draw text.
  try { await (document as unknown as { fonts?: FontFaceSet }).fonts?.ready; } catch { /* noop */ }

  const headingFont = computedFont("font-heading");
  const bodyFont = computedFont("font-body");

  const S = 1080;
  const canvas = document.createElement("canvas");
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Background + white card
  ctx.fillStyle = "#FFF7ED";
  ctx.fillRect(0, 0, S, S);
  const pad = 48;
  roundRect(ctx, pad, pad, S - 2 * pad, S - 2 * pad, 40);
  ctx.fillStyle = "#ffffff";
  ctx.fill();

  const inner = pad + 40;
  const contentW = S - 2 * inner;

  // Photo (cover-cropped into a rounded rect)
  const photoX = inner;
  const photoY = inner;
  const photoW = contentW;
  const photoH = 500;
  ctx.save();
  roundRect(ctx, photoX, photoY, photoW, photoH, 28);
  ctx.clip();
  // Soft letterbox background so portrait/landscape photos show in full (no crop).
  ctx.fillStyle = "#F3F4F6";
  ctx.fillRect(photoX, photoY, photoW, photoH);
  const img = listing.photos && listing.photos[0] ? await loadImage(listing.photos[0]) : null;
  if (img && img.width && img.height) {
    const scale = Math.min(photoW / img.width, photoH / img.height);
    const dw = img.width * scale;
    const dh = img.height * scale;
    ctx.drawImage(img, photoX + (photoW - dw) / 2, photoY + (photoH - dh) / 2, dw, dh);
  } else {
    ctx.fillStyle = "#FDE8D7";
    ctx.fillRect(photoX, photoY, photoW, photoH);
    ctx.fillStyle = "#FF8C42";
    ctx.textAlign = "center";
    ctx.font = `700 140px ${headingFont}`;
    const glyph = listing.species === "cat" ? "🐱" : listing.species === "dog" ? "🐶" : "🐾";
    ctx.fillText(glyph, photoX + photoW / 2, photoY + photoH / 2 + 48);
    ctx.textAlign = "left";
  }
  ctx.restore();

  let y = photoY + photoH + 74;

  // Title: species · breed
  const speciesLabel = cap(listing.species === "other" ? (listing.species_other || "Animal") : listing.species);
  const titleText = listing.breed?.trim() ? `${speciesLabel}  ·  ${listing.breed.trim()}` : speciesLabel;
  ctx.fillStyle = "#1f2937";
  ctx.font = `800 58px ${headingFont}`;
  ctx.fillText(titleText, inner, y);
  y += 50;

  // Details: age · gender · spay
  const det: string[] = [];
  if (listing.age?.trim()) det.push(listing.age.trim());
  if (listing.gender && listing.gender !== "unknown") det.push(cap(listing.gender));
  if (listing.spayed_neutered) det.push("Spayed/Neutered");
  if (det.length) {
    ctx.fillStyle = "#6b7280";
    ctx.font = `400 34px ${bodyFont}`;
    ctx.fillText(det.join("  ·  "), inner, y);
    y += 46;
  }

  // Location
  if (listing.location?.trim()) {
    ctx.fillStyle = "#FF6B6B";
    ctx.font = `600 30px ${bodyFont}`;
    ctx.fillText(`📍 ${listing.location.trim()}`, inner, y);
    y += 48;
  }

  // Description (up to 3 lines)
  if (listing.description?.trim()) {
    ctx.fillStyle = "#4b5563";
    ctx.font = `400 32px ${bodyFont}`;
    const lines = wrapText(ctx, listing.description.trim(), contentW).slice(0, 3);
    for (const ln of lines) {
      ctx.fillText(ln, inner, y);
      y += 42;
    }
    y += 8;
  }

  // Foster credit
  if (listing.foster_name?.trim()) {
    ctx.fillStyle = "#9ca3af";
    ctx.font = `700 28px ${bodyFont}`;
    ctx.fillText(`Foster: ${listing.foster_name.trim()}`, inner, y);
  }

  // Footer branding (pinned near bottom)
  const footY = S - pad - 44;
  ctx.fillStyle = "#FF8C42";
  ctx.font = `800 34px ${headingFont}`;
  ctx.fillText("🐾 PawsitiveSpace", inner, footY);
  ctx.fillStyle = "#6b7280";
  ctx.font = `700 26px ${bodyFont}`;
  ctx.textAlign = "right";
  ctx.fillText("DM to adopt · pawsitivespace.in", S - inner, footY);
  ctx.textAlign = "left";

  return await new Promise<Blob | null>((resolve) => canvas.toBlob((b) => resolve(b), "image/png"));
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}
