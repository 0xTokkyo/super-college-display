# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

## Configuration Supabase

Les clés publiques Supabase (`VITE_SUPABASE_URL` et `VITE_SUPABASE_PUBLISHABLE_KEY`) sont maintenant hardcodées directement dans `src/lib/supabase.ts` et peuvent être partagées publiquement sans risque de sécurité.

Seule `DATABASE_URL` est nécessaire dans le fichier `.env` pour les migrations Drizzle (credentials sensibles, ne pas partager publiquement).

Pour configurer le projet :
1. Copiez `.env.example` vers `.env`
2. Remplissez uniquement `DATABASE_URL` avec vos credentials Supabase

## Déploiement sur Windows (sans serveur web)

Le build est configuré pour fonctionner directement en ouvrant le fichier HTML dans un navigateur web, sans besoin de serveur web ou de runtime.

### Build du projet

```bash
npm run build
```

Le dossier `dist/` contiendra tous les fichiers nécessaires.

### Installation sur Windows

1. Copiez tout le contenu du dossier `dist/` sur n'importe quel PC Windows
2. Ouvrez `dist/index.html` dans n'importe quel navigateur web (Chrome, Edge, Firefox, etc.)
3. L'application fonctionnera immédiatement, sans installation ni configuration

**Note :** Les URLs utiliseront le format hash (`#/admin` au lieu de `/admin`) pour fonctionner avec le protocole `file://`. C'est normal et nécessaire pour que l'application fonctionne sans serveur web.