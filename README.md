# Image OCR

**Extract text from images directly inside VS Code** — right-click any image in the Explorer and get OCR results in a new editor tab instantly.

Built by **Manoj Patode** using [Tesseract.js](https://github.com/naptha/tesseract.js).

> 🔒 **100% local & private** — all OCR processing happens on your machine. No API calls, no data ever leaves your computer.

---

## Features

- 🖱️ **Right-click any image** in the Explorer → `Extract Text (OCR)`
- 📄 **Opens result in a new editor tab** — ready to copy, edit, or save
- 📝 **Single-line output** — all whitespace collapsed for clean results
- 🖼️ **Supports all common formats:**

| Format | Extension |
|--------|-----------|
| PNG | `.png` |
| JPEG | `.jpg`, `.jpeg` |
| WebP | `.webp` |
| BMP | `.bmp` |
| TIFF | `.tiff`, `.tif` |
| GIF | `.gif` |
| SVG | `.svg` *(auto-converted to PNG first)* |

---

## Usage

1. Open any project folder in VS Code
2. Right-click an image file in the **Explorer** sidebar
3. Click **Extract Text (OCR)**
4. A progress notification appears while OCR runs
5. The extracted text opens in a **new plaintext editor tab**

> **First run:** Dependencies (`tesseract.js` + `sharp`) are automatically installed on first use. This takes 15–30 seconds. Subsequent runs are instant.

---

## Requirements

- VS Code `^1.85.0`
- Node.js and npm must be available on your `PATH` (for first-run dependency install)
- Internet connection on first use (to download Tesseract.js and Sharp)

---

## Extension Settings

This extension has no configurable settings currently. Future versions will support:
- Language selection for OCR (default: English)
- Multi-line vs single-line output toggle
- Copy to clipboard option

---

## Known Issues

- **First-run delay:** Dependency install takes 15–30s on first use — this is expected.
- **SVG with external assets:** SVGs that reference external fonts or images may not render perfectly during conversion.
- **Handwritten text:** OCR accuracy is best on printed/digital text. Handwriting recognition is limited.
- **Low-resolution images:** Very small or blurry images may produce poor results.

---

## Release Notes

### 0.0.2
- Added clipboard OCR via status bar button (`OCR Clipboard`)
- Fixed clipboard read to use PowerShell instead of Electron (was failing with "Cannot read properties of undefined")
- Extension now activates on VS Code startup

### 0.0.1
- Initial release
- OCR support for PNG, JPG, JPEG, WEBP, BMP, TIFF, GIF, SVG
- Single-line formatted output
- Auto dependency installation on first use

---

## About

Made with ❤️ by **Manoj Patode**

- Powered by [Tesseract.js](https://github.com/naptha/tesseract.js) — pure JavaScript OCR engine
- SVG conversion via [Sharp](https://sharp.pixelplumbing.com/)
- Runs entirely offline/local — no external API, your images and text never leave your machine