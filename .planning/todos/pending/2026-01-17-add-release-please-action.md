---
created: 2026-01-17T19:45
title: Add release-please-action for automated releases
area: tooling
files: []
---

## Problem

When sporttag goes public on GitHub, users need:
- Clear semantic versioning (v1.0.0, v1.1.0, etc.)
- CHANGELOG to understand what changed between versions
- GitHub Releases page for easy downloads
- Professional, trustworthy project presentation

Manual release management doesn't scale and is error-prone.

## Solution

Add googleapis/release-please-action GitHub Action:

1. Configure `.github/workflows/release-please.yml`
2. Use conventional commits (`feat:`, `fix:`, `feat!:`)
3. Action maintains Release PR automatically
4. Merge PR → triggers version bump + GitHub release + tags

**Timing:** Not needed for closed beta (DMG to testers). Add before first public release.

**Reference:** https://github.com/googleapis/release-please-action
