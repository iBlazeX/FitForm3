# FitForm Render.com Deployment - Quick Reference

## 📦 What's Included

This repository is ready for deployment on Render.com with:
- ✅ **render.yaml** - Infrastructure as Code configuration
- ✅ **3 Docker services** - CV service, Backend API, Web App
- ✅ **Dynamic port configuration** - Works with Render's PORT env var
- ✅ **Comprehensive documentation** - See RENDER_DEPLOYMENT.md
- ✅ **Setup helper script** - Run `./setup-render.sh`

## 🚀 Quick Deploy (5 Steps)

### 1. Prepare Firebase
- Create Firebase project at https://console.firebase.google.com/
- Enable Authentication (Email/Password)
- Create Firestore database
- Generate service account key (JSON)

### 2. Push to GitHub
```bash
git add .
git commit -m "Add Render.com deployment"
git push origin main
```

### 3. Deploy on Render
- Go to https://dashboard.render.com/
- Click "New" → "Blueprint"
- Connect your GitHub repository
- Render auto-detects `render.yaml` and creates all services

### 4. Configure Environment Variables

**Backend Service (`fitform-backend`):**
```
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
CORS_ORIGINS=https://fitform-web-app.onrender.com
```

**Web App Service (`fitform-web-app`):**
```
REACT_APP_API_URL=https://fitform-backend.onrender.com/api
REACT_APP_CV_SERVICE_URL=https://fitform-cv-service.onrender.com/api
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123:web:abc
```

### 5. Access Your App
- Web App: `https://fitform-web-app.onrender.com`
- Backend: `https://fitform-backend.onrender.com`
- CV Service: `https://fitform-cv-service.onrender.com`

## 📁 Files Modified/Created

### Configuration Files
- `render.yaml` - Render.com blueprint (new)
- `.renderignore` - Files to exclude from deployment (new)

### Docker Files
- `backend/Dockerfile` - No changes needed ✓
- `cv-service/Dockerfile` - Updated for dynamic PORT
- `web-app/Dockerfile` - Updated for dynamic PORT
- `web-app/docker-entrypoint.sh` - Nginx configuration script (new)

### Documentation
- `RENDER_DEPLOYMENT.md` - Comprehensive guide (new)
- `DEPLOYMENT.md` - Updated with Render section
- `README.md` - Updated with Render reference
- `setup-render.sh` - Pre-deployment verification script (new)

## ⚡ Key Features

| Feature | Description |
|---------|-------------|
| **One-Click Deploy** | render.yaml automates entire deployment |
| **Free Tier** | All services can run on Render's free tier |
| **Auto SSL** | Free SSL certificates for all services |
| **Dynamic Ports** | Handles Render's dynamic PORT assignment |
| **Health Checks** | All services have health endpoints |
| **Zero Config** | Default values work out of the box |

## 💰 Pricing Options

### Free Tier (Testing)
- ⚠️ Services spin down after 15 minutes
- ⚠️ Cold start ~30-60 seconds
- ✅ 750 hours/month per service
- ✅ Perfect for testing

### Starter Tier ($7/month per service)
- ✅ Always-on (no cold starts)
- ✅ Better performance
- ✅ Custom domains
- ✅ Recommended for production

**Total cost for production: $21/month (3 services)**

## 🔍 Verify Deployment

Test each service after deployment:

```bash
# CV Service
curl https://fitform-cv-service.onrender.com/health

# Backend
curl https://fitform-backend.onrender.com/health

# Web App
curl https://fitform-web-app.onrender.com

# Test exercise API
curl https://fitform-cv-service.onrender.com/api/exercises
```

## 📚 Full Documentation

For detailed instructions, troubleshooting, and advanced configuration:
- **Complete Guide**: [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md)
- **General Deployment**: [DEPLOYMENT.md](DEPLOYMENT.md)
- **Project Overview**: [README.md](README.md)

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| Build fails | Check logs in Render dashboard |
| Service won't start | Verify environment variables |
| Backend can't reach CV service | Check CV_SERVICE_URL variable |
| Web app blank page | Check browser console & Firebase config |
| Authentication errors | Verify Firebase service account JSON |

## 📞 Support

- Render Docs: https://render.com/docs
- Firebase Docs: https://firebase.google.com/docs
- GitHub Issues: Open an issue in this repository

---

**Ready to deploy? Run `./setup-render.sh` to verify everything is ready!**
