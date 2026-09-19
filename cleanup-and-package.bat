@echo off
echo ========================================
echo  Image OCR - Cleanup and Package Script
echo ========================================

echo.
echo [1/4] Compiling TypeScript...
call npm run compile
if errorlevel 1 (echo Compile failed & pause & exit /b 1)

echo.
echo [2/4] Removing unused Tesseract language files (keeping eng only)...
if exist "node_modules\tesseract.js\lang-data" (
    for %%f in ("node_modules\tesseract.js\lang-data\*.traineddata") do (
        if /i not "%%~nxf"=="eng.traineddata" del /q "%%f"
    )
    echo Done.
) else (
    echo Lang-data folder not found, skipping.
)

echo.
echo [3/4] Packaging extension...
call vsce package
if errorlevel 1 (echo Package failed & pause & exit /b 1)

echo.
echo [4/4] Done! Checking .vsix size...
for %%f in (*.vsix) do echo   %%f -- %%~zf bytes

echo.
echo ========================================
echo  Install with:
echo  code --uninstall-extension ManojPatode.image-ocr
echo  code --install-extension image-ocr-0.1.1.vsix
echo ========================================
pause
