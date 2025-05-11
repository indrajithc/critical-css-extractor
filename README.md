
# ⚡ Critical CSS Extractor

A simple Node.js utility to extract and inline Critical CSS from your HTML using [`critical`](https://github.com/addyosmani/critical).

---

## 🚀 Overview

This tool analyzes your HTML and CSS files to extract only the styles needed for above-the-fold content. It outputs a minimized Critical CSS block, helping you improve initial page load performance and pass Core Web Vitals like First Contentful Paint (FCP) and Largest Contentful Paint (LCP).

---

## 💡 Features

- 🧠 Automatically extracts Critical CSS for faster rendering.
- 🧼 Inlines Critical CSS into your HTML or outputs it to a file.
- 📄 Supports multiple viewports (mobile, tablet, desktop).
- ⚙️ Fully configurable via `critical` options.
- 🔌 Easy to integrate with build tools and CI/CD pipelines.

---

## 📦 Installation

1. Clone the repository:

```bash
git clone https://github.com/indrajithc/critical-css-extractor.git
cd critical-css-extractor
````

2. Install dependencies:

```bash
npm install
```

---

## 🛠 Usage

1. Place your **HTML content** in `index.html`.

2. Place your **CSS file** in `styles.css`.

3. Run the extractor:

```bash
node critical.js
```

4. The Critical CSS will be:

* Inlined into a new HTML file: `index-critical.html`
* Saved as a standalone file: `critical.css`

---

## ⚙️ Configuration

By default, the script looks for the following files:

| File                  | Description                        |
| --------------------- | ---------------------------------- |
| `index.html`          | Your input HTML file               |
| `styles.css`          | Full CSS to extract from           |
| `critical.css`        | Output file with Critical CSS only |
| `index-critical.html` | HTML with Critical CSS inlined     |

You can customize viewport dimensions, output options, or input paths by editing `critical.js`.

---

## 💡 Example

**HTML:**

```html
<!DOCTYPE html>
<html>
  <head>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <div class="hero">Welcome</div>
  </body>
</html>
```

**CSS:**

```css
.hero { font-size: 2rem; color: navy; }
.footer { display: none; }
```

After running the script, `critical.css` will only contain:

```css
.hero{font-size:2rem;color:navy}
```

And the `index-critical.html` will inline it inside a `<style>` tag in `<head>`.

---

## 📜 License

MIT License.

---

## 🙌 Contributing

Contributions are welcome! Feel free to fork the project, open issues, or submit a PR with improvements or new features.

---

## 💬 Contact

Made with ❤️ by [Indrajith C](https://github.com/indrajithc).