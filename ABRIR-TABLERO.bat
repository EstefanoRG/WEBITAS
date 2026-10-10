@echo off
cd /d "%~dp0"
echo ============================================
echo   WEBITAS - Tablero de prospectos
echo   Deja abierta la ventana negra del servidor.
echo   Para cerrar: cierra esa ventana o Ctrl+C.
echo ============================================
start "WEBITAS Tablero" cmd /k "node tools/panel.mjs"
timeout /t 2 >nul
start "" "http://localhost:5173"
exit
