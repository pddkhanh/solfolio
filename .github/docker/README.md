# E2E Docker Image Documentation

## Overview
We use Microsoft's official Playwright Docker image for E2E tests to speed up CI/CD pipelines by using pre-installed Playwright and its dependencies.

## Current Setup

### Image Used
- **Registry**: Microsoft Container Registry
- **Image**: `mcr.microsoft.com/playwright:v1.49.0-noble`
- **Documentation**: https://playwright.dev/docs/docker

### Pre-installed Components
- Node.js 22
- pnpm (latest)
- Playwright 1.49.0
- Chromium browser
- All system dependencies for browser automation
- Git, curl, and other utilities

## Benefits
- **Speed**: Saves ~45-60 seconds per E2E test run
- **Consistency**: Same environment across all CI runs
- **Reliability**: No network failures during Playwright installation
- **Efficiency**: Smaller overall CI time and resource usage

## Usage

### In GitHub Actions
The PR checks workflow automatically uses this image:
```yaml
container:
  image: mcr.microsoft.com/playwright:v1.49.0-noble
  options: --user 1001
```

### Local Testing
To test E2E locally using the same environment:
```bash
docker run -it --rm \
  -v $(pwd):/app \
  -w /app/frontend \
  mcr.microsoft.com/playwright:v1.49.0-noble \
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
   Edit `.github/docker/e2e.Dockerfile`:
   ```dockerfile
   FROM mcr.microsoft.com/playwright:vX.XX.X-noble
   ```

2. **Trigger Image Build**:
   - Push changes to main branch, OR
   - Manually trigger the "Build E2E Docker Image" workflow

3. **Verify New Image**:
   Check that the new image is available:
   ```bash
   docker pull ghcr.io/pddkhanh/solfolio-e2e:latest
   ```

### Custom Image Build (Future)
Once we set up the custom image workflow:
1. The image will be automatically built when Dockerfile changes
2. It will be pushed to GitHub Container Registry
3. Update the PR checks workflow to use the custom image

## Fallback Strategy
If the custom image is unavailable, the workflow falls back to:
1. Using Microsoft's official Playwright image
2. Installing pnpm manually in the container

## Performance Metrics
- **Without Docker image**: ~90-120 seconds (download + install Playwright)
- **With Docker image**: ~30-45 seconds (just dependency installation)
- **Time saved**: ~45-60 seconds per run
- **Monthly time saved** (assuming 100 runs): ~75-100 minutes

## Troubleshooting

### Permission Issues
If you see permission errors, ensure the container runs with the correct user:
```yaml
options: --user 1001
```

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