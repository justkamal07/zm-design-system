#!/bin/sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
NODE_BIN="${NODE_BIN:-$(command -v node)}"

exec "$NODE_BIN" "$SCRIPT_DIR/mcp/zenmode-mcp.mjs"
