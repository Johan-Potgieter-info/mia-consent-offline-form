
# Mia Healthcare PWA - Technical Specifications

**Application Owner:** Mia Healthcare  
**Developer:** Johan Potgieter  
**Application Type:** Progressive Web Application (PWA)

## Application Overview

The Mia Healthcare Dental Consent Form PWA is an offline-first web application designed to capture patient consent forms in dental practices. The application provides full functionality without internet connectivity and automatically syncs data when online.

## PWA Features

### Core PWA Capabilities
- **Installable**: Can be installed on desktop and mobile devices
- **Offline-First**: Full functionality without internet connection
- **App-Like Experience**: Runs in standalone mode without browser UI
- **Automatic Updates**: Self-updating with user notification
- **Push Notifications**: Ready for future implementation
- **Background Sync**: Automatic data synchronization

### Icon and Branding
- **Primary Icon**: Mia Healthcare logo (`/assets/mia-logo.png`)
- **Icon Sizes**: 192x192, 512x512 pixels (optimized for PWA requirements)
- **Maskable Icons**: Android adaptive icon support
- **Theme Color**: #ef4805 (Mia Healthcare orange)
- **Background Color**: #ffffff (white)

## Architecture

### Frontend Stack
```
React 18.3.1              - UI Framework
TypeScript                - Type Safety
Vite                      - Build Tool & Dev Server
Tailwind CSS 3            - Styling Framework
shadcn/ui                 - UI Component Library
React Router 6.26.2       - Client-side Routing
```

### State Management
```
TanStack Query 5.56.2     - Server State Management
React Hook Form 7.53.0    - Form State Management
Zustand (via hooks)       - Client State Management
```

### Storage & Database
```
Supabase 2.49.10          - Cloud Database (PostgreSQL)
IndexedDB (via idb 8.0.3) - Local Storage Fallback
Local Storage             - Settings & Preferences
```

### PWA Infrastructure
```
Service Worker            - Caching & Background Sync
Web App Manifest          - Installation & App Configuration
Workbox (built-in)        - PWA Utilities
```

## File Structure

```
/
├── public/
│   ├── sw.js                 # Service Worker
│   ├── manifest.json         # PWA Manifest
│   └── assets/               # Mia Healthcare Assets
├── src/
│   ├── components/           # React Components
│   ├── hooks/               # Custom React Hooks
│   ├── pages/               # Route Components
│   ├── utils/               # Utility Functions
│   └── types/               # TypeScript Definitions
└── dist/                    # Production Build Output
```

## Service Worker Configuration

### Caching Strategy
```javascript
Static Resources:         Cache-First
API Calls:               Network-First with Cache Fallback
HTML Pages:              Stale-While-Revalidate
Images:                  Cache-First with 1-year expiration
```

### Cache Names
- **Static Cache**: `mia-consent-cache-v8`
- **Runtime Cache**: `mia-runtime-v8`
- **Auto-versioning**: Prevents cache conflicts during updates

### Background Sync
- Form submissions queued when offline
- Automatic sync when connection restored
- User notification on sync completion

## Database Schema

### Local Storage (IndexedDB)
```typescript
interface DraftForm {
  id: string;
  formData: FormData;
  lastModified: Date;
  isComplete: boolean;
}

interface SyncQueue {
  id: string;
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: Date;
}
```

### Cloud Database (Supabase)
```sql
-- Completed forms table
CREATE TABLE consent_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name VARCHAR NOT NULL,
  form_data JSONB NOT NULL,
  region VARCHAR,
  submitted_at TIMESTAMP DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);
```

## Security Implementation

### Data Protection
- **Encryption in Transit**: HTTPS/TLS 1.3
- **Local Data**: Browser security sandbox
- **Cloud Storage**: Supabase Row Level Security
- **API Keys**: Environment variable protection

### Privacy Compliance
- **HIPAA Ready**: Secure data handling
- **GDPR Compliant**: User consent management
- **Data Retention**: Configurable policies
- **Audit Trail**: All actions logged

