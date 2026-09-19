<div align="center">

# Image OCR

**Extract text from images directly inside VS Code** with 100% local and private processing.

[![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/manojpatode.image-ocr?style=flat-square&color=blue)](https://marketplace.visualstudio.com/items?itemName=manojpatode.image-ocr)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/manojpatode.image-ocr?style=flat-square&color=green)](https://marketplace.visualstudio.com/items?itemName=manojpatode.image-ocr)
[![License](https://img.shields.io/badge/license-MIT-yellow.svg?style=flat-square)](LICENSE)

</div>

---

> ![Image OCR Demo](https://raw.githubusercontent.com/manojdevworkspace/image-ocr/main/demo.gif)

**Image OCR** is a lightweight, privacy-focused extension that brings Optical Character Recognition straight to your editor. Right-click any image in your workspace and instantly extract its text into a clean editor tab.

> 🔒 **100% Local & Private** — All OCR processing runs entirely on your machine. No external API calls, no cloud storage, and your data never leaves your computer.

---

## ✨ Features

- 🖱️ **Context Menu Integration:** Right-click any image file in the Explorer and select `Extract Text (OCR)`.
- 📋 **Clipboard Support:** Quickly extract text directly from your system clipboard using the status bar button "OCR Clipboard" at the bottom right.
- 📄 **Instant Editor Output:** Results open seamlessly in a new plaintext editor tab—ready to copy, edit, or save.
- 🖼️ **Comprehensive Format Support:** Works out-of-the-box with all common image types:

| Format | Extensions | Notes |
| :--- | :--- | :--- |
| **PNG** | `.png` | Fully supported |
| **JPEG** | `.jpg`, `.jpeg` | Fully supported |
| **WebP** | `.webp` | Fully supported |
| **BMP** | `.bmp` | Fully supported |
| **TIFF** | `.tiff`, `.tif` | Fully supported |
| **GIF** | `.gif` | Fully supported |
| **SVG** | `.svg` | Automatically converted to PNG first |

---
 
## 🚀 Usage

1. Open any project folder or workspace in VS Code.
2. Right-click an image file in the **Explorer** sidebar.
3. Click **Extract Text (OCR)**.
4. Watch the progress notification while the engine runs.
5. The extracted text will automatically open in a **new plaintext editor tab**.

> **💡 First-Run Note:** Required dependencies (`tesseract.js` + `sharp`) are automatically downloaded and installed on your first use (takes 15–30 seconds). All subsequent runs are completely instant.

---

## ⌨️ Command Palette Reference

You can also run extension features directly via the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`):

- `Image OCR: Extract Text from Image` — Triggers image extraction.
- `Image OCR: Extract Clipboard` — Performs OCR on current clipboard content.

---

## 💻 Requirements

- **VS Code:** Version `^1.85.0` or higher.
- **Node.js & npm:** Must be available on your system `PATH` (utilized for the automatic first-run dependency installation).
- **Internet Connection:** Required strictly on the *first run* to fetch local helper libraries.

---

## ⚙️ Extension Settings

*Future updates will introduce configuration options, including:*
- Language selection for OCR (default: English)
- Multi-line vs single-line output preference toggles
- Auto-copy to clipboard options

---

## ⚠️ Known Issues & Limitations

- **First-Run Delay:** Initial setup takes 15–30 seconds. This is standard behavior as local binaries settle.
- **SVGs with External Assets:** SVGs referencing external web fonts or remote images may experience rendering artifacts during conversion.
- **Handwriting Recognition:** Best suited for digital, typed, or printed text. Handwritten note accuracy may vary.
- **Image Resolution:** Extremely blurry or low-res images can negatively impact accuracy.

---

## 📋 Release Notes

### 0.1.1
- Reduced extension package size from ~100MB to ~35MB.
- Stripped unused Tesseract language files (retaining English for a lean footprint).
- Cleaned up non-Windows binaries and documentation folders from dependencies.

### 0.1.0
- Updated output format refinements and layout improvements.

### 0.0.2
- Added clipboard OCR functionality via status bar (`OCR Clipboard`).
- Improved cross-platform compatibility for clipboard read operations using PowerShell.

### 0.0.1
- Initial release with core OCR support across multiple formats.

---

## 👨‍💻 Author

Made with ❤️ by **Manoj Patode**

- Powered by [Tesseract.js](https://github.com/naptha/tesseract.js)
- SVG conversion powered by [Sharp](https://sharp.pixelplumbing.com/)