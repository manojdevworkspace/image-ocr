import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import * as os from "os";

// Lazy-loaded modules (installed at runtime)
let Tesseract: typeof import("tesseract.js") | null = null;
// Use a loose callable type — sharp's instance type isn't reliably exported across versions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let sharpFn: ((input: string) => any) | null = null;

const SUPPORTED_RASTER = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".bmp",
  ".tiff",
  ".tif",
  ".gif",
]);

// ---------------------------------------------------------------------------
// Activation
// ---------------------------------------------------------------------------

export function activate(context: vscode.ExtensionContext) {
  const cmd = vscode.commands.registerCommand(
    "imageOcr.extractText",
    async (uri: vscode.Uri) => {
      if (!uri) {
        vscode.window.showErrorMessage(
          "Right-click an image file in the Explorer to run OCR."
        );
        return;
      }

      const ext = path.extname(uri.fsPath).toLowerCase();
      const isSvg = ext === ".svg";
      const isRaster = SUPPORTED_RASTER.has(ext);

      if (!isSvg && !isRaster) {
        vscode.window.showErrorMessage(
          `Unsupported file type "${ext}". Supported: PNG, JPG, JPEG, WEBP, BMP, TIFF, GIF, SVG.`
        );
        return;
      }

      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: "Image OCR",
          cancellable: false,
        },
        async (progress) => {
          try {
            // ---------------------------------------------------------------
            // 1. Ensure dependencies are available
            // ---------------------------------------------------------------
            progress.report({ message: "Loading dependencies…" });
            await ensureDependencies(context);

            // ---------------------------------------------------------------
            // 2. Resolve the image path (convert SVG → PNG if needed)
            // ---------------------------------------------------------------
            let imagePath = uri.fsPath;
            let tmpPng: string | null = null;

            if (isSvg) {
              progress.report({ message: "Converting SVG → PNG…" });
              tmpPng = await svgToPng(uri.fsPath, context);
              imagePath = tmpPng;
            }

            // ---------------------------------------------------------------
            // 3. Run Tesseract OCR
            // ---------------------------------------------------------------
            progress.report({ message: "Running OCR…" });
            const rawText = await runOcr(imagePath);

            // Clean up temp file
            if (tmpPng && fs.existsSync(tmpPng)) {
              fs.unlinkSync(tmpPng);
            }

            // ---------------------------------------------------------------
            // 4. Format: collapse all whitespace to a single line
            // ---------------------------------------------------------------
            const singleLine = rawText
              .replace(/\r?\n|\r/g, " ") // newlines → space
              .replace(/\s{2,}/g, " ") // multiple spaces → one
              .trim();

            if (!singleLine) {
              vscode.window.showWarningMessage(
                "OCR completed but no text was detected in the image."
              );
              return;
            }

            // ---------------------------------------------------------------
            // 5. Open result in a new editor tab
            // ---------------------------------------------------------------
            await openTextInEditor(
              singleLine,
              path.basename(uri.fsPath)
            );

            progress.report({ message: "Done!" });
          } catch (err: unknown) {
            const msg =
              err instanceof Error ? err.message : String(err);
            vscode.window.showErrorMessage(`OCR failed: ${msg}`);
          }
        }
      );
    }
  );

  // -------------------------------------------------------------------------
  // Command: OCR from clipboard image
  // -------------------------------------------------------------------------
  const clipCmd = vscode.commands.registerCommand(
    "imageOcr.extractFromClipboard",
    async () => {
      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: "Image OCR — Clipboard",
          cancellable: false,
        },
        async (progress) => {
          try {
                      progress.report({ message: "Reading clipboard image…" });

            const tmpPath = path.join(os.tmpdir(), `vsce-ocr-clipboard-${Date.now()}.png`);

            // Use PowerShell to save clipboard image to a temp PNG (no Electron needed)
            const psCmd = [
              "Add-Type -AssemblyName System.Windows.Forms;",
              "$img = [System.Windows.Forms.Clipboard]::GetImage();",
              "if ($img -eq $null) { exit 1 };",
              `$img.Save('${tmpPath.replace(/\\/g, "/")}');`,
              "exit 0"
            ].join(" ");

            try {
              await runShell(`powershell -NoProfile -NonInteractive -Command "${psCmd}"`);
            } catch {
              vscode.window.showWarningMessage(
                "No image found in clipboard. Copy an image first, then click OCR Clipboard."
              );
              return;
            }

            if (!fs.existsSync(tmpPath)) {
              vscode.window.showWarningMessage(
                "No image found in clipboard. Copy an image first, then click OCR Clipboard."
              );
              return;
            }

            progress.report({ message: "Loading dependencies…" });
            await ensureDependencies(context);

            progress.report({ message: "Running OCR…" });
            const rawText = await runOcr(tmpPath);

            if (fs.existsSync(tmpPath)) { fs.unlinkSync(tmpPath); }

            const singleLine = rawText
              .replace(/\r?\n|\r/g, " ")
              .replace(/\s{2,}/g, " ")
              .trim();

            if (!singleLine) {
              vscode.window.showWarningMessage(
                "OCR completed but no text was detected in the clipboard image."
              );
              return;
            }

            await openTextInEditor(singleLine, "clipboard");
            progress.report({ message: "Done!" });
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            vscode.window.showErrorMessage(`Clipboard OCR failed: ${msg}`);
          }
        }
      );
    }
  );

  // Status bar button for clipboard OCR
  const statusBarBtn = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  statusBarBtn.text = "$(file-media) OCR Clipboard";
  statusBarBtn.tooltip = "Extract text from clipboard image (OCR)";
  statusBarBtn.command = "imageOcr.extractFromClipboard";
  statusBarBtn.show();

  context.subscriptions.push(cmd, clipCmd, statusBarBtn);
}

