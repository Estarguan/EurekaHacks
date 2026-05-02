import esbuild from "esbuild";
import process from "process";
import builtins from "builtin-modules";
import fs from "fs";

const VAULT_PATHS = [
  "C:/Users/aweso/OneDrive/Desktop/EurekaHacks1/.obsidian/plugins/didyouevenlisten",
  "/Users/estarguan/Documents/Eureka/.obsidian/plugins/didyouevenlisten",
];

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = `${src}/${entry.name}`;
    const destPath = `${dest}/${entry.name}`;
    if (entry.isDirectory()) copyDirRecursive(srcPath, destPath);
    else fs.copyFileSync(srcPath, destPath);
  }
}

function syncToVault() {
  for (const vault of VAULT_PATHS) {
    if (fs.existsSync(vault)) {
      fs.copyFileSync("main.js", `${vault}/main.js`);
      fs.copyFileSync("styles.css", `${vault}/styles.css`);
      fs.copyFileSync("manifest.json", `${vault}/manifest.json`);
      copyDirRecursive("src/assets", `${vault}/assets`);
      console.log(`[sync] → ${vault}`);
    }
  }
}

const prod = process.argv[2] === "production";

const syncPlugin = {
  name: "sync-to-vault",
  setup(build) {
    build.onEnd((result) => {
      if (result.errors.length === 0) syncToVault();
    });
  },
};

const context = await esbuild.context({
  entryPoints: ["src/main.ts"],
  bundle: true,
  external: [
    "obsidian",
    "electron",
    "@codemirror/autocomplete",
    "@codemirror/collab",
    "@codemirror/commands",
    "@codemirror/language",
    "@codemirror/lint",
    "@codemirror/search",
    "@codemirror/state",
    "@codemirror/view",
    "@lezer/common",
    "@lezer/highlight",
    "@lezer/lr",
    ...builtins,
  ],
  format: "cjs",
  target: "es2018",
  logLevel: "info",
  sourcemap: prod ? false : "inline",
  treeShaking: true,
  outfile: "main.js",
  plugins: [syncPlugin],
});

if (prod) {
  await context.rebuild();
  syncToVault();
  process.exit(0);
} else {
  await context.watch();
}
