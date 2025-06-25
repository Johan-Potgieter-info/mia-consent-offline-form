
// Helper function to get correct asset paths for both environments
export const getAssetPath = (path: string): string => {
  // Use Vite's BASE_URL which is set correctly based on the environment
  const basePath = import.meta.env.BASE_URL;
  
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  return `${basePath}${cleanPath}`;
};

// Specific helper for icon uploads
export const getIconPath = (): string => {
  return getAssetPath('icon-uploads/2741077b-1d2b-4fa2-9829-1d43a1a54427.png');
};
