import esbuild from "esbuild";
import process from "process";
import builtins from "builtin-modules";
import fs from "fs";

const VAULT_PATHS = [
  "C:/Users/aweso/OneDrive/Desktop/EurekaHacks1/.obsidian/plugins/notereal",
  "/Users/estarguan/Documents/Eureka/.obsidian/plugins/notereal",
];

function syncToVault() {
  for (const vault of VAULT_PATHS) {
    if (fs.existsSync(vault)) {
      fs.copyFileSync("main.js", `${vault}/main.js`);
      fs.copyFileSync("styles.css", `${vault}/styles.css`);
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
