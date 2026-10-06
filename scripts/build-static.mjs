// scripts/build-static.mjs — `npm run build:static`
// Build estático (export) para NEXT_PUBLIC_DATA_PROVIDER=supabase.
// Las rutas /api/* (SQLite) no pueden existir en un export estático: se apartan temporalmente durante el build.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const api = path.join(root, "app", "api");
const parked = path.join(root, ".api-parked");

if (fs.existsSync(parked)) {
  console.error(".api-parked ya existe (build previo interrumpido). Restaurá app/api a mano y reintentá.");
  process.exit(1);
}
fs.renameSync(api, parked);
let status = 1;
try {
  const r = spawnSync("npx", ["next", "build"], {
    cwd: root,
    stdio: "inherit",
    shell: true,
    env: { ...process.env, NEXT_PUBLIC_DATA_PROVIDER: "supabase" },
  });
  status = r.status ?? 1;
} finally {
  fs.renameSync(parked, api);
}
process.exit(status);
