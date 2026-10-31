# BunVite

Blazing-fast zero-dependency Vite alternative powered purely by Bun.

## Quickstart

```bash
bunx degit BayramovNicat/bunvite my-app
cd my-app
bun run dev
```

## Code graph (optional)

With [graphify](https://github.com/safishamsi/graphify) installed (`pipx install graphifyy`), map the codebase into `graphify-out/` (no API key needed):

```bash
bun run graphify                          # build graph.json, graph.html, GRAPH_REPORT.md
bun run graphify:watch                    # rebuild on code changes
bun run graphify:query "how does HMR work"
bun run graphify:affected "compileTypeScript"
bun run graphify:hubs                     # most connected nodes
```