export function deactivate() {}

// ---------------------------------------------------------------------------
// Dependency bootstrap (tesseract.js + sharp installed into extension dir)
// ---------------------------------------------------------------------------

async function ensureDependencies(
  context: vscode.ExtensionContext
): Promise<void> {
  const extDir = context.extensionPath;
  const nmDir = path.join(extDir, "node_modules");

  // Install if missing
  const tesseractDir = path.join(nmDir, "tesseract.js");
  const sharpDir = path.join(nmDir, "sharp");

  if (!fs.existsSync(tesseractDir) || !fs.existsSync(sharpDir)) {
    await runShell(
      `npm install --prefix "${extDir}" tesseract.js sharp --no-save --omit=dev`
    );
  }

  // Lazy-load
  if (!Tesseract) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    Tesseract = require(path.join(nmDir, "tesseract.js"));
  }
  if (!sharpFn) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const sharpMod = require(path.join(nmDir, "sharp"));
    // sharp v0.33+ wraps the constructor under .default with esModuleInterop
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sharpFn = (sharpMod.default ?? sharpMod) as (input: string) => any;
  }
}

// ---------------------------------------------------------------------------
// SVG → PNG via sharp
// ---------------------------------------------------------------------------

async function svgToPng(
  svgPath: string,
  _context: vscode.ExtensionContext
): Promise<string> {
  if (!sharpFn) {
    throw new Error("sharp not loaded");
  }
  const tmpPath = path.join(
    os.tmpdir(),
    `vsce-ocr-${Date.now()}.png`
  );
  await sharpFn(svgPath).png().toFile(tmpPath);
  return tmpPath;
}

// ---------------------------------------------------------------------------
// OCR
// ---------------------------------------------------------------------------

async function runOcr(imagePath: string): Promise<string> {
  if (!Tesseract) {
    throw new Error("Tesseract not loaded");
  }
  const t = Tesseract as NonNullable<typeof Tesseract>;
  const {
    data: { text },
  } = await t.recognize(imagePath, "eng", {
    // Silence Tesseract's own console noise
    logger: () => {},
  });
  return text;
}

// ---------------------------------------------------------------------------
// Open result in editor
// ---------------------------------------------------------------------------

async function openTextInEditor(
  text: string,
  sourceFilename: string
): Promise<void> {
  const header = `// OCR result for: ${sourceFilename}\n// Extracted: ${new Date().toLocaleString()}\n\n`;
  const doc = await vscode.workspace.openTextDocument({
    language: "plaintext",
    content: header + text,
  });
  await vscode.window.showTextDocument(doc, { preview: false });
}

// ---------------------------------------------------------------------------
// Shell helper
// ---------------------------------------------------------------------------

function runShell(cmd: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const { exec } = require("child_process") as typeof import("child_process");
    exec(cmd, { maxBuffer: 50 * 1024 * 1024 }, (err, _stdout, stderr) => {
      if (err) {
        reject(new Error(stderr || err.message));
      } else {
        resolve();
      }
    });
  });
}