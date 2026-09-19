@echo off
cd /d "%~dp0"
where py >nul 2>nul && (py server.py & goto :eof)
where python >nul 2>nul && (python server.py & goto :eof)
where python3 >nul 2>nul && (python3 server.py & goto :eof)
echo Python nao encontrado. Abrindo a versao standalone; no computador, a camera ao vivo pode ser bloqueada no modo file://.
start "" index_standalone.html
pause
