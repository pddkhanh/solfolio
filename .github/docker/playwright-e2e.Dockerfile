# Custom E2E Test Docker Image based on Playwright
# Includes pnpm and all necessary tools for running E2E tests
FROM mcr.microsoft.com/playwright:v1.49.0-noble

# Install pnpm globally as root before switching users
USER root
RUN npm install -g pnpm@latest && \
    pnpm --version

# Install additional useful tools
RUN apt-get update && apt-get install -y \
    git \
    curl \
    jq \
    && rm -rf /var/lib/apt/lists/*

# Create directories that will be used and set proper permissions
RUN mkdir -p /app /home/pwuser/.cache /home/pwuser/.local \
    && chown -R pwuser:pwuser /app /home/pwuser/.cache /home/pwuser/.local

# Switch back to the playwright user (pwuser)
USER pwuser

# Set working directory
WORKDIR /app

# Set environment variables for CI
ENV CI=true \
    NEXT_TELEMETRY_DISABLED=1 \
    PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 \
    NODE_ENV=test

# Verify installations
RUN node --version && \
    npm --version && \
    pnpm --version && \
    npx playwright --version

# Labels for documentation
LABEL org.opencontainers.image.source="https://github.com/pddkhanh/solfolio"
LABEL org.opencontainers.image.description="E2E test environment with Playwright and pnpm"
LABEL org.opencontainers.image.licenses="MIT"
LABEL maintainer="SolFolio Team"