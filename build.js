// Package this extension into a distributable `.azp`.
//   node build.js   →   my-extension-1.0.0.azp
//
// The `.azp` bundles manifest.json + LICENSE + every file under code/ ui/ assets/.
// writeAzp() computes each file's integrity digest for you (the manifest's `files`
// map), so you never write it by hand.
import fs from "node:fs";
import path from "node:path";
import { writeAzp } from "@azphalt/azp";

const manifest = JSON.parse(fs.readFileSync("manifest.json", "utf-8"));

const payload = {};
for (const dir of ["code", "ui", "assets"]) {
  if (!fs.existsSync(dir)) continue;
  for (const rel of walk(dir)) payload[rel] = fs.readFileSync(rel);
}

const license = fs.existsSync("LICENSE")
  ? fs.readFileSync("LICENSE", "utf-8")
  : manifest.license || "All Rights Reserved";

const { azp } = writeAzp({ manifest, payload, license });
const out = `${manifest.name.replace(/\s+/g, "-").toLowerCase()}-${manifest.version}.azp`;
fs.writeFileSync(out, azp);
console.log(`Built ${out} (${azp.length} bytes)`);

/** All files under `dir`, as `/`-separated paths (the in-package layout). */
function walk(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = path.posix.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(rel));
    else if (e.isFile()) out.push(rel);
  }
  return out;
}
