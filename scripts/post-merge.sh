#!/bin/bash
set -e

# Install / sync dependencies (no frozen lockfile — task agents may change package.json)
pnpm install --no-frozen-lockfile

# Push any new DB schema changes
pnpm --filter @workspace/db run push
