#!/bin/bash
set -e
git init -q
git config user.email "eval@example.com"
git config user.name "Eval"
echo "hello" > README.md
git add README.md
git commit -q -m "chore: initial commit"
git checkout -q -b feat/eval-test-branch
echo "feature" > feature.txt
git add feature.txt
git commit -q -m "feat: add feature file"
