@echo off
echo ==========================================
echo   INICIANDO SISTEMA DE DESEMPENHO
echo ==========================================
echo.
echo 1. Iniciando o servidor backend...
start "Servidor Backend" /min cmd /c "node server.js"
echo.
echo 2. Aguardando o servidor carregar...
timeout /t 3 >nul
echo.
echo 3. Abrindo o sistema no navegador...
start http://localhost:3000
echo.
echo ==========================================
echo   SISTEMA INICIADO!
echo   Pode fechar esta janela se quiser, 
echo   mas nao feche a janela do servidor.
echo ==========================================
pause
