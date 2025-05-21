import fs from "fs";
import path from "path";
import { generate } from "critical";
import "dotenv/config";

const sourceFile = "./index.html";

const targetFolder = "./critical";

const mkdirSync = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

mkdirSync(targetFolder);

const runCritical = async () => {
  try {
    const response = await generate({
      base: "./",
      src: sourceFile,
      inline: false,
      // minify: true,
      width: 1300,
      height: 900,
      // target: {
      //   css: 'critical.css',
      //   html: 'index-critical.html',
      //   uncritical: 'uncritical.css',
      // },
    });

    const cssFile = path.join(targetFolder, "critical.css");
    const htmlFile = path.join(targetFolder, "index.html");

    const { html, css } = response;

    if (html) {
      fs.writeFileSync(htmlFile, html);
      console.log(`HTML saved to ${htmlFile}`);
    }

    if (css) {
      fs.writeFileSync(cssFile, css);
      console.log(`CSS saved to ${cssFile}`);
    }

    console.log({ response });
    console.log("Critical CSS generated.");
  } catch (err) {
    console.error("Critical CSS generation failed:", err);
  }
};

runCritical();
