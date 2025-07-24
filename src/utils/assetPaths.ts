
// Helper function to get correct asset paths for both environments
export const getAssetPath = (path: string): string => {
  // Use Vite's BASE_URL which is set correctly based on the environment
  const basePath = import.meta.env.BASE_URL;
  
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Ensure we always have a trailing slash on basePath for consistency
  const normalizedBasePath = basePath.endsWith('/') ? basePath : `${basePath}/`;
  
  return `${normalizedBasePath}${cleanPath}`;
};

// Specific helper for icon uploads - handle both environments
export const getIconPath = (): string => {
  return getAssetPath('lovable-uploads/9a0a9907-375b-48ce-a1bc-8009bc27059c.png');
};
