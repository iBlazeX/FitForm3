# Render.com Deployment Guide for FitForm

This guide provides step-by-step instructions for deploying FitForm (web app, CV service, and backend) on Render.com using Docker.

## Overview

FitForm consists of three services that will be deployed on Render.com:
1. **CV Service** - Python/Flask computer vision service (Port 5000)
2. **Backend API** - Node.js/Express API with Firebase (Port 3000)
3. **Web App** - React application served by Nginx (Port 80)

## Prerequisites

Before deploying, ensure you have:

- [ ] GitHub account with this repository
- [ ] Render.com account ([sign up here](https://render.com))
- [ ] Firebase project setup:
  - Firebase Authentication enabled (Email/Password provider)
  - Firestore database created
  - Service account key (JSON file) generated
  - Web app configuration (API keys)

## Firebase Setup

If you haven't set up Firebase yet:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Enable **Authentication**:
   - Go to Authentication → Sign-in method
   - Enable "Email/Password" provider
4. Create **Firestore Database**:
   - Go to Firestore Database
   - Click "Create database"
   - Choose production mode
5. Generate **Service Account Key**:
   - Go to Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Save the JSON file securely
   - Convert to single-line string: `cat serviceAccountKey.json | jq -c`
6. Get **Web App Configuration**:
   - Go to Project Settings → General
   - Scroll to "Your apps" section
   - Copy the Firebase configuration object

## Deployment Options

### Option 1: Automatic Deployment with Blueprint (Recommended)

This is the fastest way to deploy all services at once.

1. **Push Code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

2. **Deploy via Render Blueprint**
   - Log in to [Render Dashboard](https://dashboard.render.com/)
   - Click "New" → "Blueprint"
   - Select "Connect a repository"
   - Choose your FitForm repository
   - Render will detect `render.yaml` and show all three services
   - Click "Apply" to create all services

3. **Configure Environment Variables**

   After services are created, configure environment variables for each:

   **fitform-backend**:
   - Go to the backend service in Render dashboard
   - Navigate to "Environment" tab
   - Add the following variables:
     - `FIREBASE_SERVICE_ACCOUNT`: Your service account JSON (single line)
     - `CORS_ORIGINS`: `https://fitform-web-app.onrender.com`
   - Click "Save Changes"

   **fitform-web-app**:
   - Go to the web app service in Render dashboard
   - Navigate to "Environment" tab
   - Add your Firebase web configuration:
     - `REACT_APP_FIREBASE_API_KEY`
     - `REACT_APP_FIREBASE_AUTH_DOMAIN`
     - `REACT_APP_FIREBASE_PROJECT_ID`
     - `REACT_APP_FIREBASE_STORAGE_BUCKET`
     - `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`
     - `REACT_APP_FIREBASE_APP_ID`
   - Click "Save Changes"

   **fitform-cv-service**:
   - No additional environment variables needed (uses defaults from render.yaml)

4. **Wait for Deployment**
   - Render will automatically build and deploy each service
   - Monitor the deployment logs in each service's dashboard
   - Initial deployment may take 5-10 minutes

5. **Access Your Application**
   - Web App: `https://fitform-web-app.onrender.com`
   - Backend API: `https://fitform-backend.onrender.com`
   - CV Service: `https://fitform-cv-service.onrender.com`

### Option 2: Manual Service Creation

If you prefer more control, deploy each service manually:

#### Deploy CV Service

1. In Render Dashboard, click "New" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `fitform-cv-service`
   - **Environment**: Docker
   - **Region**: Oregon (or your preferred region)
   - **Branch**: main
   - **Dockerfile Path**: `./cv-service/Dockerfile`
   - **Docker Context**: `./cv-service`
   - **Plan**: Starter (or Free)
4. Add environment variables:
   - `PORT`: `5000`
   - `FLASK_DEBUG`: `false`
5. Click "Create Web Service"

#### Deploy Backend API

1. In Render Dashboard, click "New" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `fitform-backend`
   - **Environment**: Docker
   - **Region**: Oregon (or your preferred region)
   - **Branch**: main
   - **Dockerfile Path**: `./backend/Dockerfile`
   - **Docker Context**: `./backend`
   - **Plan**: Starter (or Free)
4. Add environment variables:
   - `PORT`: `3000`
   - `NODE_ENV`: `production`
   - `CV_SERVICE_URL`: `https://fitform-cv-service.onrender.com`
   - `FIREBASE_SERVICE_ACCOUNT`: Your Firebase service account JSON (single line)
   - `CORS_ORIGINS`: `https://fitform-web-app.onrender.com`
5. Click "Create Web Service"

#### Deploy Web App

1. In Render Dashboard, click "New" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `fitform-web-app`
   - **Environment**: Docker
   - **Region**: Oregon (or your preferred region)
   - **Branch**: main
   - **Dockerfile Path**: `./web-app/Dockerfile`
   - **Docker Context**: `./web-app`
   - **Plan**: Starter (or Free)
4. Add environment variables (build-time):
   - `REACT_APP_API_URL`: `https://fitform-backend.onrender.com/api`
   - `REACT_APP_CV_SERVICE_URL`: `https://fitform-cv-service.onrender.com/api`
   - `REACT_APP_FIREBASE_API_KEY`: Your Firebase API key
   - `REACT_APP_FIREBASE_AUTH_DOMAIN`: Your Firebase auth domain
   - `REACT_APP_FIREBASE_PROJECT_ID`: Your Firebase project ID
   - `REACT_APP_FIREBASE_STORAGE_BUCKET`: Your Firebase storage bucket
   - `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`: Your Firebase sender ID
   - `REACT_APP_FIREBASE_APP_ID`: Your Firebase app ID
5. Click "Create Web Service"

## Verification

After deployment, verify each service is working:

### 1. Check CV Service Health
```bash
curl https://fitform-cv-service.onrender.com/health
# Expected: {"status":"healthy","service":"cv-service","version":"1.0.0"}
```

### 2. Check Backend Health
```bash
curl https://fitform-backend.onrender.com/health
# Expected: {"status":"healthy","service":"backend-api","version":"1.0.0","timestamp":"..."}
```

### 3. Check Web App
Visit `https://fitform-web-app.onrender.com` in your browser. You should see the FitForm application login page.

### 4. Test Exercise Detection
```bash
curl -X GET https://fitform-cv-service.onrender.com/api/exercises
# Expected: List of supported exercises
```

## Environment Variables Reference

### Backend Service (`fitform-backend`)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `PORT` | No | Server port (auto-set by Render) | `3000` |
| `NODE_ENV` | Yes | Environment mode | `production` |
| `CV_SERVICE_URL` | Yes | URL of CV service | `https://fitform-cv-service.onrender.com` |
| `FIREBASE_SERVICE_ACCOUNT` | Yes | Firebase service account JSON (single line) | `{"type":"service_account",...}` |
| `CORS_ORIGINS` | Yes | Allowed CORS origins (comma-separated) | `https://fitform-web-app.onrender.com` |

### CV Service (`fitform-cv-service`)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `PORT` | No | Server port (auto-set by Render) | `5000` |
| `FLASK_DEBUG` | No | Flask debug mode | `false` |
| `PYTHON_VERSION` | No | Python version | `3.11` |

### Web App (`fitform-web-app`)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `REACT_APP_API_URL` | Yes | Backend API URL | `https://fitform-backend.onrender.com/api` |
| `REACT_APP_CV_SERVICE_URL` | Yes | CV Service URL | `https://fitform-cv-service.onrender.com/api` |
| `REACT_APP_FIREBASE_API_KEY` | Yes | Firebase API key | `AIza...` |
| `REACT_APP_FIREBASE_AUTH_DOMAIN` | Yes | Firebase auth domain | `your-app.firebaseapp.com` |
| `REACT_APP_FIREBASE_PROJECT_ID` | Yes | Firebase project ID | `your-project-id` |
| `REACT_APP_FIREBASE_STORAGE_BUCKET` | Yes | Firebase storage bucket | `your-app.appspot.com` |
| `REACT_APP_FIREBASE_MESSAGING_SENDER_ID` | Yes | Firebase sender ID | `123456789` |
| `REACT_APP_FIREBASE_APP_ID` | Yes | Firebase app ID | `1:123:web:abc` |

## Custom Domain (Optional)

To use your own domain:

1. Go to your service in Render dashboard
2. Navigate to "Settings" → "Custom Domains"
3. Click "Add Custom Domain"
4. Enter your domain (e.g., `app.yourdomain.com`)
5. Update your DNS records as instructed:
   - Add CNAME record pointing to Render's hostname
6. Wait for DNS propagation (usually 5-15 minutes)
7. SSL certificate will be automatically provisioned

## Pricing

### Free Tier
- ✅ All three services can run on free tier
- ⚠️ Services spin down after 15 minutes of inactivity
- ⚠️ Cold starts take 30-60 seconds
- ✅ 750 hours/month usage limit
- ✅ SSL certificates included

### Starter Tier ($7/month per service)
- ✅ Services always on (no cold starts)
- ✅ Better performance and resources
- ✅ Custom domains
- ✅ Priority support

**Recommendation**: Start with free tier for testing, upgrade to Starter tier for production use.

## Monitoring and Logs

### View Logs
1. Go to your service in Render dashboard
2. Click on "Logs" tab
3. View real-time logs or download historical logs

### Set Up Alerts
1. Go to service settings
2. Navigate to "Notifications"
3. Configure email alerts for:
   - Deploy failures
   - Service health issues
   - High resource usage

### Health Checks
All services have health check endpoints:
- CV Service: `/health`
- Backend: `/health`
- Web App: `/` (Nginx responds with 200)

Render automatically monitors these endpoints.

## Troubleshooting

### Service Won't Start

**Check build logs:**
1. Go to service in Render dashboard
2. Click "Logs" tab
3. Look for build errors in the logs

**Common issues:**
- Missing environment variables
- Docker build errors
- Port conflicts
- Firebase configuration issues

### Backend Can't Connect to CV Service

**Check:**
1. CV Service is running and healthy
2. `CV_SERVICE_URL` environment variable is set correctly
3. No firewall/network issues

### Web App Shows Blank Page

**Check:**
1. Browser console for JavaScript errors
2. Environment variables are set correctly
3. Backend API is accessible
4. Firebase configuration is correct

### Firebase Authentication Not Working

**Check:**
1. Firebase project has Authentication enabled
2. Email/Password provider is enabled
3. `FIREBASE_SERVICE_ACCOUNT` is correctly formatted (single line JSON)
4. Firebase web config variables in web-app are correct
5. CORS settings in backend allow web app domain

### Services Running Slow

**Solutions:**
1. Upgrade from Free to Starter tier (removes cold starts)
2. Check service metrics in Render dashboard
3. Consider upgrading to higher plan if needed
4. Optimize Docker images (reduce size)

### Deployment Failed

**Solutions:**
1. Check build logs for specific errors
2. Verify Dockerfile syntax
3. Ensure all dependencies are listed in requirements.txt or package.json
4. Check that Docker context is set correctly

## Updating Your Application

### Automatic Deploys
Render automatically deploys when you push to your connected branch:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

Render will detect the push and rebuild/redeploy affected services.

### Manual Deploy
1. Go to service in Render dashboard
2. Click "Manual Deploy" → "Deploy latest commit"

### Rollback
1. Go to service in Render dashboard
2. Click "Deploys" tab
3. Find previous successful deploy
4. Click "Rollback" button

## Security Best Practices

1. **Never commit secrets to repository**
   - Use environment variables for all sensitive data
   - Add `.env` files to `.gitignore`

2. **Use Firebase Security Rules**
   - Restrict Firestore access to authenticated users only
   - Validate data on the server side

3. **Enable CORS properly**
   - Only allow your web app domain in `CORS_ORIGINS`
   - Don't use `*` in production

4. **Keep dependencies updated**
   - Regularly update npm packages
   - Update Python packages
   - Monitor for security vulnerabilities

5. **Use HTTPS only**
   - Render provides free SSL certificates
   - Enforce HTTPS in your application

## Support

If you encounter issues:

1. Check [Render Documentation](https://render.com/docs)
2. Review [FitForm Documentation](../README.md)
3. Check service logs in Render dashboard
4. Open an issue in the GitHub repository

## Additional Resources

- [Render Documentation](https://render.com/docs)
- [Docker Documentation](https://docs.docker.com/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [FitForm Architecture](../ARCHITECTURE.md)

---

**Happy Deploying! 🚀**
