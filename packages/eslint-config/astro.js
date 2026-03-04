import astroPlugin from "eslint-plugin-astro";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";
import base from "./base.js";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...base,
  ...astroPlugin.configs.recommended,
  {
    // Disable type-checked rules on .astro files since astro-eslint-parser
    // doesn't support projectService
    files: ["**/*.astro"],
    ...tseslint.configs.disableTypeChecked,
  },
  {
    files: ["**/*.{tsx,jsx}"],
    plugins: {
      react,
      "react-hooks": reactHooks,
    },
    settings: {
      react: { version: "detect" },
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react/self-closing-comp": "warn",
      // Allow R3F (React Three Fiber) custom JSX properties
      "react/no-unknown-property": [
        "error",
        {
          ignore: [
            "object",
            "position",
            "intensity",
            "rotation",
            "args",
            "attach",
            "castShadow",
            "receiveShadow",
            "dispose",
          ],
        },
      ],
    },
  },
];
