FROM node:23

# Install Google Chrome Stable and dependencies for Puppeteer
RUN apt-get update && apt-get install curl gnupg -y \
  && curl -sSL https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
  && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google.list' \
  && apt-get update \
  && apt-get install -y --no-install-recommends \
    google-chrome-stable \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
  && rm -rf /var/lib/apt/lists/*

# Skip Chromium download because we installed Chrome ourselves
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Set the executable path for Puppeteer to use the installed Chrome
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome

# Install critical
RUN npm install -g critical@^7.2.1

# Set work directory
WORKDIR /app

# Copy local files into the image
COPY . .

# This enables running arbitrary shell commands
ENTRYPOINT ["/bin/sh", "-c"]

# Example command to run critical
# docker build -t critical-generator .
# docker run --rm -v "$PWD":/app -w /app critical-generator "mkdir -p output &&  ls -la && echo 'Running critical...' &&  critical index.html --inline --base . --width 1300 --height 900 --output output/index.html && echo 'Done' "
