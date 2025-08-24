# E2E Docker Image Documentation

## Overview
We use a custom Docker image based on Microsoft's Playwright image for E2E tests. This custom image includes pnpm and other tools pre-installed, speeding up CI/CD pipelines significantly.

## Current Setup

### Custom Image
- **Registry**: GitHub Container Registry (ghcr.io)
- **Image**: `ghcr.io/pddkhanh/solfolio-e2e:latest`
- **Base Image**: `mcr.microsoft.com/playwright:v1.49.0-noble`
- **Dockerfile**: `.github/docker/playwright-e2e.Dockerfile`

### Pre-installed Components
- Node.js 22
- pnpm (latest) - **Pre-installed globally**
- Playwright 1.49.0
- Chromium browser
- All system dependencies for browser automation
- Git, curl, jq utilities

## Benefits
- **Speed**: Saves ~45-60 seconds per E2E test run
- **No Permission Issues**: pnpm is pre-installed globally
- **Consistency**: Same environment across all CI runs
- **Reliability**: No network failures during installation
- **Efficiency**: Smaller overall CI time and resource usage

## Usage

### In GitHub Actions
The PR checks workflow automatically uses this image:
```yaml
container:
  image: ghcr.io/pddkhanh/solfolio-e2e:latest
  credentials:
    username: ${{ github.actor }}
    password: ${{ secrets.GITHUB_TOKEN }}
```

### Local Testing
To test E2E locally using the same environment:
```bash
# First, pull the image
docker pull ghcr.io/pddkhanh/solfolio-e2e:latest

# Run E2E tests
docker run -it --rm \
  -v $(pwd):/app \
  -w /app/frontend \
  ghcr.io/pddkhanh/solfolio-e2e:latest \
  pnpm run test:e2e
```

## Maintenance

### When to Update
Update the Docker image when:
1. Playwright version changes in `frontend/package.json`
2. Node.js version requirement changes
3. New system dependencies are needed
4. pnpm major version updates

### How to Update

1. **Update Dockerfile**:
   Edit `.github/docker/playwright-e2e.Dockerfile`:
   ```dockerfile
   FROM mcr.microsoft.com/playwright:vX.XX.X-noble
   ```

2. **Trigger Image Build**:
   The image will be automatically built when:
   - Dockerfile changes are pushed to main branch
   - PR is created with Dockerfile changes
   - Manually trigger the "Build E2E Docker Image" workflow

3. **Verify New Image**:
   Check that the new image is available:
   ```bash
   docker pull ghcr.io/pddkhanh/solfolio-e2e:latest
   ```

### Image Build Process
The custom image workflow:
1. Automatically builds when Dockerfile changes
2. Pushes to GitHub Container Registry (ghcr.io)
3. Tags with latest, branch name, and commit SHA
4. Available immediately for CI/CD pipelines

## Fallback Strategy
If the custom image is unavailable, you can:
1. Trigger the "Build E2E Docker Image" workflow manually
2. Use Microsoft's official image with manual pnpm installation (not recommended due to permission issues)

## Performance Metrics
- **Without Docker image**: ~90-120 seconds (download + install Playwright)
- **With Docker image**: ~30-45 seconds (just dependency installation)
- **Time saved**: ~45-60 seconds per run
- **Monthly time saved** (assuming 100 runs): ~75-100 minutes

## Troubleshooting

### Permission Issues
Our custom image handles permissions correctly. The pnpm installation is done as root before switching to the pwuser, avoiding EACCES errors.

### Cache Issues
Clear Docker cache if the image seems corrupted:
```bash
docker system prune -a
```

### Version Mismatch
Ensure Playwright version in Docker image matches `frontend/package.json`:
```json
"@playwright/test": "^1.49.0"
```

## Future Improvements
1. Set up automated image building on Playwright updates
2. Add support for multiple browser types (Firefox, WebKit)
3. Include additional testing tools if needed
4. Set up vulnerability scanning for the image