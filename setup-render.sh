#!/bin/bash
# Quick setup script for Render.com deployment
# This script helps prepare your repository for Render.com deployment

set -e

echo "======================================"
echo "FitForm Render.com Deployment Setup"
echo "======================================"
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "Error: git is not installed"
    exit 1
fi

# Check if we're in a git repository
if ! git rev-parse --is-inside-work-tree &> /dev/null; then
    echo "Error: Not in a git repository"
    exit 1
fi

echo "✓ Git repository detected"
echo ""

# Check if render.yaml exists
if [ ! -f "render.yaml" ]; then
    echo "Error: render.yaml not found in current directory"
    exit 1
fi

echo "✓ render.yaml found"
echo ""

# Check for required files
echo "Checking required files..."
required_files=(
    "backend/Dockerfile"
    "cv-service/Dockerfile"
    "web-app/Dockerfile"
    "web-app/docker-entrypoint.sh"
    "backend/src/index.js"
    "cv-service/src/app.py"
    "RENDER_DEPLOYMENT.md"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✓ $file"
    else
        echo "  ✗ $file (missing)"
        exit 1
    fi
done

echo ""
echo "======================================"
echo "Pre-deployment Checklist"
echo "======================================"
echo ""
echo "Before deploying to Render.com, ensure you have:"
echo ""
echo "[ ] Firebase project created"
echo "[ ] Firebase Authentication enabled (Email/Password)"
echo "[ ] Firestore database created"
echo "[ ] Firebase service account key generated"
echo "[ ] Firebase web app configuration (API keys)"
echo "[ ] Code committed to GitHub repository"
echo ""
echo "======================================"
echo "Next Steps"
echo "======================================"
echo ""
echo "1. Commit and push your code to GitHub:"
echo "   git add ."
echo "   git commit -m 'Add Render.com deployment configuration'"
echo "   git push origin main"
echo ""
echo "2. Go to https://dashboard.render.com/"
echo ""
echo "3. Click 'New' → 'Blueprint'"
echo ""
echo "4. Connect your GitHub repository"
echo ""
echo "5. Render will detect render.yaml and create services"
echo ""
echo "6. Configure environment variables in Render dashboard:"
echo ""
echo "   Backend Service (fitform-backend):"
echo "   - FIREBASE_SERVICE_ACCOUNT (your service account JSON)"
echo "   - CORS_ORIGINS (your web app URL)"
echo ""
echo "   Web App Service (fitform-web-app):"
echo "   - REACT_APP_FIREBASE_API_KEY"
echo "   - REACT_APP_FIREBASE_AUTH_DOMAIN"
echo "   - REACT_APP_FIREBASE_PROJECT_ID"
echo "   - REACT_APP_FIREBASE_STORAGE_BUCKET"
echo "   - REACT_APP_FIREBASE_MESSAGING_SENDER_ID"
echo "   - REACT_APP_FIREBASE_APP_ID"
echo ""
echo "7. Wait for deployment to complete"
echo ""
echo "8. Access your application:"
echo "   - Web App: https://fitform-web-app.onrender.com"
echo "   - Backend: https://fitform-backend.onrender.com"
echo "   - CV Service: https://fitform-cv-service.onrender.com"
echo ""
echo "For detailed instructions, see RENDER_DEPLOYMENT.md"
echo ""
echo "======================================"
echo "Setup verification complete! ✓"
echo "======================================"
