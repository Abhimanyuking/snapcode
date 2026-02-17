/**
 * Multi-file project generators for each framework.
 * Returns Record<filepath, content> for ZIP/StackBlitz/CodeSandbox.
 */

// ── HTML + Tailwind ──
function buildHtmlTailwindProject(code: string): Record<string, string> {
  let html = code;
  if (!html.toLowerCase().includes("<!doctype") && !html.toLowerCase().includes("<html")) {
    html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <title>SnapCode Export</title>
</head>
<body>
${code}
</body>
</html>`;
  } else if (!html.includes("tailwindcss")) {
    html = html.replace("</head>", `  <script src="https://cdn.tailwindcss.com"></script>\n</head>`);
  }
  return { "index.html": html };
}

// ── Bootstrap ──
function buildBootstrapProject(code: string): Record<string, string> {
  let html = code;
  if (!html.toLowerCase().includes("<!doctype") && !html.toLowerCase().includes("<html")) {
    html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
  <title>SnapCode Export</title>
</head>
<body>
${code}
</body>
</html>`;
  }
  return { "index.html": html };
}

// ── React / Next.js ──
function buildReactProject(code: string): Record<string, string> {
  const packageJson = JSON.stringify({
    name: "snapcode-export",
    private: true,
    version: "1.0.0",
    type: "module",
    scripts: {
      dev: "vite",
      build: "vite build",
      preview: "vite preview",
    },
    dependencies: {
      react: "^18.2.0",
      "react-dom": "^18.2.0",
    },
    devDependencies: {
      "@vitejs/plugin-react": "^4.0.0",
      vite: "^5.0.0",
    },
  }, null, 2);

  const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SnapCode Export</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/index.jsx"></script>
</body>
</html>`;

  const viteConfig = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})`;

  const indexJsx = `import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`;

  const indexCss = `@import "tailwindcss/base";
@import "tailwindcss/components";
@import "tailwindcss/utilities";`;

  // Clean code for App.jsx
  let appCode = code;
  // Remove 'use client' / 'use server'
  appCode = appCode.replace(/['"]use (client|server)['"];?\s*/g, "");
  // Ensure it has a default export
  if (!appCode.includes("export default")) {
    // Try to find the main component function
    const funcMatch = appCode.match(/(?:function|const)\s+(\w+)/);
    if (funcMatch) {
      appCode += `\n\nexport default ${funcMatch[1]};`;
    }
  }

  return {
    "package.json": packageJson,
    "index.html": indexHtml,
    "vite.config.js": viteConfig,
    "src/App.jsx": appCode,
    "src/index.jsx": indexJsx,
    "src/index.css": indexCss,
  };
}

// ── Vue ──
function buildVueProject(code: string): Record<string, string> {
  const packageJson = JSON.stringify({
    name: "snapcode-export",
    version: "1.0.0",
    private: true,
    scripts: { dev: "vite", build: "vite build" },
    dependencies: { vue: "^3.4.0" },
    devDependencies: { "@vitejs/plugin-vue": "^5.0.0", vite: "^5.0.0" },
  }, null, 2);

  const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SnapCode Export</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.js"></script>
</body>
</html>`;

  const mainJs = `import { createApp } from "vue";
import App from "./App.vue";
import "./style.css";

createApp(App).mount("#app");`;

  const viteConfig = `import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
});`;

  const styleCss = `@import "tailwindcss/base";
@import "tailwindcss/components";
@import "tailwindcss/utilities";`;

  return {
    "package.json": packageJson,
    "index.html": indexHtml,
    "src/App.vue": code,
    "src/main.js": mainJs,
    "src/style.css": styleCss,
    "vite.config.js": viteConfig,
  };
}

// ── Svelte ──
function buildSvelteProject(code: string): Record<string, string> {
  const packageJson = JSON.stringify({
    name: "snapcode-export",
    version: "1.0.0",
    private: true,
    scripts: { dev: "vite", build: "vite build" },
    devDependencies: {
      "@sveltejs/vite-plugin-svelte": "^3.0.0",
      svelte: "^4.2.0",
      vite: "^5.0.0",
    },
  }, null, 2);

  const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SnapCode Export</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.js"></script>
</body>
</html>`;

  const mainJs = `import App from "./App.svelte";

const app = new App({ target: document.getElementById("app") });

export default app;`;

  const viteConfig = `import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
  plugins: [svelte()],
});`;

  return {
    "package.json": packageJson,
    "index.html": indexHtml,
    "src/App.svelte": code,
    "src/main.js": mainJs,
    "vite.config.js": viteConfig,
  };
}

// ── Public API ──

export function generateProject(code: string, framework: string): Record<string, string> {
  switch (framework) {
    case "react-tailwind":
    case "nextjs":
      return buildReactProject(code);
    case "vue":
      return buildVueProject(code);
    case "svelte":
      return buildSvelteProject(code);
    case "bootstrap":
      return buildBootstrapProject(code);
    default:
      return buildHtmlTailwindProject(code);
  }
}

/** File extension for the main source file */
export function getMainFileExt(framework: string): string {
  switch (framework) {
    case "react-tailwind":
    case "nextjs":
      return "jsx";
    case "vue":
      return "vue";
    case "svelte":
      return "svelte";
    default:
      return "html";
  }
}

/** StackBlitz template name */
export function getStackBlitzTemplate(framework: string): "node" | "html" {
  switch (framework) {
    case "react-tailwind":
    case "nextjs":
    case "vue":
    case "svelte":
      return "node";
    default:
      return "html";
  }
}
