#!/bin/bash
set -e
git init -q
git config user.email "eval@example.com"
git config user.name "Eval"
echo "# scratch" > README.md
git add README.md
git commit -q -m "chore: initial commit"

mkdir -p src
cat > src/widget.ts <<'TS'
import { helper } from '../../utils/helper'
import { format } from '../shared/format'

export function render() {
  return format(helper())
}
TS
git add src/widget.ts
