// Client-side generator for shareable RESCUE alert tiles (1080×1080 PNGs) that
// admins can post to Instagram / WhatsApp to gain traction on open cases.
// Rendered directly on a <canvas> so photo cropping is pixel-accurate and the
// brand fonts are respected. Remote photos are fetched as blobs first to avoid
// tainting the canvas (which would make toBlob() throw).

export interface TileRescue {
  id: string;
  species: string;
  name: string | null;
  location: string | null;
  notes: string | null;
  photos: string[] | null;
  status?: string | null;
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

export async function generateRescueTile(rescue: TileRescue): Promise<Blob | null> {
  if (typeof document === "undefined") return null;
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
  ctx.fillStyle = "#FFF1F0";
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
  const img = rescue.photos && rescue.photos[0] ? await loadImage(rescue.photos[0]) : null;
  if (img && img.width && img.height) {
    const scale = Math.max(photoW / img.width, photoH / img.height);
    const dw = img.width * scale;
    const dh = img.height * scale;
    ctx.drawImage(img, photoX + (photoW - dw) / 2, photoY + (photoH - dh) / 2, dw, dh);
  } else {
    ctx.fillStyle = "#FDE0DE";
    ctx.fillRect(photoX, photoY, photoW, photoH);
    ctx.fillStyle = "#EF4444";
    ctx.textAlign = "center";
    ctx.font = `700 140px ${headingFont}`;
    const glyph = rescue.species === "cat" ? "🐱" : rescue.species === "dog" ? "🐶" : "🐾";
    ctx.fillText(glyph, photoX + photoW / 2, photoY + photoH / 2 + 48);
    ctx.textAlign = "left";
  }
  ctx.restore();

  // Urgent banner over the photo's top-left
  const bannerText = "🆘 RESCUE NEEDED";
  ctx.font = `800 30px ${headingFont}`;
  const bw = ctx.measureText(bannerText).width + 44;
  roundRect(ctx, photoX + 22, photoY + 22, bw, 58, 18);
  ctx.fillStyle = "#EF4444";
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.fillText(bannerText, photoX + 22 + 22, photoY + 22 + 39);

  let y = photoY + photoH + 74;

  // Title: species (+ name)
  const speciesLabel = cap(rescue.species || "animal");
  const titleText = rescue.name?.trim() ? `${speciesLabel}  ·  ${rescue.name.trim()}` : speciesLabel;
  ctx.fillStyle = "#1f2937";
  ctx.font = `800 58px ${headingFont}`;
  ctx.fillText(titleText, inner, y);
  y += 52;

  // Location
  if (rescue.location?.trim()) {
    ctx.fillStyle = "#EF4444";
    ctx.font = `600 32px ${bodyFont}`;
    ctx.fillText(`📍 ${rescue.location.trim()}`, inner, y);
    y += 50;
  }

  // Notes (up to 4 lines)
  if (rescue.notes?.trim()) {
    ctx.fillStyle = "#4b5563";
    ctx.font = `400 32px ${bodyFont}`;
    const lines = wrapText(ctx, rescue.notes.trim(), contentW).slice(0, 4);
    for (const ln of lines) {
      ctx.fillText(ln, inner, y);
      y += 42;
    }
  }

  // Footer branding (pinned near bottom)
  const footY = S - pad - 44;
  ctx.fillStyle = "#FF8C42";
  ctx.font = `800 34px ${headingFont}`;
  ctx.fillText("🐾 PawsitiveSpace", inner, footY);
  ctx.fillStyle = "#6b7280";
  ctx.font = `700 26px ${bodyFont}`;
  ctx.textAlign = "right";
  ctx.fillText("Can you help? · pawsitivespace.in", S - inner, footY);
  ctx.textAlign = "left";

  return await new Promise<Blob | null>((resolve) => canvas.toBlob((b) => resolve(b), "image/png"));
}
