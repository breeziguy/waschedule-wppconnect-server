FROM node:20-slim

# Set environment variables
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV CHROME_BIN=/usr/bin/google-chrome-stable
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# Create app user
RUN groupadd -r appuser && useradd -r -g appuser -G audio,video appuser \
    && mkdir -p /home/appuser/Downloads \
    && chown -R appuser:appuser /home/appuser

# Install dependencies
RUN apt-get update && apt-get install -y \
    # Basic dependencies
    wget curl gnupg2 ca-certificates lsb-release \
    # Font dependencies
    fonts-liberation fonts-roboto fonts-ubuntu fonts-dejavu-core \
    fontconfig libfontconfig1 \
    # Chrome dependencies
    libasound2 libatk-bridge2.0-0 libatk1.0-0 libc6 libcairo2 \
    libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 \
    libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 \
    libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 \
    libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 \
    libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 \
    libxss1 libxtst6 libnss3 libgbm1 \
    # Additional cloud dependencies
    xdg-utils libdrm2 libxkbcommon0 libatspi2.0-0 \
    # Process management
    dumb-init \
    && rm -rf /var/lib/apt/lists/*

# Install Chrome via new method
RUN wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/googlechrome-linux-keyring.gpg \
    && echo "deb [arch=amd64 signed-by=/usr/share/keyrings/googlechrome-linux-keyring.gpg] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google.list \
    && apt-get update \
    && apt-get install -y google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install node modules (including dev dependencies for build)
RUN PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true npm install && npm cache clean --force

# Copy project files
COPY . .

# Build the project
RUN npm run build

# Create necessary directories and set permissions
RUN mkdir -p /app/userDataDir /app/wppconnect_tokens && \
    chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 21465

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:21465/api-docs/ || exit 1

# Start the server with dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]
