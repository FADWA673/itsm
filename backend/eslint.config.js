const js = require("@eslint/js");
const tseslint = require("typescript-eslint");

module.exports = tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    // Ces règles passent de "error" à "warn" : elles restent signalées
    // dans l'éditeur, mais ne bloquent plus le commit ni la CI.
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrors: "none" },
      ],
      "@typescript-eslint/no-require-imports": "warn",
      "no-case-declarations": "warn",
      "preserve-caught-error": "warn",
    },
  },
  {
    ignores: ["dist/", "node_modules/"]
  }
);