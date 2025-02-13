## Development Process

### 1. Feature Development Workflow

#### Before Starting
- [ ] Create a new branch for the feature
- [ ] Make sure you're working from the latest stable code
- [ ] Plan the feature implementation in small, testable chunks

#### During Development
- [ ] Work on one small chunk at a time
- [ ] Test the changes locally
- [ ] Run the app to verify nothing else broke
- [ ] Commit the changes with a descriptive message
- [ ] Repeat for next chunk

#### Commit Message Format
```
[type]: Brief description of what changed

- Detailed explanation of changes
- Why this change was needed
- Any important notes

type can be:
- feat: New feature
- fix: Bug fix
- style: Formatting/styling changes
- refactor: Code restructuring
- docs: Documentation updates
- test: Adding/updating tests
```

### 2. Testing Checklist

Before each commit:
- [ ] App builds successfully
- [ ] New feature works as expected
- [ ] Existing features still work
- [ ] No console errors
- [ ] UI looks correct
- [ ] Dark/light mode working

### 3. When Things Go Wrong

If you encounter issues:
1. Stop and assess the situation
2. Check git status to see what files changed
3. If unsure about changes:
   ```bash
   git stash  # Save changes temporarily
   git checkout main  # Go back to main branch
   npm install  # Reinstall dependencies if needed
   ```
4. If needed, revert to last working state:
   ```bash
   git reset --hard <last-working-commit>
   git clean -fd  # Remove untracked files
   ```

### 4. Best Practices

1. **Small Changes**
   - Work on one feature/fix at a time
   - Break large features into smaller tasks
   - Each commit should be focused and logical

2. **Regular Testing**
   - Test after each significant change
   - Test on both iOS and Android if possible
   - Check both light and dark modes

3. **Frequent Commits**
   - Commit working code frequently
   - Use descriptive commit messages
   - Don't commit broken code

4. **Version Control**
   - Keep track of working commit hashes
   - Create branches for new features
   - Don't force push to main branch

### 5. Daily Development Routine

1. Start of Day:
   ```bash
   git pull  # Get latest changes
   npm install  # Update dependencies if needed
   ```

2. During Development:
   - Make small, focused changes
   - Test frequently
   - Commit working code

3. End of Day:
   - Ensure all working changes are committed
   - Push changes to remote repository
   - Document any pending tasks 