# Fly.io Deployment Guide

## Prerequisites
- [Fly CLI installed](https://fly.io/docs/flyctl/install/)
- [Fly account](https://fly.io/signup)
- PostgreSQL database (Supabase recommended for free tier)

---

## Step 1: Install Fly CLI

```bash
# macOS
brew install flyctl

# Linux
curl -L https://fly.io/install.sh | sh

# Windows (PowerShell)
iwr https://fly.io/install.ps1 -useb | iex

# Login
fly auth login
```

---

## Step 2: Set Up Database (Supabase Recommended)

1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings > Connection Pooling
4. Copy the Connection URI

---

## Step 3: Deploy Backend

```bash
cd backend-python

# Create the app (choose a unique name)
fly apps create smartattendance-api

# Set secrets
fly secrets set JWT_SECRET="your-super-secure-secret-at-least-32-chars"
fly secrets set DATABASE_URL="postgres://user:pass@host:6543/postgres"
fly secrets set ALLOWED_ORIGINS="https://smartattendance-web.fly.dev"
fly secrets set FRONTEND_URL="https://smartattendance-web.fly.dev"

# Launch the app
fly launch --no-deploy

# Deploy
fly deploy
```

---

## Step 4: Deploy Frontend

```bash
cd web

# Create the app
fly apps create smartattendance-web

# Set the API base URL (your deployed backend)
fly secrets set VITE_API_BASE_URL="https://smartattendance-api.fly.dev"

# Launch and deploy
fly launch --no-deploy
fly deploy
```

---

## Step 5: Update CORS on Backend

After deploying frontend, update backend CORS:

```bash
fly secrets set ALLOWED_ORIGINS="https://smartattendance-web.fly.dev"
fly deploy -c backend-python/fly.toml
```

---

## Verify Deployment

```bash
# Check backend health
curl https://smartattendance-api.fly.dev/health

# Check frontend
open https://smartattendance-web.fly.dev
```

---

## Useful Commands

```bash
# View logs
fly logs -a smartattendance-api
fly logs -a smartattendance-web

# SSH into app
fly ssh console -a smartattendance-api

# Check status
fly status -a smartattendance-api
fly status -a smartattendance-web

# Restart app
fly restart -a smartattendance-api
```

---

## Mobile App Configuration

Update `mobile/lib/config/api_config.dart`:

```dart
static String get _defaultUrl {
  return 'https://smartattendance-api.fly.dev/api/v1';
}
```

Then rebuild:
```bash
cd mobile
flutter run
```

---

## Cost (Free Tier)

| Service | Free Allowance |
|---------|---------------|
| Fly.io | 3 shared VMs, 160GB bandwidth |
| Supabase | 500MB database, 2GB transfer |

**Total: $0/month**
