@echo off
cd /d "%~dp0"
where py >nul 2>nul && (py server.py & goto :eof)
where python >nul 2>nul && (python server.py & goto :eof)
where python3 >nul 2>nul && (python3 server.py & goto :eof)
echo Python nao encontrado. Abrindo o standalone. A camera pode funcionar, e o OCR tentara o mecanismo do navegador/online.
start "" index_standalone.html
pause
