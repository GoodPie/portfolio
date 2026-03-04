import config from "@goodpie/eslint-config/next";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...config,
  {
    ignores: ["vitest.config.mts"],
  },
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
];
