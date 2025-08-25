# Mia Healthcare Consent Form PWA

A Progressive Web Application (PWA) for capturing dental consent forms with robust offline capabilities.

## 📋 Project Information

**Owner:** Mia Healthcare Technologies  
**Developer:** Johan Potgieter  
**Contact:** johan@live.co.za 
**Version:** 1.0.0  
**Status:** Production Ready  

## ✨ Features

- **Offline-First Design**: Works seamlessly without internet connection
- **Progressive Web App**: Installable on mobile devices and desktops
- **Region-Aware Forms**: Automatically detects and adapts to different practice regions
- **Secure Data Handling**: Client-side encryption and secure data transmission
- **Draft Management**: Auto-save functionality with draft recovery
- **Hybrid Storage**: Local IndexedDB with cloud sync to Supabase
- **Mobile Optimized**: Native mobile app capabilities via Capacitor
- **Background Sync**: Automatic data synchronization when connection returns

## 🛠 Technical Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query for server state
- **Local Storage**: IndexedDB for offline data persistence
- **Cloud Backend**: Supabase (authentication, database, real-time sync)
- **Mobile**: Capacitor for iOS/Android app deployment
- **Service Worker**: Custom implementation for offline functionality

## 🚀 Quick Start for New Owner

### Prerequisites

- Node.js 18+ and npm
- Git

### Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone [YOUR-REPO-URL]
   cd mia-healthcare-consent-form
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Configuration**:
   Create a `.env` file in the root directory:
   ```env
   VITE_BASE_URL="/"
   VITE_SUPABASE_PROJECT_ID="jofuqlexuxzamltxxzuq"
   VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvZnVxbGV4dXh6YW1sdHh4enVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMDA2NjAsImV4cCI6MjA2NDY3NjY2MH0.Fq_Sx7NUeZF2k-erwrj_V-2npReXum9Cmuufsco3Cmw"
   VITE_SUPABASE_URL="https://jofuqlexuxzamltxxzuq.supabase.co"
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

5. **Access the application**:
   Open [http://localhost:8080](http://localhost:8080) in your browser

## 📱 Mobile App Development

### Setup Mobile Development Environment

```bash
# Install mobile dependencies (already included)
npm install

# Build web app
npm run build

# Add mobile platforms
npx cap add android    # For Android
npx cap add ios        # For iOS (macOS only)

# Sync with platforms
npx cap sync
```

### Running on Mobile

```bash
# Android (requires Android Studio)
npx cap run android

# iOS (requires macOS with Xcode)
npx cap run ios
```

### Building for Production

```bash
# Android APK
./scripts/build-android.sh     # Linux/macOS
scripts\build-android.bat      # Windows

# iOS App (macOS only)
./scripts/build-ios.sh
```

## 🌐 Web Deployment

### GitHub Pages Deployment

1. **Update repository settings**:
   - Go to Settings > Pages
   - Select "Deploy from a branch"
   - Choose "gh-pages" branch

2. **Deploy**:
   ```bash
   npm run deploy
   ```

3. **Access deployed app**:
   Your app will be available at: `https://[USERNAME].github.io/mia-healthcare-consent-form`

### Custom Domain Setup

If you want to use a custom domain:

1. Add a `CNAME` file to the `public/` directory with your domain
2. Configure DNS settings to point to GitHub Pages
3. Update `vite.config.ts` base path if needed

## 🗄 Database Configuration

This application uses Supabase as the backend service. The current database includes:

- **Form submissions**: Encrypted patient data with regional support
- **Draft management**: Auto-saved form drafts
- **Real-time sync**: Automatic cloud synchronization
- **Row Level Security**: Implemented for data protection

### Database Schema

Key tables:
- `form_drafts`: Patient consent form data
- `form_submissions`: Finalized submissions
- `sync_logs`: Synchronization tracking

## 🔒 Security Features

- **Client-side encryption**: Sensitive data encrypted before storage
- **Input sanitization**: All user inputs sanitized against XSS
- **Row Level Security**: Supabase RLS policies implemented
- **Rate limiting**: Client-side rate limiting for API calls
- **Content Security Policy**: Secure headers implementation

## 📊 Monitoring & Analytics

- **Error tracking**: Console logging with error categorization
- **Performance monitoring**: Build-time analytics
- **Offline usage tracking**: Local storage metrics
- **Sync success rates**: Connection quality monitoring

## 🔧 Maintenance & Support

### Developer Contact

**Johan Potgieter**  
Email: johan@code-solutions.co.za  
Role: Lead Developer & Technical Architect  

Available for:
- Technical support and bug fixes
- Feature enhancements
- Database migrations
- Performance optimizations
- Security updates

### Troubleshooting

Common issues and solutions:

1. **Build failures**: Check Node.js version (18+ required)
2. **Mobile app issues**: Ensure Android Studio/Xcode properly configured
3. **Sync problems**: Verify Supabase environment variables
4. **Performance issues**: Clear IndexedDB and reinstall PWA

### Updating Dependencies

```bash
# Check for updates
npm outdated

# Update packages
npm update

# Update major versions (review breaking changes)
npm install package@latest
```

## 📄 License & Ownership

**© 2024 Mia Healthcare Technologies**  
All rights reserved.

This software is proprietary to Mia Healthcare Technologies. Unauthorized copying, modification, distribution, or use is strictly prohibited.

**Developer Attribution:**  
Developed by Johan Potgieter - Code Solutions

## 🔄 Version History

- **v1.0.0** (Current): Production release with full offline capabilities
  - Complete rebranding from Lovable to Mia Healthcare Technologies
  - Production-ready mobile app support
  - Enhanced security and encryption
  - Comprehensive documentation and handover materials

## 📞 Support & Contact

For technical support, feature requests, or any questions about this application:

**Primary Contact:**  
Johan Potgieter  
Developer & Technical Lead  
Email: johan@code-solutions.co.za  

**Business Contact:**  
Mia Healthcare Technologies  
[Add business contact information here]

---

*This application is ready for production use and has been thoroughly tested across multiple platforms and devices. All Lovable references have been removed and the codebase is optimized for transfer to the new owner.*