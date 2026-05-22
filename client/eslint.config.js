import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

// ESLint configuration for the project
export default defineConfig([
  // Ignore the dist build output folder
  globalIgnores(['dist']),
  {
    // Apply these rules to JavaScript and JSX files
    files: ['**/*.{js,jsx}'],
    extends: [
      // Base recommended JavaScript linting rules
      js.configs.recommended,

      // Recommended React Hooks linting rules
      reactHooks.configs.flat.recommended,

      // Vite-specific React refresh rules
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      // Enable browser globals like window and document
      globals: globals.browser,

      // Allow JSX syntax in JavaScript files
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
])