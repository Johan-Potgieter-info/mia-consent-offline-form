
// Detect if running in Capacitor (mobile app)
const isCapacitor = window.location.protocol === 'app:' || 
                    (window.location.hostname === 'localhost' && !window.location.port);

// Helper function to get correct asset paths for both environments
export const getAssetPath = (path: string): string => {
  // For Capacitor/mobile apps, use relative paths from the public directory
  if (isCapacitor) {
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `./${cleanPath}`;
  }
  
  // For web deployment, use Vite's BASE_URL
  const basePath = import.meta.env.BASE_URL;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const normalizedBasePath = basePath.endsWith('/') ? basePath : `${basePath}/`;
  
  return `${normalizedBasePath}${cleanPath}`;
};

// Specific helper for Mia Healthcare logo - handle both environments
export const getIconPath = (): string => {
  return getAssetPath('assets/mia-logo.png');
};
