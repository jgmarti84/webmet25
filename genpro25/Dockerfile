FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies including git for cloning radarlib
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    gcc \
    libpq-dev \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies including radarlib from GitHub
# The radarlib package is installed from a GitHub repository
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create directory for radar products
RUN mkdir -p /data/products

# Default command
CMD ["python", "main.py"]
