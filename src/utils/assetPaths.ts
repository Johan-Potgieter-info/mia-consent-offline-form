
// Helper function to get correct asset paths for both environments
export const getAssetPath = (path: string): string => {
  // Use Vite's BASE_URL which is set correctly based on the environment
  const basePath = import.meta.env.BASE_URL;
  
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // In development (BASE_URL = '/'), return path with single leading slash
  // In production (BASE_URL = '/mia-consent-offline-form/'), return full path
  if (basePath === '/') {
    return `/${cleanPath}`;
  }
  
  return `${basePath}${cleanPath}`;
};

// Specific helper for icon uploads - handle both environments
export const getIconPath = (): string => {
  // In development, check if the file exists at the root level first
  const isDev = import.meta.env.DEV;
  if (isDev) {
    // Try the public folder path first for development
    return '/icon-uploads/2741077b-1d2b-4fa2-9829-1d43a1a54427.png';
  }
  
  return getAssetPath('icon-uploads/2741077b-1d2b-4fa2-9829-1d43a1a54427.png');
};
