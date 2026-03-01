#!/bin/bash

# Backend
echo "Starting backend..."
docker-compose up --build >> backend.log 2>&1 &

# Web
echo "Starting web..."
(
  cd web || exit 1
  npm install && npm run dev
) >> web.log 2>&1 &

# Mobile
echo "Starting mobile..."
(
  cd mobile || exit 1
  flutter pub get && flutter run
) >> mobile.log 2>&1 &

echo "All services started in background."
echo "Logs:"
echo "  backend.log"
echo "  web.log"
echo "  mobile.log"
