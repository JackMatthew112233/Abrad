# Deployment Guide - Pesantren Management System

Manual deployment guide using PM2 and Nginx. Database and file storage are handled by Supabase (cloud).

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Server Setup](#server-setup)
4. [Supabase Setup](#supabase-setup)
5. [Cloudflare Domain Setup](#cloudflare-domain-setup)
6. [Clone & Configure](#clone--configure)
7. [Backend Deployment](#backend-deployment)
8. [Frontend Deployment](#frontend-deployment)
9. [Nginx Configuration](#nginx-configuration)
10. [SSL Certificate](#ssl-certificate)
11. [PM2 Management](#pm2-management)
12. [Update & Maintenance](#update--maintenance)
13. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         CLOUD                                │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                    SUPABASE                          │    │
│  │  ┌─────────────────┐  ┌─────────────────────────┐   │    │
│  │  │   PostgreSQL    │  │   Storage (Evidence)    │   │    │
│  │  │   Database      │  │   File Uploads          │   │    │
│  │  └─────────────────┘  └─────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       YOUR SERVER                            │
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐   │
│  │    Nginx     │───▶│   Frontend   │    │   Backend    │   │
│  │   (Reverse   │    │   Next.js    │    │   NestJS     │   │
│  │    Proxy)    │───▶│   :3000      │    │   :4000      │   │
│  │   :80/:443   │    └──────────────┘    └──────────────┘   │
│  └──────────────┘              │                │           │
│                                └────────────────┘           │
│                                      PM2                    │
└─────────────────────────────────────────────────────────────┘
```

| Component | Technology | Port |
|-----------|------------|------|
| Frontend | Next.js 16 | 3000 |
| Backend | NestJS | 4000 |
| Database | Supabase PostgreSQL | Cloud |
| Storage | Supabase Storage | Cloud |
| Reverse Proxy | Nginx | 80/443 |
| Process Manager | PM2 | - |

---

## Prerequisites

### Server Requirements

- Ubuntu 20.04+ / Debian 11+
- Minimum 1GB RAM, 1 CPU
- Domain name pointed to server IP (e.g., `abrad.id`)

### Supabase Account

- Supabase project with PostgreSQL database
- Storage bucket named `Evidence` (public or with signed URLs)

---

## Server Setup

### 1. Update System

```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Install Node.js 20.x

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

### 3. Install pnpm

```bash
npm install -g pnpm
```

### 4. Install PM2

```bash
npm install -g pm2
```

### 5. Install Nginx

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 6. Configure Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

---

## Supabase Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create account
2. Create new project
3. Wait for database to be provisioned

### 2. Get Database Credentials

From Supabase Dashboard > Settings > Database:

- **Connection string (pooled)** - for application use
- **Connection string (direct)** - for migrations

### 3. Get API Keys

From Supabase Dashboard > Settings > API:

- **Project URL** (`SUPABASE_URL`)
- **anon public key** (`SUPABASE_ANON_PUBLIC_KEY`)
- **service_role key** (`SUPABASE_SERVICE_ROLE_KEY`)

### 4. Create Storage Bucket

1. Go to Storage in Supabase Dashboard
2. Create bucket named `Evidence`
3. Set bucket policy as needed (private recommended with signed URLs)

---

## Cloudflare Domain Setup

This guide shows how to configure **abrad.id** domain with Cloudflare for DNS management, SSL, and CDN.

### 1. Add Domain to Cloudflare

1. Login to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Click **"Add a Site"** button
3. Enter domain: `abrad.id`
4. Select plan (Free plan is sufficient)
5. Click **"Continue"**

### 2. Update Nameservers at Domain Registrar

Cloudflare will provide two nameservers. Update them at your domain registrar:

1. Go to your domain registrar (e.g., Niagahoster, Namecheap, GoDaddy)
2. Find DNS/Nameserver settings for `abrad.id`
3. Replace existing nameservers with Cloudflare's:
   ```
   ns1.cloudflare.com
   ns2.cloudflare.com
   ```
   > Note: Actual nameservers may vary, use the ones shown in Cloudflare dashboard

4. Save changes and wait for propagation (can take up to 24-48 hours)

### 3. Configure DNS Records

In Cloudflare Dashboard > DNS > Records, add the following:

#### A Records (Point to your server IP)

| Type | Name | Content | Proxy | TTL |
|------|------|---------|-------|-----|
| A | `@` | `YOUR_SERVER_IP` | Proxied (orange cloud) | Auto |
| A | `www` | `YOUR_SERVER_IP` | Proxied (orange cloud) | Auto |
| A | `api` | `YOUR_SERVER_IP` | Proxied (orange cloud) | Auto |

> Replace `YOUR_SERVER_IP` with your actual server IP address

#### Example DNS Setup

```
Type    Name    Content         Proxy Status    TTL
A       @       103.xxx.xxx.xx  Proxied         Auto
A       www     103.xxx.xxx.xx  Proxied         Auto
A       api     103.xxx.xxx.xx  Proxied         Auto
```

### 4. Configure SSL/TLS Settings

1. Go to **SSL/TLS** in Cloudflare Dashboard
2. Set encryption mode to **"Full (strict)"**
   - This requires valid SSL certificate on your origin server
   - Use Certbot/Let's Encrypt on your server

3. Under **Edge Certificates**:
   - Enable **"Always Use HTTPS"**
   - Enable **"Automatic HTTPS Rewrites"**
   - Set **Minimum TLS Version** to `TLS 1.2`

### 5. Configure Page Rules (Optional)

Go to **Rules** > **Page Rules** and add:

#### Force HTTPS
- URL: `*abrad.id/*`
- Setting: **Always Use HTTPS**

#### Cache Static Assets
- URL: `*abrad.id/_next/static/*`
- Setting: **Cache Level** = Cache Everything
- Setting: **Edge Cache TTL** = 1 month

### 6. Performance Settings

Go to **Speed** > **Optimization**:

1. **Auto Minify**: Enable for JavaScript, CSS, HTML
2. **Brotli**: Enable
3. **Early Hints**: Enable
4. **Rocket Loader**: Disable (can break Next.js)

### 7. Security Settings

Go to **Security** > **Settings**:

1. **Security Level**: Medium
2. **Challenge Passage**: 30 minutes
3. **Browser Integrity Check**: Enable

Go to **Security** > **WAF**:

1. Enable **Managed Rules** (if available on your plan)
2. Enable **Rate Limiting** for API protection (optional)

### 8. Verify Domain is Active

1. Check Cloudflare Dashboard - domain status should be **"Active"**
2. Test DNS propagation:
   ```bash
   # Check A record
   dig abrad.id +short
   
   # Check if using Cloudflare
   curl -I https://abrad.id
   # Should see "cf-ray" header in response
   ```

### 9. Final DNS Configuration

After setup, your DNS should look like:

```
abrad.id           →  YOUR_SERVER_IP (Proxied)
www.abrad.id       →  YOUR_SERVER_IP (Proxied)
api.abrad.id       →  YOUR_SERVER_IP (Proxied)
```

With the following URLs:
- **Frontend**: `https://abrad.id` or `https://www.abrad.id`
- **Backend API**: `https://api.abrad.id`

### 10. Update Environment Variables

After Cloudflare setup, update your environment files:

**Backend `.env`:**
```env
APP_URL="https://abrad.id"
API_URL="https://api.abrad.id"
```

**Frontend `.env.local`:**
```env
NEXT_PUBLIC_API_URL=https://api.abrad.id
```

---

## Clone & Configure

### 1. Clone Repository

```bash
cd ~
git clone https://github.com/YOUR_USERNAME/pesantren.git
cd pesantren
```

### 2. Install Dependencies

```bash
# Backend
cd ~/pesantren/backend
pnpm install

# Frontend
cd ~/pesantren/frontend
pnpm install
```

---

## Backend Deployment

### 1. Configure Environment Variables

```bash
cd ~/pesantren/backend
nano .env
```

```env
# Supabase PostgreSQL (pooled connection for app)
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Supabase PostgreSQL (direct connection for migrations)
DIRECT_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# Supabase Credentials
SUPABASE_URL="https://[PROJECT_REF].supabase.co"
SUPABASE_ANON_PUBLIC_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# JWT Secret (generate strong random string)
JWT_SECRET="your-super-secure-jwt-secret-min-32-characters"

# Server
PORT=4000
NODE_ENV=production
```

> **Generate JWT Secret:**
> ```bash
> openssl rand -base64 32
> ```

### 2. Update CORS for Production

Edit `src/main.ts` to allow your domain:

```typescript
app.enableCors({
  origin: ['https://abrad.id', 'https://www.abrad.id'],
  credentials: true,
});
```

Or use environment variable (recommended):

```typescript
app.enableCors({
  origin: process.env.APP_URL || 'http://localhost:3000',
  credentials: true,
});
```

Then add to `.env`:

```env
APP_URL=https://abrad.id
```

### 3. Run Database Migrations

```bash
cd ~/pesantren/backend
pnpm prisma migrate deploy
pnpm prisma generate
```

### 4. Build Backend

```bash
pnpm build
```

### 5. Test Backend

```bash
pnpm start:prod
# Should start on port 4000
# Press Ctrl+C to stop
```

---

## Frontend Deployment

### 1. Configure Environment Variables

```bash
cd ~/pesantren/frontend
nano .env.local
```

```env
NEXT_PUBLIC_API_URL=https://api.abrad.id
```

Or if using same domain with path prefix:

```env
NEXT_PUBLIC_API_URL=https://abrad.id/api
```

### 2. Build Frontend

```bash
pnpm build
```

---

## PM2 Configuration

### 1. Create Ecosystem File

```bash
nano ~/pesantren/ecosystem.config.cjs
```

```javascript
module.exports = {
  apps: [
    {
      name: 'pesantren-backend',
      cwd: '~/pesantren/backend',
      script: 'dist/main.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
      error_file: '~/pesantren/logs/backend-error.log',
      out_file: '~/pesantren/logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      max_memory_restart: '500M',
    },
    {
      name: 'pesantren-frontend',
      cwd: '~/pesantren/frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: '~/pesantren/logs/frontend-error.log',
      out_file: '~/pesantren/logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      max_memory_restart: '500M',
    },
  ],
};
```

### 2. Create Logs Directory

```bash
mkdir -p ~/pesantren/logs
```

### 3. Start Applications

```bash
cd ~/pesantren
pm2 start ecosystem.config.cjs
```

### 4. Save PM2 Configuration

```bash
pm2 save
pm2 startup
# Copy and run the command shown in output
```

---

## Nginx Configuration

### Option A: Separate Subdomains

```bash
sudo nano /etc/nginx/sites-available/pesantren
```

```nginx
# Backend API (api.abrad.id)
server {
    listen 80;
    server_name api.abrad.id;

    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    client_max_body_size 10M;
}

# Frontend (abrad.id)
server {
    listen 80;
    server_name abrad.id www.abrad.id;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Cache static assets
    location /_next/static {
        proxy_pass http://127.0.0.1:3000;
        add_header Cache-Control "public, immutable, max-age=31536000";
    }
}
```

### Option B: Single Domain with /api Prefix

```nginx
server {
    listen 80;
    server_name abrad.id www.abrad.id;

    # API routes
    location /api/ {
        rewrite ^/api/(.*) /$1 break;
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Frontend
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    client_max_body_size 10M;
}
```

### Enable Site

```bash
sudo ln -s /etc/nginx/sites-available/pesantren /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

---

## SSL Certificate

### Install Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### Obtain Certificate

```bash
# Separate subdomains (recommended for abrad.id)
sudo certbot --nginx -d abrad.id -d www.abrad.id -d api.abrad.id

# Or single domain
sudo certbot --nginx -d abrad.id -d www.abrad.id
```

### Auto-Renewal Test

```bash
sudo certbot renew --dry-run
```

---

## PM2 Management

### Common Commands

```bash
# View processes
pm2 list

# View logs
pm2 logs
pm2 logs pesantren-backend --lines 100
pm2 logs pesantren-frontend --lines 100

# Restart
pm2 restart all
pm2 restart pesantren-backend
pm2 restart pesantren-frontend

# Stop
pm2 stop all

# Monitor
pm2 monit

# Show details
pm2 show pesantren-backend
```

---

## Update & Maintenance

### Deploy Updates

```bash
cd ~/pesantren

# Pull changes
git pull origin main

# Backend
cd backend
pnpm install
pnpm prisma migrate deploy
pnpm prisma generate
pnpm build

# Frontend
cd ../frontend
pnpm install
pnpm build

# Restart
pm2 restart all
```

### Create Update Script

```bash
nano ~/pesantren/deploy.sh
```

```bash
#!/bin/bash
set -e

cd ~/pesantren

echo "📥 Pulling latest changes..."
git pull origin main

echo "🔧 Building backend..."
cd backend
pnpm install --frozen-lockfile
pnpm prisma migrate deploy
pnpm prisma generate
pnpm build

echo "🎨 Building frontend..."
cd ../frontend
pnpm install --frozen-lockfile
pnpm build

echo "🔄 Restarting services..."
pm2 restart all

echo "✅ Deployment complete!"
pm2 list
```

```bash
chmod +x ~/pesantren/deploy.sh
```

Usage:

```bash
~/pesantren/deploy.sh
```

---

## Troubleshooting

### Check Services Status

```bash
# PM2
pm2 list
pm2 logs --lines 50

# Nginx
sudo systemctl status nginx
sudo nginx -t

# Ports
sudo ss -tlnp | grep -E '3000|4000|80|443'
```

### Common Issues

#### 502 Bad Gateway

```bash
# Check if apps are running
pm2 list

# Check logs
pm2 logs pesantren-backend --lines 50

# Restart
pm2 restart all
```

#### Database Connection Error

```bash
# Check .env file
cat ~/pesantren/backend/.env | grep DATABASE

# Test connection (from backend folder)
cd ~/pesantren/backend
pnpm prisma db pull
```

#### CORS Error

- Verify `CORS_ORIGIN` in backend `.env`
- Check `main.ts` CORS configuration
- Ensure frontend `NEXT_PUBLIC_API_URL` matches

#### Build Fails

```bash
# Clear node_modules and reinstall
rm -rf node_modules
pnpm install

# Clear Next.js cache
rm -rf .next
pnpm build
```

---

## Environment Variables Reference

### Backend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Supabase pooled connection | `postgresql://...6543/postgres?pgbouncer=true` |
| `DIRECT_URL` | Supabase direct connection | `postgresql://...5432/postgres` |
| `SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_ANON_PUBLIC_KEY` | Supabase anon key | `eyJ...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | `eyJ...` |
| `JWT_SECRET` | JWT signing secret | Random 32+ chars |
| `PORT` | Backend port | `4000` |
| `NODE_ENV` | Environment | `production` |
| `APP_URL` | Frontend URL (for CORS) | `https://abrad.id` |
| `API_URL` | Backend API URL | `https://api.abrad.id` |

### Frontend (.env.local)

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://api.abrad.id` |

---

## Security Checklist

- [ ] Strong JWT_SECRET (min 32 characters)
- [ ] Supabase service role key kept secret
- [ ] SSL certificate installed
- [ ] Firewall configured (UFW)
- [ ] Environment files secured (`chmod 600 .env`)
- [ ] CORS configured for production domain only
- [ ] Regular updates applied

---

## Quick Commands Reference

```bash
# Deploy updates
~/pesantren/deploy.sh

# View logs
pm2 logs

# Restart all
pm2 restart all

# Check status
pm2 list

# Test nginx config
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx

# Renew SSL
sudo certbot renew
```
