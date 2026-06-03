const { marked } = require('marked');
const fs = require('fs');
const path = require('path');

const DOCS = '/Users/lionelleguier/ProjetDevOps/docs';
const mdPath = path.join(DOCS, 'RAPPORT.md');
const htmlPath = path.join(DOCS, '.rapport.build.html');

let md = fs.readFileSync(mdPath, 'utf8');

// marked: tables + gfm
marked.setOptions({ gfm: true, breaks: false });
const body = marked.parse(md);

const css = `
  @page { size: A4; margin: 18mm 16mm; }
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    font-size: 11pt; line-height: 1.5; color: #1a1a2e; max-width: 100%;
  }
  h1 { font-size: 23pt; margin: 0 0 4pt; color: #4c1d95; }
  h2 { font-size: 15pt; margin: 22pt 0 6pt; padding-bottom: 4pt;
       border-bottom: 2px solid #ede9fe; color: #5b21b6; page-break-after: avoid; }
  h3 { font-size: 12.5pt; margin: 14pt 0 4pt; color: #6d28d9; page-break-after: avoid; }
  p { margin: 6pt 0; }
  a { color: #6d28d9; text-decoration: none; }
  code { font-family: "SF Mono", Menlo, Consolas, monospace; font-size: 9pt;
         background: #f4f2fb; padding: 1px 4px; border-radius: 3px; }
  pre { background: #f7f6fc; border: 1px solid #e9e5f8; border-radius: 6px;
        padding: 10px 12px; overflow: hidden; page-break-inside: avoid; }
  pre code { background: none; padding: 0; font-size: 8pt; line-height: 1.35;
             white-space: pre; }
  table { border-collapse: collapse; width: 100%; margin: 8pt 0; font-size: 9.5pt;
          page-break-inside: avoid; }
  th, td { border: 1px solid #ddd6fe; padding: 5px 8px; text-align: left; vertical-align: top; }
  th { background: #f5f3ff; color: #5b21b6; font-weight: 600; }
  img { max-width: 100%; height: auto; border: 1px solid #e2e0f0; border-radius: 6px;
        margin: 6pt 0; display: block; page-break-inside: avoid; }
  blockquote { border-left: 3px solid #c4b5fd; margin: 8pt 0; padding: 2pt 12pt;
               color: #4a4a6a; background: #faf9ff; }
  hr { border: none; border-top: 1px solid #e9e5f8; margin: 16pt 0; }
  h2 { string-set: none; }
`;

const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<style>${css}</style></head><body>${body}</body></html>`;

fs.writeFileSync(htmlPath, html);
console.log('HTML écrit :', htmlPath);
