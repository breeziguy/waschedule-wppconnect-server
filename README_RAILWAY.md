# WPPConnect Server - Railway Deployment Guide

## 🚀 Deploy to Railway

This guide will help you deploy the WPPConnect Server to Railway as your custom WhatsApp REST API backend.

### Prerequisites
- Railway account (https://railway.app)
- Railway CLI installed (optional but recommended)

### Deployment Steps

#### Option 1: Deploy via Railway Dashboard
1. Go to [Railway](https://railway.app) and create a new project
2. Connect your GitHub repository
3. Railway will automatically detect the `Dockerfile` and `railway.json`
4. Set the environment variables (see below)
5. Deploy!

#### Option 2: Deploy via Railway CLI
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Set environment variables
railway variables set SECRET_KEY=your-secret-key-here
railway variables set DEVICE_NAME=WaSchedule-Server
railway variables set HOST=https://your-app.up.railway.app

# Deploy
railway up
```

### Environment Variables

Set these environment variables in your Railway project:

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `SECRET_KEY` | Secret key for token generation | ✅ | `WaSchedule-Super-Secret-Key-2024` |
| `PORT` | Server port | ❌ | `21465` |
| `HOST` | Server host URL | ❌ | `http://localhost` |
| `DEVICE_NAME` | WhatsApp device name | ❌ | `WaSchedule-Server` |
| `WEBHOOK_URL` | Webhook URL for events | ❌ | `null` |
| `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD` | Skip Puppeteer download | ❌ | `true` |

### After Deployment

1. **Generate Access Token**
   ```bash
   curl -X POST "https://your-app.up.railway.app/api/mySession/YOUR_SECRET_KEY/generate-token"
   ```

2. **Start WhatsApp Session**
   ```bash
   curl -X POST "https://your-app.up.railway.app/api/mySession/start-session" \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

3. **Get QR Code**
   - Call the start-session endpoint again to get the QR code
   - Scan with WhatsApp to authenticate

4. **Send Test Message**
   ```bash
   curl -X POST "https://your-app.up.railway.app/api/mySession/send-message" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{"phone": "5511900000000", "message": "Hello from WaSchedule!"}'
   ```

### API Documentation

- Swagger UI: `https://your-app.up.railway.app/api-docs`
- Health Check: `https://your-app.up.railway.app/api-docs`

### Success Criteria ✅

- ✅ Server deployed at Railway
- ✅ Swagger docs available at `/api-docs`
- ✅ Session creation works
- ✅ QR is returned on `/start-session`
- ✅ Can send messages via `/send-message`

### Troubleshooting

1. **Puppeteer Issues**: The Dockerfile includes all necessary Chrome dependencies
2. **Memory Issues**: Railway provides 512MB RAM by default, upgrade if needed
3. **Port Issues**: Railway automatically assigns the PORT environment variable
4. **Chrome Crashes**: The `--disable-features=LeakyPeeker` flag helps prevent crashes

### Next Steps

After successful deployment:
1. Update your WaSchedule frontend to use this API
2. Set up webhook URL for real-time events
3. Integrate with Supabase Edge Functions if needed

---

**Need help?** Check the [WPPConnect documentation](https://wppconnect.io) or open an issue. 