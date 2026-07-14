#!/bin/sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
NODE_BIN="/Users/kamalraajsenthilkumar/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node"

exec "$NODE_BIN" "$SCRIPT_DIR/mcp/zenmode-mcp.mjs"
