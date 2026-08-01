#!/usr/bin/env node
// Generates /connect/{crm}-to-{vertical}-software.html files from
// scripts/template.html + scripts/matrix.json.
// Run from the repo root: node scripts/build-connect-pages.js

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TEMPLATE_PATH = path.join(__dirname, 'template.html');
const MATRIX_PATH = path.join(__dirname, 'matrix.json');
const OUT_DIR = path.join(ROOT, 'connect');

const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');
const matrix = JSON.parse(fs.readFileSync(MATRIX_PATH, 'utf8'));

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const pageFilename = (crm, v) => `${crm.slug}-to-${v.name.replace(/\s+/g, '-')}-software.html`;
const pageTitle = (crm, v) => `Connect ${crm.name} to ${v.title}`;
const titleCase = (s) => s.replace(/\b\w/g, c => c.toUpperCase());
const relatedLabel = (crm, v) => `Connect ${crm.name} to ${titleCase(v.name)} Software`;

function renderFlows(flows, crmName) {
  return flows.map(f => {
    const body = f.body.replace(/\{CRM\}/g, crmName);
    const fromTo = `${f.from} → ${f.to.replace(/\{CRM\}/g, crmName)}`;
    return `      <div class="flow">
        <div class="from-to">${escapeHtml(fromTo)}</div>
        <p>${escapeHtml(body)}</p>
      </div>`;
  }).join('\n');
}

function renderRelated(crm, currentVerticalKey) {
  return crm.verticals
    .filter(vk => vk !== currentVerticalKey)
    .map(vk => {
      const v = matrix.verticals[vk];
      return `      <li><a href="${pageFilename(crm, v)}">${escapeHtml(relatedLabel(crm, v))}</a></li>`;
    })
    .join('\n');
}

function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function toolList(tools) {
  if (tools.length <= 2) return tools.join(' and ');
  return tools.slice(0, -1).join(', ') + ', and ' + tools[tools.length - 1];
}

let count = 0;
for (const crm of matrix.crms) {
  for (const vKey of crm.verticals) {
    const v = matrix.verticals[vKey];
    if (!v) {
      console.error(`Missing vertical definition: ${vKey}`);
      process.exit(1);
    }

    const html = template
      .replace(/\{\{CRM_NAME\}\}/g, escapeHtml(crm.name))
      .replace(/\{\{CRM_SHORT\}\}/g, escapeHtml(crm.short))
      .replace(/\{\{VERTICAL_NAME\}\}/g, escapeHtml(v.name))
      .replace(/\{\{VERTICAL_TITLE\}\}/g, escapeHtml(v.title))
      .replace(/\{\{TOOL_LIST\}\}/g, escapeHtml(toolList(v.tools)))
      .replace(/\{\{FLOWS\}\}/g, renderFlows(v.flows, crm.short))
      .replace(/\{\{RELATED\}\}/g, renderRelated(crm, vKey));

    const outPath = path.join(OUT_DIR, pageFilename(crm, v));
    fs.writeFileSync(outPath, html, 'utf8');
    count++;
  }
}

console.log(`Generated ${count} pages in ${path.relative(ROOT, OUT_DIR)}/`);
