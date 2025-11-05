// src/analyzeComparison.js
// Lê TODOS os arquivos js_results*.csv e c_results*.csv em data/,
// agrega por label e calcula médias + razão JS/C.
// Uso: node src/analyzeComparison.js

import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const OUT_FILE = path.join(DATA_DIR, "comparison_summary.csv");

// ----------------- Utilitários -----------------

function listResultFiles(prefix) {
  const all = readdirSync(DATA_DIR);
  const matched = all
    .filter((f) => f.startsWith(prefix) && f.endsWith(".csv"))
    // ordenar numericamente quando houver sufixo "-N"
    .sort((a, b) => {
      const na = a.match(/-(\d+)\.csv$/)?.[1];
      const nb = b.match(/-(\d+)\.csv$/)?.[1];
      if (na && nb) return Number(na) - Number(nb);
      if (na) return 1;
      if (nb) return -1;
      return a.localeCompare(b);
    });

  // fallback para arquivo simples sem sufixo, caso nenhum -N exista
  if (matched.length === 0) {
    const single = `${prefix}.csv`;
    if (readdirSync(DATA_DIR).includes(single)) return [single];
  }
  return matched;
}

function parseCsv(pathStr) {
  const raw = readFileSync(pathStr, "utf8").trim();
  if (!raw) return [];
  const lines = raw.split(/\r?\n/).filter(Boolean);
  if (lines.length <= 1) return [];
  const header = lines[0].split(",");
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(",");
    if (parts.length < header.length) continue;
    const row = {};
    header.forEach((h, idx) => (row[h.trim()] = parts[idx]?.trim()));
    // normalizações
    row.elapsed_ms = parseFloat(row.elapsed_ms);
    row.n = parseInt(row.n, 10);
    row.maxVal = parseInt(row.maxVal, 10);
    rows.push(row);
  }
  return rows;
}

function loadAll(prefix) {
  const files = listResultFiles(prefix);
  let rows = [];
  for (const f of files) {
    const p = path.join(DATA_DIR, f);
    const parsed = parseCsv(p);
    rows = rows.concat(parsed);
  }
  console.log(
    `📥 ${prefix}: ${files.length} arquivo(s), ${rows.length} linha(s) agregadas`
  );
  return rows;
}

function groupByLabel(rows) {
  const map = {};
  for (const r of rows) {
    if (!r?.label) continue;
    if (!map[r.label]) map[r.label] = [];
    map[r.label].push(r);
  }
  return map;
}

function mean(values) {
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

// ----------------- Pipeline -----------------

console.log("🔎 Lendo e agregando CSVs em /data ...");
const jsRows = loadAll("js_results");
const cRows = loadAll("c_results");

const jsGroups = groupByLabel(jsRows);
const cGroups = groupByLabel(cRows);

const allLabels = new Set([
  ...Object.keys(jsGroups),
  ...Object.keys(cGroups),
]);

const out = ["label,n,maxVal,mean_js_ms,mean_c_ms,ratio_js_c"];

for (const label of Array.from(allLabels).sort()) {
  const js = jsGroups[label] || [];
  const c = cGroups[label] || [];

  // n e maxVal: pegamos do primeiro disponível daquele label
  const n = js[0]?.n ?? c[0]?.n ?? 0;
  const maxVal = js[0]?.maxVal ?? c[0]?.maxVal ?? 0;

  const meanJs = mean(js.map((r) => r.elapsed_ms));
  const meanC = mean(c.map((r) => r.elapsed_ms));
  const ratio = meanC > 0 ? meanJs / meanC : 0;

  out.push(
    [
      label,
      n,
      maxVal,
      meanJs.toFixed(3),
      meanC.toFixed(3),
      ratio.toFixed(2),
    ].join(",")
  );
}

mkdirSync(DATA_DIR, { recursive: true });
writeFileSync(OUT_FILE, out.join("\n"));
console.log(`✅ Arquivo gerado: ${OUT_FILE}`);
