import axios from "axios";
import { JSDOM } from "jsdom";
import postcss from "postcss";
import purgecssModule from "@fullhuman/postcss-purgecss";
import fs from "fs";
import path from "path";
// import cssnano from "cssnano";
import autoprefixer from "autoprefixer";
import flexbugs from "postcss-flexbugs-fixes";
import presetEnv from "postcss-preset-env";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { generate } from "critical";

// Resolve __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log("Critical CSS Generator");
dotenv.config();

const safelistSelectors = JSON.parse(process.env.SAFELIST_SELECTORS || "[]");

const cssOverrides = [
{
  original: "screen-desktop.css",
  override: path.resolve(__dirname, "./overrides/screen-desktop.css"),
},
{
  original: "fonts.css",
  override: path.resolve(__dirname, "./overrides/fonts.css"),
},
];

async function downloadFile(url) {
try {
  const response = await axios.get(url, { responseType: "text" });
  return response.data;
} catch (error) {
  console.error(`❌ Failed to download: ${url}`, error.message);
  return "";
}
}

// async function generateCriticalCSS(html, processedCSS) {
//   const { css: criticalCSS } = await generate({
//     base: process.cwd(),
//     html,
//     css: [processedCSS],
//     inline: false,
//     width: 1300,
//     height: 900,
//   });

//   return criticalCSS;
// }

async function extractCSSLinksWithMedia(html) {
const dom = new JSDOM(html);
const document = dom.window.document;
const links = [...document.querySelectorAll('link[rel="stylesheet"]')];

return links
  .filter(
    (link) =>
      link.href &&
      (link.href.startsWith("http://") ||
        link.href.startsWith("https://") ||
        link.href.startsWith("//"))
  )
  .map((link) => ({
    href: link.href.replace(/^\/\//, "https://"),
    media: link.media || null,
  }));
}

async function purgeCSS(html, cssList) {
const purgecss = purgecssModule.default || purgecssModule;
const combinedCSS = cssList.map((entry) => entry.css).join("\n");

try {
  const result = await postcss([
    flexbugs,
    presetEnv({ stage: 3, features: { "nesting-rules": true } }),
    autoprefixer,
    purgecss({
      content: [{ raw: html, extension: "html" }],
      safelist: safelistSelectors,
      defaultExtractor: (content) => content.match(/[\w-/:]+(?<!:)/g) || [],
    }),
  ]).process(combinedCSS, { from: undefined });

  return result.css;
} catch (err) {
  console.error("❌ Error while purging/minifying CSS:", err.message);
  return "";
}
}

function isValidCSS(css) {
return css && css.includes("{") && css.includes("}");
}

const doAction = async (targetUrl) => {
try {
  console.log(`🌐 Fetching HTML from: ${targetUrl}`);
  const htmlData = await downloadFile(targetUrl);

  const cssLinks = await extractCSSLinksWithMedia(htmlData);
  console.log(`🔍 Found ${cssLinks.length} CSS files.`);

  if (!cssLinks.length) {
    console.log("❌ No CSS files found.");
    return;
  }

  const cssContents = [];

  console.log({ cssLinks: cssLinks.map((link) => link.href) });

  for (let i = 0; i < cssLinks.length; i++) {
    const { href: url, media } = cssLinks[i];
    const fileName = path.basename(new URL(url).pathname);
    const overrideEntry = cssOverrides.find((o) => o.original === fileName);
    let css;

    try {
      if (overrideEntry) {
        console.log(
          `📁 Using local override for ${fileName}: ${overrideEntry.override}`
        );
        css = fs.readFileSync(overrideEntry.override, "utf-8");
      } else {
        console.log(`🌐 Downloading remote CSS: ${url}`);
        css = await downloadFile(url);

        const baseUrl =
          new URL(url).origin + path.dirname(new URL(url).pathname) + "/";
        css = css.replace(
          /url\((['"]?)(\.{1,2}\/[^'")]+)\1\)/g,
          (match, quote, relativePath) => {
            const absoluteUrl = new URL(relativePath, baseUrl).href;
            return `url(${quote}${absoluteUrl}${quote})`;
          }
        );
      }

      if (!isValidCSS(css)) {
        throw new Error(
          `❌ Invalid CSS from ${
            overrideEntry ? overrideEntry.override : url
          }`
        );
      }

      if (media && media.trim()) {
        console.log(`🎯 Wrapping ${fileName} with media: ${media}`);
        css = `@media ${media} {\n${css}\n}`;
      }

      cssContents.push({
        fileName,
        css,
        source: overrideEntry ? "local" : "remote",
      });
    } catch (err) {
      console.error(err.message);
      console.error(
        `❌ Failed to process ${overrideEntry ? overrideEntry.override : url}`
      );
      continue;
    }
  }

  const tempDir = path.join(__dirname, "temp_css");
  fs.mkdirSync(tempDir, { recursive: true });

  cssContents.forEach((entry, index) => {
    const baseName = entry.fileName || `cssfile-${index}.css`;
    const safeName = baseName.replace(/[^a-z0-9_.-]/gi, "_");
    const finalName = `original-${index}-${safeName}`;
    fs.writeFileSync(path.join(tempDir, finalName), entry.css);
    console.log(`💾 Saved: ${finalName} (${entry.source})`);
  });

  const purgedCSS = await purgeCSS(htmlData, cssContents);

  console.log({ purgedCSS });

} catch (error) {
  console.error("❌ Server Error:", error);
  return;
}
};

doAction("https://www.url.com/");
