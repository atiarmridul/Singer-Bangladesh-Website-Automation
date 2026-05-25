import { promises as fs } from "node:fs";
import path from "node:path";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import * as z from "zod/v4";

type PackageJson = {
  scripts?: Record<string, string>;
};

const server = new McpServer({
  name: "singerbd-local-mcp",
  version: "1.0.0"
});

const projectRoot = process.cwd();
const readmePath = path.join(projectRoot, "README.md");
const packageJsonPath = path.join(projectRoot, "package.json");
const readmeUri = "singerbd://docs/readme";

// Reads package.json scripts so MCP clients can see the safe project commands.
async function loadScripts() {
  // Expose package scripts through MCP so agents can discover supported commands safely.
  const raw = await fs.readFile(packageJsonPath, "utf8");
  const parsed = JSON.parse(raw) as PackageJson;
  const scripts = parsed.scripts ?? {};

  return Object.entries(scripts).map(([name, command]) => ({
    name,
    command
  }));
}

server.registerResource(
  "project-readme",
  readmeUri,
  {
    title: "Singer BD README",
    description: "Project overview from README.md",
    mimeType: "text/markdown"
  },
  // Sends README text back when an MCP client asks for project context.
  async () => {
    // README is registered as a resource so tool clients can fetch project context without filesystem access.
    const text = await fs.readFile(readmePath, "utf8");
    return {
      contents: [
        {
          uri: readmeUri,
          mimeType: "text/markdown",
          text
        }
      ]
    };
  }
);

server.registerTool(
  "list_npm_scripts",
  {
    title: "List npm scripts",
    description: "List npm scripts from package.json with an optional name filter.",
    inputSchema: {
      contains: z.string().optional().describe("Optional substring filter for script names, e.g. smoke")
    }
  },
  // Returns package scripts, optionally filtered by name.
  async ({ contains }) => {
    const scripts = await loadScripts();
    const filter = contains?.trim().toLowerCase();
    // Filtering is intentionally name-only to avoid accidental matches against long command strings.
    const filtered = filter ? scripts.filter((script) => script.name.toLowerCase().includes(filter)) : scripts;

    const lines =
      filtered.length > 0
        ? filtered.map((script) => `- ${script.name}: ${script.command}`)
        : ["No scripts matched your filter."];

    return {
      content: [
        {
          type: "text",
          text: lines.join("\n")
        }
      ]
    };
  }
);

// Starts the MCP server over stdio.
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Singer BD MCP server is running on stdio");
}

main().catch((error) => {
  console.error("Failed to start MCP server:", error);
  process.exit(1);
});
