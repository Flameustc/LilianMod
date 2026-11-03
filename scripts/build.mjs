import esbuild from "esbuild";
import { readFileSync } from "node:fs";

const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));

// Userscript managers require real line breaks in the header. npm's shell does not
// turn "\\n" inside package.json into those breaks, so the banner is built here.
const banner = [
  "// ==UserScript==",
  "// @name LilianMod",
  "// @namespace lilianmod",
  `// @version ${pkg.version}`,
  "// @description LilianMod for BondageClub",
  "// @match https://www.bondageprojects.elementfx.com/R*",
  "// @grant none",
  "// ==/UserScript==",
].join("\n");

const options = {
  entryPoints: ["src/index.ts"],
  bundle: true,
  format: "iife",
  target: "es2018",
  outfile: "dist/lilianmod.user.js",
  banner: { js: banner },
};

if (process.argv.includes("--watch")) {
  const ctx = await esbuild.context(options);
  await ctx.watch();
} else {
  await esbuild.build(options);
}
