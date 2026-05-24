# MCP Server

The local MCP server lives in `src/mcp/server.ts`.

## Capability

It exposes:

- Resource: `singerbd://docs/readme`
- Tool: `list_npm_scripts`

## Run

```bash
npm run mcp:server
```

## Example Client Config

```json
{
  "mcpServers": {
    "singerbd": {
      "command": "npm",
      "args": ["run", "mcp:server"],
      "cwd": "/path/to/Singer_BD_Automation"
    }
  }
}
```

The same server is also declared in `.mcp.json` for MCP clients that support project-local configuration.