## Performance Specifications

### Loading Performance
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Total Blocking Time**: < 200ms
- **Cumulative Layout Shift**: < 0.1

### Bundle Optimization
```
Main Bundle:             ~150KB (gzipped)
Vendor Bundle:           ~200KB (gzipped)
CSS Bundle:              ~50KB (gzipped)
Total Initial Load:      ~400KB (gzipped)
```

### Runtime Performance
- **Memory Usage**: < 50MB typical
- **CPU Usage**: < 5% on modern devices
- **Storage Usage**: < 10MB (including cache)

## Browser Compatibility

### Minimum Requirements
```
Chrome:          90+ (2021)
Firefox:         88+ (2021)
Safari:          14+ (2020)
Edge:            90+ (2021)
iOS Safari:      14+ (iOS 14)
Chrome Android:  90+ (2021)
```

### PWA Support Matrix
```
Desktop Install:    Chrome, Edge, Safari 16.4+
Mobile Install:     All modern browsers
Background Sync:    Chrome, Edge, Firefox
Push Notifications: Chrome, Edge, Firefox, Safari 16+
```

## Mobile Application Support

### Capacitor Integration
- **iOS Support**: Native iOS app generation
- **Android Support**: Native Android app generation
- **Plugin Ecosystem**: Camera, filesystem, etc.
- **Hot Reload**: Development efficiency

### Mobile-Specific Features
- **Touch Optimized**: Gesture-friendly interface
- **Viewport Handling**: Safe area support
- **Keyboard Adaptation**: Input optimization
- **Offline Storage**: Full offline capability

## Deployment Requirements

### Server Requirements
```
Web Server:       Any static hosting (Nginx, Apache, CDN)
HTTPS:           Required (TLS 1.2+)
Compression:     Gzip/Brotli enabled
Cache Headers:   Proper cache control
MIME Types:      .json, .webmanifest support
```

### Environment Variables
```
VITE_SUPABASE_URL:      Cloud database URL
VITE_SUPABASE_ANON_KEY: Database access key
VITE_APP_ENV:          Environment identifier
VITE_APP_VERSION:      Application version
```

## Development Workflow

### Local Development
```bash
npm install           # Install dependencies
npm run dev          # Start dev server (localhost:8080)
npm run build        # Production build
npm run preview      # Preview production build
```

### Build Process
1. **TypeScript Compilation**: Type checking and transpilation
2. **Asset Optimization**: Image compression, CSS minification
3. **Bundle Splitting**: Vendor and app code separation
4. **Service Worker Generation**: Cache strategy implementation
5. **PWA Manifest Processing**: Icon generation and validation

## Quality Assurance

### Testing Strategy
- **Unit Tests**: Component and utility testing
- **Integration Tests**: User flow validation
- **PWA Tests**: Installation and offline testing
- **Performance Tests**: Lighthouse CI integration
- **Cross-browser Tests**: Compatibility validation

### Monitoring
- **Error Tracking**: Production error monitoring
- **Performance Monitoring**: Real user metrics
- **Usage Analytics**: Feature adoption tracking
- **PWA Metrics**: Installation and engagement rates

## Future Roadmap

### Planned Enhancements
- **Push Notifications**: Appointment reminders
- **Biometric Authentication**: Fingerprint/Face ID
- **Advanced Offline**: Partial sync capabilities
- **Multi-language**: Internationalization support
- **Advanced Analytics**: Detailed usage insights

## Asset Management

