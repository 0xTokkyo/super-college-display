import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { writeFileSync, existsSync, chmodSync } from 'fs'
import { join } from 'path'

// Plugin pour copier les scripts de serveur dans dist/
function copyServeScripts() {
  return {
    name: 'copy-serve-scripts',
    closeBundle() {
      const serveBatSrc = join(process.cwd(), 'dist', 'serve.bat')
      const serveShSrc = join(process.cwd(), 'dist', 'serve.sh')
      
      // Créer les fichiers s'ils n'existent pas déjà
      if (!existsSync(serveBatSrc)) {
        const serveBatContent = `@echo off
echo Démarrage du serveur web local...
echo.
echo L'application sera accessible sur http://localhost:8000
echo Appuyez sur Ctrl+C pour arrêter le serveur
echo.

REM Vérifier si Python est disponible
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo Utilisation de Python pour servir les fichiers...
    python -m http.server 8000
    goto :end
)

REM Vérifier si Node.js est disponible
node --version >nul 2>&1
if %errorlevel% == 0 (
    echo Utilisation de Node.js pour servir les fichiers...
    npx -y serve -s . -l 8000
    goto :end
)

echo ERREUR: Python ou Node.js n'est pas installé.
echo.
echo Options:
echo 1. Installez Python depuis https://www.python.org/
echo 2. Installez Node.js depuis https://nodejs.org/
echo 3. Utilisez un autre serveur web local
echo.
pause

:end
`
        writeFileSync(serveBatSrc, serveBatContent)
      }
      
      if (!existsSync(serveShSrc)) {
        const serveShContent = `#!/bin/bash

echo "Démarrage du serveur web local..."
echo ""
echo "L'application sera accessible sur http://localhost:8000"
echo "Appuyez sur Ctrl+C pour arrêter le serveur"
echo ""

# Vérifier si Python est disponible
if command -v python3 &> /dev/null; then
    echo "Utilisation de Python pour servir les fichiers..."
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    echo "Utilisation de Python pour servir les fichiers..."
    python -m http.server 8000
# Vérifier si Node.js est disponible
elif command -v node &> /dev/null; then
    echo "Utilisation de Node.js pour servir les fichiers..."
    npx -y serve -s . -l 8000
else
    echo "ERREUR: Python ou Node.js n'est pas installé."
    echo ""
    echo "Options:"
    echo "1. Installez Python depuis https://www.python.org/"
    echo "2. Installez Node.js depuis https://nodejs.org/"
    echo "3. Utilisez un autre serveur web local"
    exit 1
fi
`
        writeFileSync(serveShSrc, serveShContent)
        // Rendre le script exécutable sur Unix
        if (process.platform !== 'win32') {
          chmodSync(serveShSrc, 0o755)
        }
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), copyServeScripts()],
  base: './', // Utilise des chemins relatifs pour fonctionner avec file://
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
