import path from "node:path";

const workspaces = ["apps/portfolio", "apps/photography", "packages/ui"];

/**
 * Group staged files by workspace and run ESLint from each workspace root
 * so that the correct eslint.config.mjs and tsconfigRootDir are used.
 */
function buildEslintCommands(filenames) {
  const cwd = process.cwd();
  const commands = [];

  for (const ws of workspaces) {
    const wsAbsolute = path.resolve(cwd, ws);
    const wsFiles = filenames.filter((f) => f.startsWith(wsAbsolute));
    if (wsFiles.length > 0) {
      const files = wsFiles.map((f) => `"${f}"`).join(" ");
      commands.push(`cd "${wsAbsolute}" && eslint --fix ${files}`);
    }
  }

  return commands;
}

export default {
  "*.{ts,tsx,js,mjs,cjs}": buildEslintCommands,
  "*.{ts,tsx,js,mjs,cjs,json,css,md,astro}": "prettier --write",
};
