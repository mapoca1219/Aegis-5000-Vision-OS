# ==============================================================================
# Aegis-5000 Vision OS: AWS Graviton4 + COOL Production Docker Container
# ==============================================================================
# Target Architecture : aarch64 (Arm64 / AWS Graviton4 Neoverse V2)
# Compiler Flags      : ARMv9-A + NEON + SVE2 + Crypto SIMD Vectorization
# Optimization Level  : -O3 High-Throughput Cloud-Optimized OpenCV Library (COOL)
# Target Competition  : OpenCV AI Competition 2026, Powered by AWS
# ==============================================================================

FROM public.ecr.aws/amazonlinux/amazonlinux:2023 AS base

# Define architecture and SIMD optimization environment variables
ENV ARCH=aarch64
ENV PLATFORM=linux/arm64
ENV DEBIAN_FRONTEND=noninteractive

# Mandatory Graviton4 Neoverse V2 SIMD Vectorization Flags
ENV CFLAGS="-march=armv9-a+crypto+sve2 -O3 -fPIC -pipe"
ENV CXXFLAGS="-march=armv9-a+crypto+sve2 -O3 -fPIC -pipe"
ENV LDFLAGS="-Wl,-O1 -Wl,--as-needed"

# Set application home directory
WORKDIR /app

# ------------------------------------------------------------------------------
# Stage 1: Install Core System Dependencies, Compilers & Node.js 20 LTS
# ------------------------------------------------------------------------------
RUN dnf update -y && \
    dnf install -y \
        gcc \
        gcc-c++ \
        cmake \
        make \
        git \
        tar \
        gzip \
        python3 \
        python3-pip \
        python3-devel \
        openssl-devel \
        curl \
        shadow-utils && \
    # Install Node.js 20 LTS for ARM64 runtime
    curl -fsSL https://rpm.nodesource.com/setup_20.x | bash - && \
    dnf install -y nodejs && \
    dnf clean all && \
    rm -rf /var/cache/dnf

# ------------------------------------------------------------------------------
# Stage 2: Install Python Dependencies & OpenCV 5 Cloud-Optimized Library
# ------------------------------------------------------------------------------
COPY backend/requirements.txt /app/backend/requirements.txt
RUN python3 -m pip install --no-cache-dir --upgrade pip setuptools wheel && \
    python3 -m pip install --no-cache-dir -r /app/backend/requirements.txt

# ------------------------------------------------------------------------------
# Stage 3: Copy Application Manifests & Build Application
# ------------------------------------------------------------------------------
COPY package.json package-lock.json* /app/
RUN npm ci --prefer-offline --no-audit

# Copy application source tree and backend components
COPY . /app/

# Build production client bundle
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 4: Security Hardening & Runtime Permissions
# ------------------------------------------------------------------------------
# Create non-root unprivileged industrial runtime user
RUN groupadd -g 1001 aegis && \
    useradd -u 1001 -g aegis -s /bin/bash -m aegis && \
    chown -R aegis:aegis /app

USER aegis

# Expose standard industrial OT / HMI port
EXPOSE 3000

# ------------------------------------------------------------------------------
# Stage 5: Container Healthcheck & Startup
# ------------------------------------------------------------------------------
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:3000/ || exit 1

# Default Startup Command:
# Launches the Express/TypeScript service and runs the OpenCV 5 G-API pipeline
CMD ["npm", "start"]

