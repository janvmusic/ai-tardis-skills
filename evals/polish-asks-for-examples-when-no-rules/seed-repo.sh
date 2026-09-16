#!/bin/bash
set -e
git init -q
git config user.email "eval@example.com"
git config user.name "Eval"
echo "# scratch" > README.md
git add README.md
git commit -q -m "chore: initial commit"
cat > user.rb <<'RB'
def process(user)
  if user
    if user.active?
      send_email(user)
    end
  end
end
RB
git add user.rb
