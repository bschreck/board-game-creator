import { RulebookData } from "../types";

export function renderFantasyTemplate(data: RulebookData): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Georgia', 'Times New Roman', serif;
    color: #2c1810;
    background: #f4e8d1;
    width: 210mm;
    min-height: 297mm;
  }
  .page {
    width: 210mm;
    min-height: 297mm;
    padding: 20mm 25mm;
    background: #f4e8d1;
    position: relative;
    page-break-after: always;
  }
  .page::before {
    content: '';
    position: absolute;
    top: 10mm;
    left: 10mm;
    right: 10mm;
    bottom: 10mm;
    border: 3px double #8b6914;
    border-radius: 4px;
    pointer-events: none;
  }
  .cover {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    min-height: 257mm;
  }
  .cover h1 {
    font-size: 42px;
    color: #5c3317;
    text-transform: uppercase;
    letter-spacing: 4px;
    margin-bottom: 8px;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
  }
  .cover .subtitle {
    font-size: 18px;
    color: #8b6914;
    font-style: italic;
    margin-bottom: 32px;
  }
  .cover .ornament {
    font-size: 28px;
    color: #8b6914;
    margin: 16px 0;
    letter-spacing: 8px;
  }
  .cover .meta {
    margin-top: 40px;
    font-size: 13px;
    color: #7a5c3a;
    line-height: 1.8;
  }
  .content h2 {
    font-size: 24px;
    color: #5c3317;
    border-bottom: 2px solid #8b6914;
    padding-bottom: 6px;
    margin: 28px 0 14px;
    text-transform: uppercase;
    letter-spacing: 2px;
  }
  .content h2:first-child { margin-top: 0; }
  .content p, .content li {
    font-size: 13px;
    line-height: 1.75;
    color: #3d2b1f;
    margin-bottom: 10px;
  }
  .content ul, .content ol {
    padding-left: 20px;
    margin-bottom: 14px;
  }
  .content li { margin-bottom: 6px; }
  .custom-rules {
    background: rgba(139,105,20,0.08);
    border-left: 4px solid #8b6914;
    padding: 14px 18px;
    margin: 18px 0;
    border-radius: 0 6px 6px 0;
  }
  .custom-rules h3 {
    font-size: 16px;
    color: #5c3317;
    margin-bottom: 10px;
  }
  .footer {
    position: absolute;
    bottom: 14mm;
    left: 25mm;
    right: 25mm;
    text-align: center;
    font-size: 10px;
    color: #a08060;
    font-style: italic;
  }
</style>
</head>
<body>
  <div class="page">
    <div class="cover">
      <div class="ornament">\u2726 \u2726 \u2726</div>
      <h1>${esc(data.title)}</h1>
      ${data.subtitle ? `<div class="subtitle">${esc(data.subtitle)}</div>` : ""}
      <div class="ornament">\u2014\u2014 Official Rulebook \u2014\u2014</div>
      ${data.theme ? `<div class="subtitle">Theme: ${esc(data.theme)}</div>` : ""}
      <div class="meta">
        ${data.playerCount ? `Players: ${esc(data.playerCount)}<br>` : ""}
        ${data.playTime ? `Play Time: ${esc(data.playTime)}<br>` : ""}
        ${data.age ? `Ages: ${esc(data.age)}+` : ""}
      </div>
      <div class="ornament" style="margin-top:40px">\u2726 \u2726 \u2726</div>
    </div>
    <div class="footer">Based on ${esc(data.baseGame)} \u2022 Created with BoardCraft</div>
  </div>

  <div class="page">
    <div class="content">
      ${data.sections.map((s) => `
        <h2>${esc(s.heading)}</h2>
        ${renderBody(s.body)}
      `).join("")}

      ${data.customRules && data.customRules.length > 0 ? `
        <div class="custom-rules">
          <h3>\u2726 House Rules</h3>
          <ul>
            ${data.customRules.map((r) => `<li>${esc(r)}</li>`).join("")}
          </ul>
        </div>
      ` : ""}
    </div>
    <div class="footer">Based on ${esc(data.baseGame)} \u2022 Created with BoardCraft</div>
  </div>
</body>
</html>`;
}

function esc(str: string | undefined | null): string {
  return (str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderBody(body: string): string {
  return body
    .split("\n")
    .filter((line) => line.trim())
    .map((line) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        return `<li>${esc(trimmed.slice(2))}</li>`;
      }
      return `<p>${esc(trimmed)}</p>`;
    })
    .join("\n");
}
