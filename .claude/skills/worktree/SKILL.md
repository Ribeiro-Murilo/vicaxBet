---
name: worktree
description: Create git worktrees for parallel Claude Code sessions
allowed-tools: Bash
---

# Worktree Skill

When invoked:

1. Ask for feature name
2. Create branch if needed
3. Create worktree
4. Copy .env if exists
5. Show commands to open Claude

Example:

```bash
git worktree add ../$ARGUMENTS -b feat/$ARGUMENTS