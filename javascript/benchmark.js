import { readdirSync, readFileSync, mkdirSync, writeFileSync, statSync } from "node:fs";
import path from "node:path";
import { subsetSum } from "./subsetSum.js";

const ROOT = process.cwd();
const TIMES = 20;
const DATASET_DIR = path.join(ROOT, "datasets");
const DATA_DIR = path.join(ROOT, "data");
mkdirSync(DATA_DIR, { recursive: true });

function nowNs() {
  return process.hrtime.bigint();
}

function listJsonFiles(dir) {
  let results = [];
  const entries = readdirSync(dir);
  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(listJsonFiles(fullPath));
    } else if (entry.endsWith(".json")) {
      results.push(fullPath);
    }
  }
  return results;
}

const files = listJsonFiles(DATASET_DIR).sort();
if (files.length === 0) {
  console.error(`No .json files found under ${DATASET_DIR}`);
  process.exit(1);
}

for (let run = 1; run <= TIMES; run++) {
  console.log(`\n=== Run ${run}/${TIMES} ===`);
  const rows = ["language,label,n,maxVal,file,elapsed_ms"]; // fresh per run

  for (const file of files) {
    const instance = JSON.parse(readFileSync(file, "utf8"));
    const label = path.basename(path.dirname(file));
    const filename = path.basename(file);

    const t0 = nowNs();
    subsetSum(instance.arr, instance.target);
    const t1 = nowNs();

    const ms = Number(t1 - t0) / 1e6;
    rows.push(["javascript", label, instance.n, instance.maxVal, filename, ms.toFixed(6)].join(","));
    console.log(`✅ ${label}/${filename}: ${ms.toFixed(3)} ms`);
  }

  const outPath = path.join(DATA_DIR, `js_results-${run}.csv`);
  writeFileSync(outPath, rows.join("\n"));
  console.log(`📊 Resultados salvos em: ${outPath}`);
}
