import { RulebookData } from "../types";

export function renderModernTemplate(data: RulebookData): string {
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
    min-height: 297mm;
  }
  .page {
    width: 210mm;
    min-height: 297mm;
    padding: 20mm 25mm;
    background: #ffffff;
    position: relative;
    page-break-after: always;
  }
  .cover {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    min-height: 257mm;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    margin: -20mm -25mm;
    padding: 40mm 30mm;
    color: white;
  }
  .cover h1 {
    font-size: 48px;
    font-weight: 800;
    letter-spacing: -1px;
    margin-bottom: 8px;
  }
  .cover .subtitle {
    font-size: 18px;
    opacity: 0.85;
    font-weight: 300;
    margin-bottom: 24px;
  }
  .cover .divider {
    width: 60px;
    height: 3px;
    background: rgba(255,255,255,0.5);
    margin: 20px auto;
    border-radius: 2px;
  }
  .cover .badge {
    display: inline-block;
    background: rgba(255,255,255,0.15);
    border: 1px solid rgba(255,255,255,0.3);
    border-radius: 20px;
    padding: 6px 18px;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-bottom: 32px;
  }
  .cover .meta {
    font-size: 14px;
    opacity: 0.8;
    line-height: 2;
  }
  .content h2 {
    font-size: 22px;
    font-weight: 700;
    color: #667eea;
    margin: 28px 0 12px;
    padding-bottom: 8px;
    border-bottom: 2px solid #eef0fb;
  }
  .content h2:first-child { margin-top: 0; }
  .content p, .content li {
    font-size: 13px;
    line-height: 1.7;
    color: #333;
    margin-bottom: 10px;
  }
  .content ul, .content ol {
    padding-left: 20px;
    margin-bottom: 14px;
  }
  .content li { margin-bottom: 5px; }
  .custom-rules {
    background: #f0f0ff;
    border-left: 4px solid #667eea;
    padding: 14px 18px;
    margin: 18px 0;
    border-radius: 0 8px 8px 0;
  }
  .custom-rules h3 {
    font-size: 15px;
    font-weight: 700;
    color: #667eea;
    margin-bottom: 10px;
  }
  .footer {
    position: absolute;
    bottom: 14mm;
    left: 25mm;
    right: 25mm;
    text-align: center;
    font-size: 10px;
    color: #aaa;
  }
</style>
</head>
<body>
  <div class="page">
    <div class="cover">
      <div class="badge">Official Rulebook</div>
      <h1>${esc(data.title)}</h1>
      ${data.subtitle ? `<div class="subtitle">${esc(data.subtitle)}</div>` : ""}
      <div class="divider"></div>
      ${data.theme ? `<div class="subtitle">${esc(data.theme)}</div>` : ""}
      <div class="meta">
        ${data.playerCount ? `${esc(data.playerCount)} Players` : ""}
        ${data.playerCount && data.playTime ? " &bull; " : ""}
        ${data.playTime ? `${esc(data.playTime)}` : ""}
        ${(data.playerCount || data.playTime) && data.age ? " &bull; " : ""}
        ${data.age ? `Ages ${esc(data.age)}+` : ""}
      </div>
    </div>
  </div>

  <div class="page">
    <div class="content">
      ${data.sections.map((s) => `
        <h2>${esc(s.heading)}</h2>
        ${renderBody(s.body)}
      `).join("")}

      ${data.customRules && data.customRules.length > 0 ? `
        <div class="custom-rules">
          <h3>Custom Rules</h3>
          <ul>
            ${data.customRules.map((r) => `<li>${esc(r)}</li>`).join("")}
          </ul>
        </div>
      ` : ""}
    </div>
    <div class="footer">Based on ${esc(data.baseGame)} &bull; Created with BoardCraft</div>
  </div>
</body>
</html>`;
}

function esc(str: string): string {
  return str
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
