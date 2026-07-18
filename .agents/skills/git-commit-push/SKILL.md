---
name: git-commit-push
description: Analyzes git changes, commits with a summary message, and pushes to the current branch.
---

# Git Commit and Push Skill

When the user asks you to commit and push changes, follow these steps:

1. **Check Status & Diff**: 
   - Run `git status` to see what files are modified.
   - Run `git diff` and `git diff --cached` to understand the actual changes.
2. **Generate Summary**:
   - Analyze the diff and generate a concise, conventional commit message (e.g., `feat: ...`, `fix: ...`, `chore: ...`).
   - If there are many changes, include a brief bulleted list in the commit body.
3. **Commit & Push**:
   - Run `git add .` to stage all changes.
   - Run `git commit -m "your generated summary"` to commit the changes.
   - Run `git push origin HEAD` to push the changes to the current upstream branch.

*Note: Use PowerShell syntax (e.g., separating commands with `;` instead of `&&`) when executing these commands.*
