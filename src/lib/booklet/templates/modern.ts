import { RulebookData } from "../types";

export function renderModernTemplate(data: RulebookData): string {
  const totalContentPages = estimatePages(data);
  const tocEntries = buildToc(data);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    color: #1a1a2e;
    background: #ffffff;
    width: 210mm;
    font-size: 11.5px;
    line-height: 1.65;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* ── Page Container ─────────────────────────── */
  .page {
    width: 210mm;
    min-height: 297mm;
    position: relative;
    page-break-after: always;
    overflow: hidden;
  }
  .page:last-child { page-break-after: avoid; }

  /* ── COVER PAGE ─────────────────────────────── */
  .cover {
    width: 210mm;
    min-height: 297mm;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    text-align: center;
    color: white;
    position: relative;
    overflow: hidden;
  }

  .cover-bg {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, #1a1a3e 0%, #2d1b69 30%, #4a2c8a 60%, #667eea 100%);
    z-index: 0;
  }

  .cover-art {
    position: absolute;
    inset: 0;
    z-index: 1;
    opacity: 0.35;
    background-size: cover;
    background-position: center;
  }

  .cover-gradient-overlay {
    position: absolute;
    inset: 0;
    z-index: 2;
    background: linear-gradient(
      to bottom,
      rgba(26, 26, 62, 0.2) 0%,
      rgba(26, 26, 62, 0.5) 40%,
      rgba(26, 26, 62, 0.85) 70%,
      rgba(26, 26, 62, 0.95) 100%
    );
  }

  .cover-content {
    position: relative;
    z-index: 3;
    padding: 30mm 25mm 35mm;
    width: 100%;
  }

  .cover-label {
    display: inline-block;
    background: rgba(102, 126, 234, 0.3);
    border: 1px solid rgba(102, 126, 234, 0.5);
    border-radius: 24px;
    padding: 5px 20px;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 3px;
    text-transform: uppercase;
    margin-bottom: 20px;
    color: rgba(255,255,255,0.9);
  }

  .cover h1 {
    font-size: 52px;
    font-weight: 800;
    letter-spacing: -1.5px;
    line-height: 1.1;
    margin-bottom: 10px;
    text-shadow: 0 2px 20px rgba(0,0,0,0.3);
  }

  .cover .subtitle {
    font-size: 17px;
    opacity: 0.8;
    font-weight: 300;
    margin-bottom: 28px;
    letter-spacing: 0.5px;
  }

  .cover-divider {
    width: 60px;
    height: 2px;
    background: linear-gradient(90deg, transparent, rgba(102,126,234,0.8), transparent);
    margin: 0 auto 24px;
  }

  .cover-meta {
    display: flex;
    justify-content: center;
    gap: 24px;
    margin-top: 8px;
  }

  .cover-meta-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .cover-meta-value {
    font-size: 18px;
    font-weight: 700;
    letter-spacing: 0.5px;
  }

  .cover-meta-label {
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 2px;
    opacity: 0.6;
    font-weight: 500;
  }

  .cover-footer {
    position: absolute;
    bottom: 12mm;
    left: 0;
    right: 0;
    text-align: center;
    font-size: 8px;
    color: rgba(255,255,255,0.35);
    letter-spacing: 1px;
    z-index: 3;
  }

  /* ── TABLE OF CONTENTS PAGE ─────────────────── */
  .toc-page {
    padding: 25mm 28mm;
  }

  .toc-page h2 {
    font-size: 26px;
    font-weight: 800;
    color: #1a1a2e;
    margin-bottom: 6px;
    letter-spacing: -0.5px;
  }

  .toc-accent {
    width: 40px;
    height: 3px;
    background: linear-gradient(90deg, #667eea, #764ba2);
    border-radius: 2px;
    margin-bottom: 28px;
  }

  .toc-list {
    list-style: none;
    padding: 0;
  }

  .toc-item {
    display: flex;
    align-items: baseline;
    padding: 10px 0;
    border-bottom: 1px solid #f0f0f5;
    font-size: 13px;
  }

  .toc-number {
    font-weight: 700;
    color: #667eea;
    min-width: 28px;
    font-size: 14px;
  }

  .toc-title {
    font-weight: 600;
    color: #1a1a2e;
    flex: 1;
  }

  .toc-dots {
    flex: 1;
    border-bottom: 1px dotted #ccc;
    margin: 0 8px;
    min-width: 20px;
  }

  /* ── CONTENT PAGES ──────────────────────────── */
  .content-page {
    padding: 20mm 28mm 25mm;
  }

  .content-page .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 10px;
    margin-bottom: 20px;
    border-bottom: 1px solid #eef0fb;
  }

  .page-header-title {
    font-size: 9px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: #667eea;
  }

  .page-header-line {
    flex: 1;
    height: 1px;
    background: #eef0fb;
    margin: 0 16px;
  }

  .page-number {
    font-size: 9px;
    font-weight: 600;
    color: #999;
  }

  /* ── Section Headings ───────────────────────── */
  .section-heading {
    font-size: 22px;
    font-weight: 800;
    color: #1a1a2e;
    margin: 32px 0 4px;
    letter-spacing: -0.3px;
    position: relative;
    padding-left: 16px;
  }

  .section-heading:first-child,
  .section-heading.first-on-page { margin-top: 0; }

  .section-heading::before {
    content: '';
    position: absolute;
    left: 0;
    top: 2px;
    bottom: 2px;
    width: 4px;
    background: linear-gradient(to bottom, #667eea, #764ba2);
    border-radius: 2px;
  }

  .section-accent {
    width: 30px;
    height: 2px;
    background: linear-gradient(90deg, #667eea, #764ba2);
    border-radius: 1px;
    margin: 0 0 14px 16px;
  }

  /* ── Body Content ───────────────────────────── */
  .content p {
    font-size: 11.5px;
    line-height: 1.7;
    color: #333;
    margin-bottom: 8px;
  }

  .content ul, .content ol {
    padding-left: 22px;
    margin-bottom: 12px;
  }

  .content li {
    font-size: 11.5px;
    line-height: 1.65;
    color: #333;
    margin-bottom: 4px;
    padding-left: 4px;
  }

  .content li::marker {
    color: #667eea;
    font-weight: 700;
  }

  /* ── Introduction / Story Box ────────────────── */
  .intro-box {
    background: linear-gradient(135deg, #f8f7ff 0%, #f0eeff 100%);
    border: 1px solid #e4e0f8;
    border-radius: 12px;
    padding: 20px 22px;
    margin: 0 0 24px;
    position: relative;
  }

  .intro-box::before {
    content: '\\201C';
    position: absolute;
    top: 8px;
    left: 14px;
    font-size: 48px;
    color: #667eea;
    opacity: 0.2;
    font-family: Georgia, serif;
    line-height: 1;
  }

  .intro-box p {
    font-size: 12px;
    line-height: 1.75;
    color: #4a4a6a;
    font-style: italic;
    padding-left: 20px;
  }

  /* ── Custom Rules Section ────────────────────── */
  .custom-rules {
    background: linear-gradient(135deg, #f0f0ff 0%, #e8e8ff 100%);
    border: 1px solid #d8d8f0;
    border-radius: 10px;
    padding: 18px 20px;
    margin: 20px 0;
    position: relative;
    overflow: hidden;
  }

  .custom-rules::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: linear-gradient(to bottom, #667eea, #764ba2);
  }

  .custom-rules h3 {
    font-size: 14px;
    font-weight: 700;
    color: #4a4a8a;
    margin-bottom: 10px;
    letter-spacing: 0.5px;
    padding-left: 4px;
  }

  .custom-rules ul {
    list-style: none;
    padding: 0;
  }

  .custom-rules li {
    font-size: 11px;
    line-height: 1.6;
    color: #4a4a6a;
    padding: 5px 0 5px 20px;
    position: relative;
    border-bottom: 1px solid rgba(102,126,234,0.08);
  }

  .custom-rules li:last-child { border-bottom: none; }

  .custom-rules li::before {
    content: '\\2726';
    position: absolute;
    left: 2px;
    color: #667eea;
    font-size: 9px;
    top: 7px;
  }

  /* ── Tip / Callout Box ──────────────────────── */
  .callout {
    background: #fffbf0;
    border: 1px solid #f0e6cc;
    border-radius: 8px;
    padding: 14px 16px;
    margin: 16px 0;
  }

  .callout-label {
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: #c4960c;
    margin-bottom: 4px;
  }

  .callout p {
    font-size: 11px;
    color: #6b5a30;
    line-height: 1.6;
    font-style: italic;
  }

  /* ── Board Art Banner ───────────────────────── */
  .art-banner {
    width: calc(100% + 56mm);
    margin: 0 -28mm 24px;
    height: 100px;
    overflow: hidden;
    position: relative;
  }

  .art-banner img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .art-banner-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to bottom,
      rgba(255,255,255,0) 0%,
      rgba(255,255,255,0.8) 80%,
      rgba(255,255,255,1) 100%
    );
  }

  /* ── Card Art Inline ────────────────────────── */
  .card-art-float {
    float: right;
    width: 120px;
    margin: 0 0 12px 16px;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(0,0,0,0.1);
    border: 1px solid #e0e0e0;
  }

  .card-art-float img {
    width: 100%;
    height: auto;
    display: block;
  }

  /* ── Footer ─────────────────────────────────── */
  .page-footer {
    position: absolute;
    bottom: 10mm;
    left: 28mm;
    right: 28mm;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 8px;
    color: #bbb;
  }

  .page-footer-center {
    position: absolute;
    bottom: 10mm;
    left: 0;
    right: 0;
    text-align: center;
    font-size: 8px;
    color: #bbb;
  }
</style>
</head>
<body>
  <!-- ═══ COVER PAGE ═══ -->
  <div class="page">
    <div class="cover">
      <div class="cover-bg"></div>
      ${data.boardArtBase64 ? `<div class="cover-art" style="background-image: url('${data.boardArtBase64}')"></div>` : ""}
      <div class="cover-gradient-overlay"></div>
      <div class="cover-content">
        <div class="cover-label">Official Rulebook</div>
        <h1>${esc(data.title)}</h1>
        ${data.subtitle ? `<div class="subtitle">${esc(data.subtitle)}</div>` : ""}
        <div class="cover-divider"></div>
        ${data.theme ? `<div class="subtitle" style="font-size:14px; opacity:0.7; margin-bottom:32px;">${esc(data.theme)}</div>` : ""}
        <div class="cover-meta">
          ${data.playerCount ? `
            <div class="cover-meta-item">
              <span class="cover-meta-value">${esc(data.playerCount)}</span>
              <span class="cover-meta-label">Players</span>
            </div>
          ` : ""}
          ${data.playTime ? `
            <div class="cover-meta-item">
              <span class="cover-meta-value">${esc(data.playTime)}</span>
              <span class="cover-meta-label">Play Time</span>
            </div>
          ` : ""}
          ${data.age ? `
            <div class="cover-meta-item">
              <span class="cover-meta-value">${esc(data.age)}+</span>
              <span class="cover-meta-label">Ages</span>
            </div>
          ` : ""}
        </div>
      </div>
      <div class="cover-footer">Based on ${esc(data.baseGame)} &bull; Created with BoardCraft</div>
    </div>
  </div>

  <!-- ═══ TABLE OF CONTENTS ═══ -->
  <div class="page">
    <div class="toc-page">
      <h2>Contents</h2>
      <div class="toc-accent"></div>
      <ul class="toc-list">
        ${tocEntries.map((entry, i) => `
          <li class="toc-item">
            <span class="toc-number">${String(i + 1).padStart(2, "0")}</span>
            <span class="toc-title">${esc(entry)}</span>
            <span class="toc-dots"></span>
          </li>
        `).join("")}
      </ul>

      ${data.boardArtBase64 ? `
        <div style="margin-top: 32px; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e8e8f0;">
          <img src="${data.boardArtBase64}" alt="Game Board" style="width: 100%; height: auto; display: block;" />
        </div>
      ` : ""}
    </div>
    <div class="page-footer-center">2</div>
  </div>

  <!-- ═══ CONTENT PAGES ═══ -->
  ${renderContentPages(data, totalContentPages)}
</body>
</html>`;
}

function renderContentPages(data: RulebookData, _totalPages: number): string {
  let pageNum = 3;
  let html = "";

  // Group sections into pages — roughly 3 sections per page
  const allSections: { type: "intro" | "section" | "custom-rules" | "card-art"; content: string }[] = [];

  // Add intro/description if available
  if (data.description || data.theme) {
    const introText = data.description || `Welcome to ${data.title}! ${data.theme ? `Set in a world of ${data.theme}, this` : "This"} custom version of ${data.baseGame} brings exciting new twists to the classic gameplay you know and love.`;
    allSections.push({
      type: "intro",
      content: `<div class="intro-box"><p>${esc(introText)}</p></div>`,
    });
  }

  // Add card art float at the beginning if available
  if (data.cardArtBase64) {
    allSections.push({
      type: "card-art",
      content: `<div class="card-art-float"><img src="${data.cardArtBase64}" alt="Card Art" /></div>`,
    });
  }

  // Add each section
  for (const s of data.sections) {
    allSections.push({
      type: "section",
      content: `
        <h2 class="section-heading">${esc(s.heading)}</h2>
        <div class="section-accent"></div>
        <div class="content">${renderBody(s.body)}</div>
      `,
    });
  }

  // Add custom rules
  if (data.customRules && data.customRules.length > 0) {
    allSections.push({
      type: "custom-rules",
      content: `
        <div class="custom-rules">
          <h3>Custom Rules &amp; Variants</h3>
          <ul>
            ${data.customRules.map((r) => `<li>${esc(r)}</li>`).join("")}
          </ul>
        </div>
      `,
    });
  }

  // Split into pages (approx 3-4 sections per page, intro takes more space)
  const pages: string[][] = [];
  let currentPage: string[] = [];
  let weightOnPage = 0;

  for (const s of allSections) {
    const weight = s.type === "intro" ? 1.5 : s.type === "custom-rules" ? 2 : s.type === "card-art" ? 0 : 1;
    if (weightOnPage > 0 && weightOnPage + weight > 4) {
      pages.push(currentPage);
      currentPage = [];
      weightOnPage = 0;
    }
    currentPage.push(s.content);
    weightOnPage += weight;
  }
  if (currentPage.length > 0) pages.push(currentPage);

  for (const page of pages) {
    const isFirst = pageNum === 3;
    html += `
      <div class="page">
        <div class="content-page">
          <div class="page-header">
            <span class="page-header-title">${esc(data.title)}</span>
            <span class="page-header-line"></span>
            <span class="page-number">${pageNum}</span>
          </div>
          ${isFirst && data.boardArtBase64 ? `
            <div class="art-banner">
              <img src="${data.boardArtBase64}" alt="Board Art" />
              <div class="art-banner-overlay"></div>
            </div>
          ` : ""}
          ${page.join("\n")}
        </div>
        <div class="page-footer">
          <span>Based on ${esc(data.baseGame)}</span>
          <span>Created with BoardCraft</span>
        </div>
      </div>
    `;
    pageNum++;
  }

  // Final back page
  html += `
    <div class="page">
      <div class="cover">
        <div class="cover-bg"></div>
        ${data.boardArtBase64 ? `<div class="cover-art" style="background-image: url('${data.boardArtBase64}'); opacity: 0.2;"></div>` : ""}
        <div class="cover-gradient-overlay"></div>
        <div class="cover-content" style="justify-content: center; padding-top: 0;">
          <div class="cover-label" style="margin-bottom: 16px;">Thank You for Playing</div>
          <h1 style="font-size: 36px;">${esc(data.title)}</h1>
          <div class="cover-divider" style="margin-top: 20px;"></div>
          <div class="subtitle" style="margin-top: 16px; font-size: 13px; opacity: 0.6;">
            A custom ${esc(data.baseGame)} experience &bull; Created with BoardCraft
          </div>
        </div>
      </div>
    </div>
  `;

  return html;
}

function buildToc(data: RulebookData): string[] {
  const entries: string[] = [];
  if (data.description || data.theme) entries.push("Introduction");
  for (const s of data.sections) entries.push(s.heading);
  if (data.customRules && data.customRules.length > 0) entries.push("Custom Rules & Variants");
  return entries;
}

function estimatePages(data: RulebookData): number {
  const sectionWeight = data.sections.length;
  const customWeight = data.customRules && data.customRules.length > 0 ? 2 : 0;
  const introWeight = data.description || data.theme ? 1.5 : 0;
  return Math.ceil((sectionWeight + customWeight + introWeight) / 4) + 3;
}

function esc(str: string | undefined | null): string {
  return (str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderBody(body: string): string {
  const lines = body.split("\n").filter((line) => line.trim());
  let html = "";
  let inList = false;

  for (const line of lines) {
    const trimmed = line.trim();
    const isBullet = trimmed.startsWith("- ") || trimmed.startsWith("* ");

    if (isBullet && !inList) {
      html += "<ul>\n";
      inList = true;
    } else if (!isBullet && inList) {
      html += "</ul>\n";
      inList = false;
    }

    if (isBullet) {
      html += `<li>${esc(trimmed.slice(2))}</li>\n`;
    } else if (trimmed.startsWith("### ")) {
      html += `<div class="callout"><div class="callout-label">Tip</div><p>${esc(trimmed.slice(4))}</p></div>\n`;
    } else if (trimmed.startsWith("## ")) {
      html += `<h2 class="section-heading" style="font-size:18px; margin-top:20px;">${esc(trimmed.slice(3))}</h2><div class="section-accent"></div>\n`;
    } else if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
      html += `<p style="font-weight:700; color:#1a1a2e;">${esc(trimmed.slice(2, -2))}</p>\n`;
    } else {
      html += `<p>${esc(trimmed)}</p>\n`;
    }
  }

  if (inList) html += "</ul>\n";
  return html;
}
