#!/usr/bin/env bash
set -e

ORIGINAL_NAME="ai-tardis-skills"
SCOPED_NAME="@janvmusic/ai-tardis-skills"

cleanup() {
  npm pkg set name="$ORIGINAL_NAME" publishConfig.registry="https://registry.npmjs.org/"
}
trap cleanup EXIT

npm pkg set name="$SCOPED_NAME" publishConfig.registry="https://npm.pkg.github.com"
npm publish --registry https://npm.pkg.github.com
