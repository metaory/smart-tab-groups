#!/usr/bin/env bash
set -e
cd "$(git rev-parse --show-toplevel)"
cp scripts/pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
echo "Pre-commit hook installed."
