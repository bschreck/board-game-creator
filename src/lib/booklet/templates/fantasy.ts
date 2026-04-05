import { RulebookData } from "../types";

export function renderFantasyTemplate(data: RulebookData): string {
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
    font-family: 'Georgia', 'Times New Roman', 'Palatino Linotype', serif;
    color: #2c1810;
    width: 210mm;
    font-size: 11.5px;
    line-height: 1.7;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* ── Parchment Background ───────────────────── */
  .parchment {
    background:
      radial-gradient(ellipse at 20% 50%, rgba(210,180,140,0.15) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 20%, rgba(180,150,100,0.12) 0%, transparent 40%),
      radial-gradient(ellipse at 60% 80%, rgba(160,130,80,0.1) 0%, transparent 45%),
      linear-gradient(to bottom, #f5ead0, #efe0c4, #f2e4cb, #ece0c8);
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

  /* ── Ornate Border ──────────────────────────── */
  .page-border {
    position: absolute;
    top: 8mm;
    left: 8mm;
    right: 8mm;
    bottom: 8mm;
    border: 2px solid #8b6914;
    pointer-events: none;
    z-index: 10;
  }

  .page-border::before {
    content: '';
    position: absolute;
    top: 3px;
    left: 3px;
    right: 3px;
    bottom: 3px;
    border: 1px solid rgba(139,105,20,0.4);
  }

  /* Corner ornaments */
  .corner {
    position: absolute;
    width: 24px;
    height: 24px;
    z-index: 11;
    color: #8b6914;
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .corner-tl { top: 4mm; left: 4mm; }
  .corner-tr { top: 4mm; right: 4mm; }
  .corner-bl { bottom: 4mm; left: 4mm; }
  .corner-br { bottom: 4mm; right: 4mm; }

  /* ── COVER PAGE ─────────────────────────────── */
  .cover-page {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 297mm;
    text-align: center;
    position: relative;
  }

  .cover-art-bg {
    position: absolute;
    inset: 8mm;
    z-index: 0;
    opacity: 0.2;
    background-size: cover;
    background-position: center;
    mask-image: radial-gradient(ellipse at center, black 30%, transparent 75%);
    -webkit-mask-image: radial-gradient(ellipse at center, black 30%, transparent 75%);
  }

  .cover-content {
    position: relative;
    z-index: 5;
    padding: 30mm 30mm;
  }

  .cover-ornament-top {
    font-size: 14px;
    color: #8b6914;
    letter-spacing: 6px;
    margin-bottom: 16px;
    opacity: 0.8;
  }

  .cover-rule {
    width: 200px;
    height: 1px;
    background: linear-gradient(90deg, transparent, #8b6914, transparent);
    margin: 12px auto;
  }

  .cover-rule-thick {
    width: 160px;
    height: 2px;
    background: linear-gradient(90deg, transparent, #8b6914, transparent);
    margin: 8px auto;
  }

  .cover h1 {
    font-size: 46px;
    color: #3d1f08;
    text-transform: uppercase;
    letter-spacing: 5px;
    line-height: 1.15;
    margin: 16px 0 8px;
    text-shadow: 0 1px 3px rgba(0,0,0,0.08);
    font-weight: normal;
  }

  .cover .subtitle {
    font-size: 16px;
    color: #8b6914;
    font-style: italic;
    margin-bottom: 8px;
    letter-spacing: 1px;
  }

  .cover-scroll-label {
    display: inline-block;
    font-size: 10px;
    letter-spacing: 4px;
    text-transform: uppercase;
    color: #7a5c3a;
    padding: 6px 24px;
    border: 1px solid rgba(139,105,20,0.3);
    margin: 20px 0;
  }

  .cover-meta {
    margin-top: 24px;
    font-size: 12px;
    color: #7a5c3a;
    line-height: 2;
    letter-spacing: 0.5px;
  }

  .cover-meta-divider {
    display: inline-block;
    margin: 0 10px;
    color: #8b6914;
    opacity: 0.5;
  }

  .cover-bottom-ornament {
    margin-top: 40px;
    font-size: 18px;
    color: #8b6914;
    letter-spacing: 10px;
    opacity: 0.6;
  }

  .cover-footer {
    position: absolute;
    bottom: 14mm;
    left: 0;
    right: 0;
    text-align: center;
    font-size: 8px;
    color: #a08060;
    font-style: italic;
    z-index: 5;
    letter-spacing: 1px;
  }

  /* ── TABLE OF CONTENTS ──────────────────────── */
  .toc-page {
    padding: 28mm 32mm;
  }

  .toc-page h2 {
    font-size: 28px;
    color: #3d1f08;
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 4px;
    margin-bottom: 4px;
    font-weight: normal;
  }

  .toc-rule {
    width: 120px;
    height: 1px;
    background: linear-gradient(90deg, transparent, #8b6914, transparent);
    margin: 8px auto 28px;
  }

  .toc-list {
    list-style: none;
    padding: 0;
  }

  .toc-item {
    display: flex;
    align-items: baseline;
    padding: 9px 0;
    border-bottom: 1px solid rgba(139,105,20,0.12);
    font-size: 13px;
  }

  .toc-numeral {
    font-weight: normal;
    color: #8b6914;
    min-width: 36px;
    font-size: 13px;
    font-style: italic;
  }

  .toc-title {
    color: #3d1f08;
    flex: 1;
    letter-spacing: 0.5px;
  }

  .toc-dots {
    flex: 1;
    border-bottom: 1px dotted rgba(139,105,20,0.3);
    margin: 0 8px;
    min-width: 20px;
  }

  /* ── CONTENT PAGES ──────────────────────────── */
  .content-page {
    padding: 22mm 30mm 28mm;
  }

  .content-page .page-header {
    text-align: center;
    padding-bottom: 12px;
    margin-bottom: 18px;
    border-bottom: 1px solid rgba(139,105,20,0.2);
  }

  .page-header-title {
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 3px;
    color: #8b6914;
    font-style: italic;
  }

  /* ── Section Headings ───────────────────────── */
  .section-heading {
    font-size: 22px;
    color: #3d1f08;
    text-transform: uppercase;
    letter-spacing: 3px;
    margin: 30px 0 4px;
    font-weight: normal;
    text-align: center;
  }

  .section-heading:first-child { margin-top: 0; }

  .section-rule {
    width: 80px;
    height: 1px;
    background: linear-gradient(90deg, transparent, #8b6914, transparent);
    margin: 6px auto 16px;
  }

  /* ── Body Content ───────────────────────────── */
  .content p {
    font-size: 11.5px;
    line-height: 1.75;
    color: #3d2b1f;
    margin-bottom: 8px;
    text-align: justify;
    hyphens: auto;
  }

  .content ul, .content ol {
    padding-left: 22px;
    margin-bottom: 12px;
  }

  .content li {
    font-size: 11.5px;
    line-height: 1.7;
    color: #3d2b1f;
    margin-bottom: 5px;
  }

  .content li::marker {
    color: #8b6914;
  }

  /* ── Introduction / Lore Box ─────────────────── */
  .lore-box {
    background: rgba(139,105,20,0.06);
    border: 1px solid rgba(139,105,20,0.2);
    border-radius: 2px;
    padding: 18px 22px;
    margin: 0 0 24px;
    position: relative;
  }

  .lore-box::before,
  .lore-box::after {
    position: absolute;
    font-size: 36px;
    color: #8b6914;
    opacity: 0.25;
    font-family: Georgia, serif;
    line-height: 1;
  }

  .lore-box::before {
    content: '\\201C';
    top: 6px;
    left: 10px;
  }

  .lore-box::after {
    content: '\\201D';
    bottom: -4px;
    right: 10px;
  }

  .lore-box p {
    font-size: 12px;
    line-height: 1.8;
    color: #5c3317;
    font-style: italic;
    text-align: center;
    padding: 0 16px;
  }

  /* ── Custom Rules Section ────────────────────── */
  .custom-rules {
    background: rgba(139,105,20,0.06);
    border: 1px solid rgba(139,105,20,0.2);
    padding: 18px 22px;
    margin: 22px 0;
    position: relative;
  }

  .custom-rules::before {
    content: '\\2726 \\2726 \\2726';
    display: block;
    text-align: center;
    color: #8b6914;
    font-size: 10px;
    letter-spacing: 8px;
    margin-bottom: 12px;
    opacity: 0.6;
  }

  .custom-rules h3 {
    font-size: 15px;
    color: #3d1f08;
    margin-bottom: 12px;
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 2px;
    font-weight: normal;
  }

  .custom-rules ul {
    list-style: none;
    padding: 0;
  }

  .custom-rules li {
    font-size: 11px;
    line-height: 1.7;
    color: #5c3317;
    padding: 6px 0 6px 20px;
    position: relative;
    border-bottom: 1px solid rgba(139,105,20,0.08);
  }

  .custom-rules li:last-child { border-bottom: none; }

  .custom-rules li::before {
    content: '\\2726';
    position: absolute;
    left: 2px;
    color: #8b6914;
    font-size: 8px;
    top: 9px;
  }

  /* ── Callout Box ────────────────────────────── */
  .callout {
    background: rgba(139,105,20,0.05);
    border-left: 3px solid #8b6914;
    padding: 12px 16px;
    margin: 14px 0;
  }

  .callout-label {
    font-size: 9px;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: #8b6914;
    margin-bottom: 4px;
  }

  .callout p {
    font-size: 11px;
    color: #5c3317;
    line-height: 1.65;
    font-style: italic;
  }

  /* ── Board Art Banner ───────────────────────── */
  .art-banner {
    width: calc(100% + 60mm);
    margin: 0 -30mm 20px;
    height: 90px;
    overflow: hidden;
    position: relative;
  }

  .art-banner img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    filter: sepia(30%) contrast(0.9);
  }

  .art-banner-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to bottom,
      rgba(245,234,208,0) 0%,
      rgba(245,234,208,0.7) 75%,
      rgba(245,234,208,1) 100%
    );
  }

  /* ── Card Art ───────────────────────────────── */
  .card-art-float {
    float: right;
    width: 110px;
    margin: 0 0 12px 16px;
    border: 2px solid rgba(139,105,20,0.3);
    box-shadow: 2px 2px 8px rgba(0,0,0,0.1);
  }

  .card-art-float img {
    width: 100%;
    height: auto;
    display: block;
    filter: sepia(10%);
  }

  /* ── Board Art in TOC ───────────────────────── */
  .toc-art {
    margin-top: 28px;
    border: 2px solid rgba(139,105,20,0.3);
    overflow: hidden;
    box-shadow: 2px 2px 10px rgba(0,0,0,0.08);
  }

  .toc-art img {
    width: 100%;
    height: auto;
    display: block;
    filter: sepia(15%) contrast(0.95);
  }

  /* ── Page Number ────────────────────────────── */
  .page-number {
    position: absolute;
    bottom: 12mm;
    left: 0;
    right: 0;
    text-align: center;
    font-size: 10px;
    color: #8b6914;
    z-index: 15;
    font-style: italic;
  }

  .page-footer {
    position: absolute;
    bottom: 16mm;
    left: 0;
    right: 0;
    text-align: center;
    font-size: 8px;
    color: #a08060;
    font-style: italic;
    z-index: 15;
    letter-spacing: 1px;
  }
</style>
</head>
<body>
  <!-- ═══ COVER PAGE ═══ -->
  <div class="page parchment">
    <div class="page-border"></div>
    <div class="corner corner-tl">\u2726</div>
    <div class="corner corner-tr">\u2726</div>
    <div class="corner corner-bl">\u2726</div>
    <div class="corner corner-br">\u2726</div>
    <div class="cover-page">
      ${data.boardArtBase64 ? `<div class="cover-art-bg" style="background-image: url('${data.boardArtBase64}')"></div>` : ""}
      <div class="cover-content">
        <div class="cover-ornament-top">\u2726 \u2726 \u2726</div>
        <div class="cover-rule"></div>
        <h1>${esc(data.title)}</h1>
        <div class="cover-rule-thick"></div>
        ${data.subtitle ? `<div class="subtitle">${esc(data.subtitle)}</div>` : ""}
        <div class="cover-scroll-label">Official Rulebook</div>
        ${data.theme ? `<div class="subtitle" style="font-size:14px; color:#7a5c3a; margin-top:8px; font-style:italic;">~ ${esc(data.theme)} ~</div>` : ""}
        <div class="cover-meta">
          ${data.playerCount ? `${esc(data.playerCount)} Players` : ""}
          ${data.playerCount && data.playTime ? `<span class="cover-meta-divider">\u2022</span>` : ""}
          ${data.playTime ? `${esc(data.playTime)}` : ""}
          ${(data.playerCount || data.playTime) && data.age ? `<span class="cover-meta-divider">\u2022</span>` : ""}
          ${data.age ? `Ages ${esc(data.age)}+` : ""}
        </div>
        <div class="cover-bottom-ornament">\u2014 \u2726 \u2014</div>
      </div>
    </div>
    <div class="cover-footer">Based on ${esc(data.baseGame)} \u2022 Created with BoardCraft</div>
  </div>

  <!-- ═══ TABLE OF CONTENTS ═══ -->
  <div class="page parchment">
    <div class="page-border"></div>
    <div class="corner corner-tl">\u2726</div>
    <div class="corner corner-tr">\u2726</div>
    <div class="corner corner-bl">\u2726</div>
    <div class="corner corner-br">\u2726</div>
    <div class="toc-page">
      <h2>Table of Contents</h2>
      <div class="toc-rule"></div>
      <ul class="toc-list">
        ${tocEntries.map((entry, i) => `
          <li class="toc-item">
            <span class="toc-numeral">${toRoman(i + 1)}.</span>
            <span class="toc-title">${esc(entry)}</span>
            <span class="toc-dots"></span>
          </li>
        `).join("")}
      </ul>

      ${data.boardArtBase64 ? `
        <div class="toc-art">
          <img src="${data.boardArtBase64}" alt="Game Board" />
        </div>
      ` : ""}
    </div>
    <div class="page-number">ii</div>
  </div>

  <!-- ═══ CONTENT PAGES ═══ -->
  ${renderContentPages(data)}
</body>
</html>`;
}

function renderContentPages(data: RulebookData): string {
  let pageNum = 1;
  let html = "";

  const allSections: { type: string; content: string }[] = [];

  // Intro / lore
  if (data.description || data.theme) {
    const introText = data.description || `In a world shaped by ${data.theme || "adventure"}, a new chapter of ${data.baseGame} unfolds. Welcome, brave player, to ${data.title} \u2014 where classic strategy meets bold new challenges.`;
    allSections.push({
      type: "intro",
      content: `<div class="lore-box"><p>${esc(introText)}</p></div>`,
    });
  }

  // Card art
  if (data.cardArtBase64) {
    allSections.push({
      type: "card-art",
      content: `<div class="card-art-float"><img src="${data.cardArtBase64}" alt="Card Art" /></div>`,
    });
  }

  // Sections
  for (const s of data.sections) {
    allSections.push({
      type: "section",
      content: `
        <h2 class="section-heading">${esc(s.heading)}</h2>
        <div class="section-rule"></div>
        <div class="content">${renderBody(s.body)}</div>
      `,
    });
  }

  // Custom rules
  if (data.customRules && data.customRules.length > 0) {
    allSections.push({
      type: "custom-rules",
      content: `
        <div class="custom-rules">
          <h3>House Rules &amp; Variants</h3>
          <ul>
            ${data.customRules.map((r) => `<li>${esc(r)}</li>`).join("")}
          </ul>
        </div>
      `,
    });
  }

  // Paginate
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
    const isFirst = pageNum === 1;
    html += `
      <div class="page parchment">
        <div class="page-border"></div>
        <div class="corner corner-tl">\u2726</div>
        <div class="corner corner-tr">\u2726</div>
        <div class="corner corner-bl">\u2726</div>
        <div class="corner corner-br">\u2726</div>
        <div class="content-page">
          <div class="page-header">
            <span class="page-header-title">${esc(data.title)} \u2014 Rulebook</span>
          </div>
          ${isFirst && data.boardArtBase64 ? `
            <div class="art-banner">
              <img src="${data.boardArtBase64}" alt="Board Art" />
              <div class="art-banner-overlay"></div>
            </div>
          ` : ""}
          ${page.join("\n")}
        </div>
        <div class="page-number">${pageNum}</div>
      </div>
    `;
    pageNum++;
  }

  // Back page
  html += `
    <div class="page parchment">
      <div class="page-border"></div>
      <div class="corner corner-tl">\u2726</div>
      <div class="corner corner-tr">\u2726</div>
      <div class="corner corner-bl">\u2726</div>
      <div class="corner corner-br">\u2726</div>
      <div class="cover-page">
        ${data.boardArtBase64 ? `<div class="cover-art-bg" style="background-image: url('${data.boardArtBase64}')"></div>` : ""}
        <div class="cover-content">
          <div class="cover-ornament-top">\u2726 \u2726 \u2726</div>
          <div class="cover-rule"></div>
          <h1 style="font-size:32px; letter-spacing:4px;">${esc(data.title)}</h1>
          <div class="cover-rule-thick"></div>
          <div class="cover-scroll-label">May Fortune Favor You</div>
          <div class="cover-meta" style="margin-top:16px;">
            A custom ${esc(data.baseGame)} experience<br>
            <span style="font-size:10px; opacity:0.7;">Created with BoardCraft</span>
          </div>
          <div class="cover-bottom-ornament">\u2014 \u2726 \u2014</div>
        </div>
      </div>
    </div>
  `;

  return html;
}

function buildToc(data: RulebookData): string[] {
  const entries: string[] = [];
  if (data.description || data.theme) entries.push("Introduction & Lore");
  for (const s of data.sections) entries.push(s.heading);
  if (data.customRules && data.customRules.length > 0) entries.push("House Rules & Variants");
  return entries;
}

function toRoman(num: number): string {
  const map: [number, string][] = [
    [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
  ];
  let result = "";
  for (const [value, numeral] of map) {
    while (num >= value) {
      result += numeral;
      num -= value;
    }
  }
  return result;
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
      html += `<div class="callout"><div class="callout-label">Note</div><p>${esc(trimmed.slice(4))}</p></div>\n`;
    } else if (trimmed.startsWith("## ")) {
      html += `<h2 class="section-heading" style="font-size:17px; margin-top:18px;">${esc(trimmed.slice(3))}</h2><div class="section-rule"></div>\n`;
    } else if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
      html += `<p style="font-weight:bold; color:#3d1f08;">${esc(trimmed.slice(2, -2))}</p>\n`;
    } else {
      html += `<p>${esc(trimmed)}</p>\n`;
    }
  }

  if (inList) html += "</ul>\n";
  return html;
}
