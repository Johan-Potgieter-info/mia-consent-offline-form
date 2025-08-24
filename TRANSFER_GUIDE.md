# GitHub Repository Transfer Guide

## 🎯 Repository Transfer Instructions

This guide provides step-by-step instructions for transferring the Mia Healthcare Consent Form repository to the new owner's GitHub account.

## 📋 Pre-Transfer Checklist

Before initiating the transfer, ensure:

- [x] All Lovable references removed from codebase
- [x] Proper ownership attribution to Mia Healthcare Technologies
- [x] Developer credit to Johan Potgieter
- [x] Production-ready build tested
- [x] Documentation complete and accurate
- [x] Mobile app configuration verified
- [x] Database schema and migrations ready

## 🚀 Transfer Process

### Step 1: Prepare New GitHub Account

1. **Create or verify GitHub account** for Mia Healthcare Technologies
2. **Ensure account has appropriate plan** for private repositories (if needed)
3. **Set up organization** (recommended for business use):
   ```
   Organization Name: Mia Healthcare Technologies
   Billing: Set up as needed
   Members: Add relevant team members
   ```

### Step 2: Repository Transfer Options

#### Option A: Transfer Existing Repository (Recommended)
1. **Current repository owner** initiates transfer:
   - Go to repository Settings
   - Scroll to "Danger Zone"
   - Click "Transfer ownership"
   - Enter new owner's username/organization
   - Type repository name to confirm

2. **New owner accepts transfer**:
   - Check email for transfer notification
   - Click "Accept transfer"
   - Repository will appear in new account

#### Option B: Fork and Clone (Alternative)
1. **Fork repository** to new account
2. **Clone locally**:
   ```bash
   git clone [NEW-REPO-URL]
   cd mia-healthcare-consent-form
   ```
3. **Remove original remote** (if desired):
   ```bash
   git remote remove origin
   git remote add origin [NEW-REPO-URL]
   ```

### Step 3: Post-Transfer Configuration

#### 3.1 Repository Settings
```
Repository Name: mia-healthcare-consent-form
Description: Progressive Web Application for dental consent form capture - Mia Healthcare Technologies
Website: [YOUR-DEPLOYMENT-URL]
Topics: healthcare, dental, pwa, consent-form, offline
```

#### 3.2 Branch Protection (Recommended)
1. Go to Settings > Branches
2. Add rule for `main` branch:
   - Require pull request reviews
   - Require status checks
   - Include administrators

#### 3.3 GitHub Pages Setup (If using)
1. Go to Settings > Pages
2. Source: "Deploy from a branch"
3. Branch: `gh-pages`
4. Folder: `/ (root)`

#### 3.4 Environment Variables/Secrets
Set up repository secrets for deployment:
```
VITE_SUPABASE_PROJECT_ID
VITE_SUPABASE_PUBLISHABLE_KEY
VITE_SUPABASE_URL
```

## 🔧 Local Development Setup

### For New Team Members

1. **Clone repository**:
   ```bash
   git clone [NEW-REPO-URL]
   cd mia-healthcare-consent-form
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create environment file**:
   ```bash
   # Copy from .env.example or create new .env
   cp .env.example .env
   # Edit with actual values
   ```

4. **Start development**:
   ```bash
   npm run dev
   ```

## 📱 Mobile Development Transfer

### Update Mobile App Configuration

1. **Android configuration** (if needed):
   - Update package name in Android Studio
   - Regenerate signing keys
   - Update Google Play Console (if applicable)

2. **iOS configuration** (if needed):
   - Update bundle identifier in Xcode
   - Update Apple Developer account
   - Update App Store Connect (if applicable)

### Mobile Platform Setup
```bash
# After repository transfer
npm install
npm run build
npx cap sync

# For Android
npx cap add android
npx cap run android

# For iOS (macOS only)
npx cap add ios
npx cap run ios
```

## 🌐 Deployment Configuration

### GitHub Pages Deployment

1. **Automatic deployment** (recommended):
   ```bash
   npm run deploy
   ```

2. **Manual deployment**:
   ```bash
   npm run build
   # Upload dist/ folder to hosting provider
   ```

### Custom Domain Setup

1. **Add CNAME file** to `public/` directory:
   ```
   your-domain.com
   ```

2. **Configure DNS**:
   - Point domain to GitHub Pages
   - Set up HTTPS certificate

3. **Update base URL** in `vite.config.ts` if needed:
   ```typescript
   const basePath = isProduction ? '/' : '/';
   ```

## 🔒 Security Considerations

### Repository Security

1. **Enable security features**:
   - Dependency scanning
   - Secret scanning
   - Code scanning

2. **Review access permissions**:
   - Team member access levels
   - Collaborator permissions
   - Repository visibility

### Application Security

1. **Environment variables**:
   - Never commit sensitive data
   - Use GitHub secrets for deployment
   - Rotate keys if needed

2. **Database access**:
   - Review Supabase access policies
   - Update API keys if required
   - Test RLS policies

## 📊 Monitoring Setup

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### Application Monitoring

1. **Error tracking**: Console logs implemented
2. **Performance monitoring**: Build-time analytics
3. **Usage analytics**: PWA installation tracking

## 🆘 Troubleshooting

### Common Issues

1. **Transfer failed**:
   - Check GitHub permissions
   - Verify account limits
   - Contact GitHub support

2. **Build issues after transfer**:
   - Verify environment variables
   - Check Node.js version (18+ required)
   - Clear node_modules and reinstall

3. **Deployment problems**:
   - Check GitHub Pages settings
   - Verify base URL configuration
   - Review build output

### Support Contacts

**Technical Issues:**
Johan Potgieter - johan@code-solutions.co.za

**GitHub Issues:**
GitHub Support - https://support.github.com

## 📋 Transfer Completion Checklist

After completing the transfer:

- [ ] Repository transferred successfully
- [ ] Local development environment working
- [ ] Build process successful
- [ ] Deployment working (web/mobile)
- [ ] Environment variables configured
- [ ] Team members have access
- [ ] Documentation reviewed and updated
- [ ] Backup strategy in place
- [ ] Monitoring systems active
- [ ] Support contacts established

## 🎉 Next Steps

1. **Immediate (Day 1)**:
   - Verify repository access
   - Test local development
   - Deploy to staging/production

2. **Week 1**:
   - Team onboarding
   - Process documentation
   - User testing

3. **Month 1**:
   - Feature planning
   - Performance optimization
   - User feedback integration

---

**This transfer guide ensures a smooth transition of the Mia Healthcare Consent Form application to the new owner while maintaining all functionality and security measures.**

*For technical support during transfer, contact Johan Potgieter at johan@code-solutions.co.za*