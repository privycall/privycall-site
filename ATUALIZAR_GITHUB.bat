@echo off
setlocal
cd /d "%~dp0"

echo ==========================================
echo       PRIVYCALL - ATUALIZAR GITHUB
echo ==========================================
echo.

where git >nul 2>nul
if errorlevel 1 (
  echo ERRO: Git nao foi encontrado neste computador.
  echo Abra esta pasta pelo mesmo VS Code onde o Git ja funcionava.
  pause
  exit /b 1
)

git rev-parse --is-inside-work-tree >nul 2>nul
if errorlevel 1 (
  echo Recuperando a configuracao do repositorio original do PrivyCall...
  git init
  git remote add origin https://github.com/privycall/privycall-site.git
  git fetch origin main
  if errorlevel 1 goto :erro
  rem Faz a pasta partir do historico remoto SEM substituir os arquivos atuais.
  git reset --mixed origin/main
  git branch -M main
) else (
  git remote get-url origin >nul 2>nul
  if errorlevel 1 git remote add origin https://github.com/privycall/privycall-site.git
  for /f "delims=" %%i in ('git remote get-url origin 2^>nul') do set CURRENT_ORIGIN=%%i
  if /I not "%CURRENT_ORIGIN%"=="https://github.com/privycall/privycall-site.git" (
    git remote set-url origin https://github.com/privycall/privycall-site.git
  )
  for /f "delims=" %%i in ('git branch --show-current') do set CURRENT_BRANCH=%%i
  if /I not "%CURRENT_BRANCH%"=="main" git branch -M main
)

git add .
git diff --cached --quiet
if not errorlevel 1 (
  echo.
  echo Nao ha alteracoes novas para enviar.
  echo O GitHub ja esta atualizado.
  pause
  exit /b 0
)

git commit -m "Atualiza site PrivyCall"
if errorlevel 1 goto :erro

git push origin main
if errorlevel 1 goto :erro

echo.
echo ==========================================
echo Atualizacao enviada ao GitHub com sucesso.
echo ==========================================
pause
exit /b 0

:erro
echo.
echo Ocorreu um erro. Nao feche esta janela; copie a mensagem acima.
pause
exit /b 1
