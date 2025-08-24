#!/bin/bash
# scripts/test-build-package.sh
# Test, build, and package mia-consent-offline-form for web PWA and Android APK

set -e # Exit on any error

echo "Starting test, build, and package process for mia-consent-offline-form..."

# Step 1: Backup repository
echo "Creating repository backup..."
BACKUP_FILE="mia-consent-offline-form-backup-$(date +%F-%H%M%S).tar.gz"
git archive --format=tar.gz main -o "../$BACKUP_FILE"
echo "Backup created: ../$BACKUP_FILE"

# Step 2: Check for residual Lovable references
echo "Checking for residual Lovable references..."
if grep -r "lovable" --exclude="*.md" --exclude="*.sh" .; then
    echo "Warning: Found residual Lovable references. Please review."
else
    echo "No residual Lovable references found."
fi

# Step 3: Install dependencies
echo "Installing dependencies..."
npm install

# Step 4: Build web PWA
echo "Building web PWA..."
npm run build
if [ $? -ne 0 ]; then
    echo "Error: Web build failed."
    exit 1
fi

# Step 5: Test web PWA locally
echo "Testing web PWA locally..."
npm install -g serve
serve -s dist > /dev/null 2>&1 &
SERVE_PID=$!
sleep 5 # Wait for server to start
echo "Checking if app loads at http://localhost:3000..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
    echo "Web app loaded successfully."
else
    echo "Error: Web app failed to load."
    kill $SERVE_PID
    exit 1
fi
kill $SERVE_PID

# Step 6: Validate PWA manifest
echo "Validating PWA manifest..."
MANIFEST_URL="http://localhost:3000/manifest.json"
serve -s dist > /dev/null 2>&1 &
SERVE_PID=$!
sleep 5
if curl -s $MANIFEST_URL | grep -q '"src": "/assets/mia-logo.png"'; then
    echo "PWA manifest validated: Contains correct icon path."
else
    echo "Error: PWA manifest validation failed."
    kill $SERVE_PID
    exit 1
fi
kill $SERVE_PID

# Step 7: Test form submission (manual verification required)
echo "Please manually test form submission:"
echo "- Visit http://localhost:3000, submit a form (online), and verify insertion in Supabase (consent_forms/form_drafts)."
echo "- Toggle network offline (DevTools > Network > Offline), submit a form, and verify IndexedDB storage."
echo "Press Enter to continue after manual testing..."
read

# Step 8: Sync and build Android app
echo "Syncing and building Android app..."
npx cap sync android
if [ $? -ne 0 ]; then
    echo "Error: Android sync failed."
    exit 1
fi
if [ -f "scripts/build-android.sh" ]; then
    ./scripts/build-android.sh
    if [ -f "android/app/build/outputs/apk/release/app-release.apk" ]; then
        echo "Android APK created: android/app/build/outputs/apk/release/app-release.apk"
    else
        echo "Error: Android APK build failed."
        exit 1
    fi
else
    echo "Warning: scripts/build-android.sh not found. Skipping Android build."
fi

# Step 9: Prepare for GitHub Pages deployment
echo "Preparing for GitHub Pages deployment..."
git add .
git commit -m "Complete Phase 2 rebranding and prepare for deployment" || echo "No changes to commit."
echo "Ready to push to GitHub. Run 'git push origin main:main' manually after verifying."

echo "Test, build, and package process completed successfully!"
