---
created: 2026-01-17T18:15
title: Add Buy Me a Coffee button
area: ui
files:
  - README.md
  - src/app/about/page.tsx (new)
  - src/components/ui/bmc-button.tsx (new)
---

## Problem

The app is free/open-source but could benefit from optional donation support. User wants to add a "Buy me a pizza" button from Buy Me a Coffee service to:

1. **README.md** — Full button for GitHub visitors
2. **In-app (bottom right corner)** — Small/subtle version
3. **About section** — Full version with context

This provides a low-friction way for appreciative users to support development.

## Solution

Use the provided BMC script/configuration:
- slug: `kai.osthoff`
- emoji: pizza
- text: "Buy me a pizza"
- color: #FFDD00 (yellow)

Implementation options:
1. **README**: Use BMC badge/image link (static, no JS needed)
2. **In-app floating**: Small icon button, bottom-right fixed position
3. **About page**: Create `/about` route with full BMC button + app info

Script reference:
```html
<script type="text/javascript" src="https://cdnjs.buymeacoffee.com/1.0.0/button.prod.min.js"
  data-name="bmc-button"
  data-slug="kai.osthoff"
  data-color="#FFDD00"
  data-emoji="🍕"
  data-font="Cookie"
  data-text="Buy me a pizza"
  data-outline-color="#000000"
  data-font-color="#000000"
  data-coffee-color="#ffffff">
</script>
```

For React: Consider using next/script or a React-specific BMC component.
