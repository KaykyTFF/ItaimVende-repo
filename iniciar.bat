@echo off
chcp 65001 > nul
title Itaim Vende - Inicializador Oficial

echo =============================================================
echo   ITAIM VENDE - INICIALIZAÇÃO AUTOMÁTICA DO SITE E BANCO
echo =============================================================
echo.

echo [1/3] Verificando dependencias e configurando Banco de Dados...
call node scripts/setup-db.js
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [AVISO] O setup rapido terminou com avisos, iniciando servidor...
)

echo.
echo [2/3] Iniciando o servidor Backend e Frontend na porta 3000...
echo.
echo =============================================================
echo  ACESSO LOCAL:  http://localhost:3000/
echo  PAINEL STATUS: http://localhost:3000/painel
echo =============================================================
echo.

call npm run dev
pause
