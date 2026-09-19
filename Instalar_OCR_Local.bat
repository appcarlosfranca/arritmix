@echo off
setlocal
cd /d "%~dp0"
echo ==========================================
echo CF ArritmiX - instalacao do OCR local
echo ==========================================
where py >nul 2>nul && set PY=py
if not defined PY where python >nul 2>nul && set PY=python
if not defined PY (
  echo Python nao foi encontrado. Instale Python 3.11+ e rode novamente.
  pause
  exit /b 1
)
%PY% -m pip install --upgrade pillow pytesseract
where winget >nul 2>nul && winget install -e --id UB-Mannheim.TesseractOCR --accept-package-agreements --accept-source-agreements
if errorlevel 1 echo Se o Tesseract nao foi instalado automaticamente, instale manualmente o Tesseract-OCR e rode o app novamente.
echo.
echo Instalacao concluida. Use Abrir_CF_ArritmiX.bat.
pause
