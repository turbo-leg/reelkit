// Renders one still per example into out/stills/. CI runs this: a component that throws or
// fails to render fails the build. Usage: node scripts/render-stills.mjs [Id ...]
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";

const source = readFileSync("examples/Root.tsx", "utf8");
const all = [...source.matchAll(/\{ id: "([^"]+)",[^}]*still: (\d+) \}/g)].map((m) => ({ id: m[1], beat: Number(m[2]) }));
const wanted = process.argv.slice(2);
const list = wanted.length ? all.filter((e) => wanted.includes(e.id)) : all;
if (!list.length) throw new Error("no examples found in examples/Root.tsx");

mkdirSync("out/stills", { recursive: true });
const npx = process.platform === "win32" ? "npx.cmd" : "npx";
for (const { id, beat } of list) {
  const frame = Math.round((beat * 60) / 30);
  console.log(`still ${id} @ beat ${beat} (frame ${frame})`);
  execFileSync(npx, ["remotion", "still", "examples/index.ts", id, `out/stills/${id}.jpeg`, `--frame=${frame}`, "--image-format=jpeg", "--log=error"], { stdio: "inherit", shell: process.platform === "win32" });
}
console.log(`rendered ${list.length} stills`);
