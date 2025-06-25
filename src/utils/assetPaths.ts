
// Helper function to get correct asset paths for both environments
export const getAssetPath = (path: string): string => {
  const isDev = import.meta.env.DEV;
  const isPreview = window.location.hostname.includes('lovable.app') || window.location.hostname.includes('lovableproject.com');
  
  // Only use the GitHub Pages base path in actual production builds
  const basePath = (!isDev && !isPreview) ? '/mia-consent-offline-form/' : '/';
  
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  return `${basePath}${cleanPath}`;
};

// Specific helper for icon uploads
export const getIconPath = (): string => {
  return getAssetPath('icon-uploads/2741077b-1d2b-4fa2-9829-1d43a1a54427.png');
};
