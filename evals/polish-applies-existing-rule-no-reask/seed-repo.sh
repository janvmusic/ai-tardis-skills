#!/bin/bash
set -e
git init -q
git config user.email "eval@example.com"
git config user.name "Eval"
echo "# scratch" > README.md
git add README.md
git commit -q -m "chore: initial commit"

mkdir -p .tardis/polish
cat > .tardis/polish/ruby.md <<'RULES'
## Prefer early returns over nested conditionals

**Bad:**

```ruby
def process(user)
  if user
    if user.active?
      send_email(user)
    end
  end
end
```

**Good:**

```ruby
def process(user)
  return unless user&.active?
  send_email(user)
end
```
RULES

cat > invoice.rb <<'RB'
def close(invoice)
  if invoice
    if invoice.paid?
      archive(invoice)
    end
  end
end
RB
git add .tardis invoice.rb
