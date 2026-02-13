#!/bin/bash

# Build script for all Java microservices

set -e

echo "=========================================="
echo "Building Smart Attendance Java Microservices"
echo "=========================================="

# Build shared-config first
echo "Building shared-config..."
cd shared-config
mvn clean install -DskipTests
cd ..

# Build each service
echo "Building auth-service..."
cd auth-service
mvn clean package -DskipTests
cd ..

echo "Building qr-otp-service..."
cd qr-otp-service
mvn clean package -DskipTests
cd ..

echo "Building attendance-service..."
cd attendance-service
mvn clean package -DskipTests
cd ..

echo "Building data-service..."
cd data-service
mvn clean package -DskipTests
cd ..

echo "=========================================="
echo "Build complete!"
echo "=========================================="
echo ""
echo "To start services with Docker Compose:"
echo "  docker-compose up -d"
echo ""
echo "To run services locally:"
echo "  # Auth Service (port 8000)"
echo "  cd auth-service && mvn spring-boot:run"
echo ""
echo "  # QR/OTP Service (port 8001)"
echo "  cd qr-otp-service && mvn spring-boot:run"
echo ""
echo "  # Attendance Service (port 8002)"
echo "  cd attendance-service && mvn spring-boot:run"
echo ""
echo "  # Data Service (port 8003)"
echo "  cd data-service && mvn spring-boot:run"
