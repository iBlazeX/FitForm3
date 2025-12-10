# Deployment Guide

This guide covers various deployment options for FitForm.

## Prerequisites

- Docker and Docker Compose
- Cloud provider account (AWS, Google Cloud, Azure, etc.)
- Domain name (optional but recommended)
- SSL certificate (Let's Encrypt recommended)

## Local Deployment with Docker

```bash
# Clone repository
git clone https://github.com/iBlazeX/FitForm.git
cd FitForm

# Configure environment variables
cp backend/.env.example backend/.env
cp web-app/.env.example web-app/.env
# Edit .env files with your settings

# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Production Deployment

### 1. AWS Deployment

#### Using AWS ECS (Elastic Container Service)

```bash
# Build and push images
docker build -t fitform-backend ./backend
docker build -t fitform-cv-service ./cv-service
docker build -t fitform-web ./web-app

# Tag for ECR
docker tag fitform-backend:latest YOUR_ECR_URL/fitform-backend:latest
docker tag fitform-cv-service:latest YOUR_ECR_URL/fitform-cv-service:latest
docker tag fitform-web:latest YOUR_ECR_URL/fitform-web:latest

# Push to ECR
docker push YOUR_ECR_URL/fitform-backend:latest
docker push YOUR_ECR_URL/fitform-cv-service:latest
docker push YOUR_ECR_URL/fitform-web:latest

# Create ECS Task Definitions and Services
# Use AWS Console or CLI to create tasks and services
```

#### Using AWS Elastic Beanstalk

```bash
# Install EB CLI
pip install awsebcli

# Initialize EB application
eb init -p docker fitform

# Create environment
eb create fitform-production

# Deploy
eb deploy
```

### 2. Google Cloud Deployment

#### Using Cloud Run

```bash
# Authenticate
gcloud auth login

# Set project
gcloud config set project YOUR_PROJECT_ID

# Build and deploy backend
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/fitform-backend ./backend
gcloud run deploy fitform-backend --image gcr.io/YOUR_PROJECT_ID/fitform-backend --platform managed

# Build and deploy CV service
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/fitform-cv-service ./cv-service
gcloud run deploy fitform-cv-service --image gcr.io/YOUR_PROJECT_ID/fitform-cv-service --platform managed

# Build and deploy web app
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/fitform-web ./web-app
gcloud run deploy fitform-web --image gcr.io/YOUR_PROJECT_ID/fitform-web --platform managed
```

#### Using Google Kubernetes Engine (GKE)

```bash
# Create cluster
gcloud container clusters create fitform-cluster --num-nodes=3

# Get credentials
gcloud container clusters get-credentials fitform-cluster

# Apply Kubernetes manifests (create these based on docker-compose.yml)
kubectl apply -f k8s/
```

### 3. Azure Deployment

#### Using Azure Container Instances

```bash
# Login
az login

# Create resource group
az group create --name fitform-rg --location eastus

# Create container registry
az acr create --resource-group fitform-rg --name fitformregistry --sku Basic

# Build and push images
az acr build --registry fitformregistry --image fitform-backend:latest ./backend
az acr build --registry fitformregistry --image fitform-cv-service:latest ./cv-service
az acr build --registry fitformregistry --image fitform-web:latest ./web-app

# Deploy container instances
az container create \
  --resource-group fitform-rg \
  --name fitform-backend \
  --image fitformregistry.azurecr.io/fitform-backend:latest \
  --ports 3000
```

### 4. Heroku Deployment

```bash
# Install Heroku CLI
# Login
heroku login

# Create apps
heroku create fitform-backend
heroku create fitform-cv-service
heroku create fitform-web

# Set buildpack for backend
cd backend
heroku buildpacks:set heroku/nodejs
git push heroku main

# Deploy CV service
cd ../cv-service
heroku buildpacks:set heroku/python
git push heroku main

# Deploy web app
cd ../web-app
heroku buildpacks:set heroku/nodejs
heroku buildpacks:add --index 1 https://github.com/heroku/heroku-buildpack-static
git push heroku main
```

## Database Setup

### MongoDB Atlas (Recommended)

1. Create account at mongodb.com/cloud/atlas
2. Create a cluster
3. Create database user
4. Whitelist IP addresses (or allow from anywhere for testing)
5. Get connection string
6. Update MONGODB_URI in backend .env

### Self-hosted MongoDB

```bash
# Using Docker
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -v mongodb_data:/data/db \
  -e MONGO_INITDB_DATABASE=fitform \
  mongo:7.0
```

## Environment Variables

### Backend
```
PORT=3000
MONGODB_URI=mongodb://your-mongodb-url/fitform
JWT_SECRET=your-secure-secret-key
CV_SERVICE_URL=http://your-cv-service-url:5000
```

### Web App
```
REACT_APP_API_URL=https://your-api-url/api
REACT_APP_CV_SERVICE_URL=https://your-cv-service-url/api
```

## SSL/TLS Setup

### Using Let's Encrypt with Nginx

```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

## Monitoring and Logging

### Application Monitoring

- **Sentry**: Error tracking
- **New Relic**: Performance monitoring
- **DataDog**: Infrastructure monitoring

### Logging

```bash
# View Docker logs
docker-compose logs -f [service-name]

# Set up centralized logging with ELK stack
# Or use cloud provider's logging service (CloudWatch, Stackdriver, etc.)
```

## Health Checks

Set up health check endpoints:

- Backend: GET /health
- CV Service: GET /health

Configure load balancer to use these endpoints.

## Scaling

### Horizontal Scaling

```bash
# Docker Compose
docker-compose up --scale backend=3 --scale cv-service=2

# Kubernetes
kubectl scale deployment fitform-backend --replicas=3
```

### Database Scaling

- Use MongoDB replica sets
- Enable sharding for large datasets
- Use read replicas

## Backup Strategy

### Database Backup

```bash
# MongoDB backup
mongodump --uri="mongodb://user:password@host/fitform" --out=/backup/

# Automated backups with MongoDB Atlas
# Configure automatic backups in Atlas console
```

### Application Backup

- Regular Docker image backups
- Source code in Git repository
- Environment configuration in secure storage

## Security Checklist

- [ ] Use HTTPS in production
- [ ] Set strong JWT secret
- [ ] Use environment variables for secrets
- [ ] Enable CORS only for trusted origins
- [ ] Implement rate limiting
- [ ] Regular security updates
- [ ] Use firewall rules
- [ ] Enable database authentication
- [ ] Regular backups
- [ ] Monitor for security issues

## Troubleshooting

### Service won't start
- Check logs: `docker-compose logs [service-name]`
- Verify environment variables
- Check port conflicts

### Database connection issues
- Verify MongoDB is running
- Check connection string
- Verify network connectivity

### CV service performance
- Increase worker count
- Use GPU-enabled instances
- Implement request queuing

## Maintenance

### Updates

```bash
# Pull latest changes
git pull origin main

# Rebuild images
docker-compose build

# Restart services
docker-compose up -d
```

### Monitoring Logs

```bash
# Real-time logs
docker-compose logs -f

# Specific service
docker-compose logs -f backend
```

## Support

For deployment issues:
1. Check documentation
2. Search existing issues
3. Create new issue with deployment details