### Logo Specifications
- **File**: `/assets/mia-logo.png`
- **Format**: PNG (Portable Network Graphics)
- **Design**: Circular design with "mia" branding in white text
- **Background**: Orange-to-red gradient (#ef4805 theme)
- **Tagline**: "SMILES DELIVERED • LIVES TRANSFORMED"
- **Resolution**: High-resolution for crisp display across all devices
- **Usage**: PWA icons, favicons, app shortcuts, and branding

### Asset Path Structure
```
public/assets/                     # Web deployment assets
└── mia-logo.png                  # Primary logo file

android/app/src/main/assets/public/assets/  # Android app assets
└── mia-logo.png                  # Android-specific logo copy
```

### PWA Manifest Icons
- **Icon Sizes**: 192x192px and 512x512px
- **Purpose**: "any maskable" for Android adaptive icons
- **Environment Paths**:
  - Web: `/assets/mia-logo.png`
  - Android: `/mia-consent-offline-form/assets/mia-logo.png`

### Quality Assurance
- **PWA Validation**: Test with PWABuilder.com for manifest compliance
- **Cross-platform**: Verify icon display on desktop and mobile
- **Android Build**: Run `npx cap sync` to update native app assets
- **Asset Search**: Use `grep -r "lovable-uploads" .` to verify no legacy references

## Android Build (Codespaces) – Step 7.5.1

Objective: Install Android SDK CLI in Codespaces, verify Capacitor config, create android/local.properties, and build a release APK.

Prereqs already configured in this repo: Java 21 (via Gradle config), Gradle wrapper 8.9, AGP 8.7.2, compile/target SDK 35.

Commands (run from repo root):

```bash
# 1) Android SDK
export ANDROID_SDK_ROOT="$HOME/android-sdk"; export ANDROID_HOME="$ANDROID_SDK_ROOT"
mkdir -p "$ANDROID_SDK_ROOT/cmdline-tools"; cd /tmp
curl -L -o cmdline-tools.zip "https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip"
unzip -q cmdline-tools.zip
mkdir -p "$ANDROID_SDK_ROOT/cmdline-tools/latest"
mv cmdline-tools/* "$ANDROID_SDK_ROOT/cmdline-tools/latest/"
export PATH="$ANDROID_SDK_ROOT/cmdline-tools/latest/bin:$ANDROID_SDK_ROOT/platform-tools:$PATH"
yes | sdkmanager --licenses
sdkmanager "platform-tools" "platforms;android-35" "build-tools;35.0.0"

# 2) Create and verify local.properties (environment-specific)
cd /workspaces/mia-consent-offline-form
printf "sdk.dir=%s\n" "$ANDROID_SDK_ROOT" > android/local.properties
cat android/local.properties   # expect: sdk.dir=/home/codespace/android-sdk

# 3) Verify Capacitor config consistency BEFORE build
grep -E "appId|webDir" capacitor.config.ts  # expect appId: 'com.miahealthcare.consentform', webDir: 'dist'

# 4) Build APK
./scripts/build-android.sh
ls -l android/app/build/outputs/apk/release/app-release.apk || true

# 5) Post-build AndroidManifest checks
# (only change if needed)
grep -n "androidx.core.content.FileProvider" android/app/src/main/AndroidManifest.xml || true
grep -n "uses-permission.*INTERNET" android/app/src/main/AndroidManifest.xml || true
grep -n "usesCleartextTraffic" android/app/src/main/AndroidManifest.xml || echo "Note: usesCleartextTraffic not set (set to true in <application> only if you use HTTP endpoints)."
```

Testing on device/emulator (outside Codespaces):
- Physical/emulator: `adb install -r android/app/build/outputs/apk/release/app-release.apk`
- Or locally: `npx cap run android`
- Verify: splash + Mia logo, online Supabase insert, offline IndexedDB save → auto sync when online.

Git hygiene:
- Do NOT commit `android/local.properties` (environment-specific). Add `android/local.properties` to .gitignore in your fork if missing.

Troubleshooting:
- SDK not found: ensure `sdk.dir` path is correct and CLI tools are in PATH; re-run `./scripts/build-android.sh`.
- After pulling changes: always run `npx cap sync` to update native platforms.

---

**Technical Contact:** Johan Potgieter (Developer)  
**Last Updated:** August 2025  
**Version:** 1.0.0
