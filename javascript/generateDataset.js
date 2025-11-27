import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const COUNT = 15;
const OUT_DIR = path.join(process.cwd(), "datasets");

// const SPECS = [
//   // Pequeno (rápido, para validar corretude)
//   { label: "array-size-100-with-max-value-50", n: 100, maxVal: 50 },

//   // Médio porte 1 (padrão)
//   { label: "array-size-500-with-max-value-100", n: 500, maxVal: 100 },

//   // Médio porte 2 (maxVal alto)
//   { label: "array-size-500-with-max-value-500", n: 500, maxVal: 500 },

//   // Grande (limite prático)
//   { label: "array-size-1000-with-max-value-100", n: 1000, maxVal: 100 },

//   // Grande (maxVal elevado, stress)
//   { label: "array-size-1000-with-max-value-500", n: 1000, maxVal: 500 },

//   // Extra grande — segura para testes longos
//   { label: "array-size-5000-with-max-value-50", n: 5000, maxVal: 50 },

//   // muitos elementos, DP moderada – bom p/ lotes longos
//   { label: "array-size-10000-with-max-value-10", n: 10000, maxVal: 10 }
// ];

const SPECS = [
  // Grupo 1 – variar n, maxVal fixo
  { label: "n-1000-max-20",   n: 1000,  maxVal: 20 },
  { label: "n-5000-max-20",   n: 5000,  maxVal: 20 },
  { label: "n-10000-max-20",  n: 10000, maxVal: 20 },

  // Grupo 2 – variar maxVal, n fixo
  { label: "n-1000-max-50",    n: 1000, maxVal: 50 },
  { label: "n-1000-max-100",   n: 1000, maxVal: 100 },
  { label: "n-1000-max-500",   n: 1000, maxVal: 500 },
  { label: "n-1000-max-1000",  n: 1000, maxVal: 1000 },
];


let seed = 123456789
function rand01() {
  seed = (1103515245 * seed + 12345) % 0x7fffffff;
  return seed / 0x7fffffff;
}

function genInstance(n, maxVal) {
  const arr = Array.from({ length: n }, () => 1 + Math.floor(rand01() * maxVal));
  const sum = arr.reduce((a, b) => a + b, 0);
  const target = Math.floor(sum / 2);
  return { n, maxVal, arr, target, sum };
}

for (const spec of SPECS) {
  const outFolder = path.join(OUT_DIR, spec.label);

  mkdirSync(outFolder, { recursive: true });

  for (let i = 1; i <= COUNT; i++) {
    const inst = genInstance(spec.n, spec.maxVal);
    const filename = `${spec.label}_${String(i).padStart(3, "0")}.json`;
    writeFileSync(path.join(outFolder, filename), JSON.stringify(inst, null, 2));
  }

  console.log(`✅ Gerados ${COUNT} datasets para ${spec.label}`);
}
