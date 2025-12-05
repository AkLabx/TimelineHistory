
/**
 * Utility to resolve image paths robustly, handling Vite's BASE_URL
 * and preventing duplicate slashes.
 *
 * @param path - The path to the image relative to the base (e.g., "images/my-image.jpg")
 * @returns The full resolved path (e.g., "/TimelineHistory/images/my-image.jpg")
 */
export const getImagePath = (path: string | undefined): string => {
  if (!path) return '';

  // If path is already an absolute URL (http/https), return it as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Get BASE_URL from Vite env
  // We prioritize the Vite env variable, but if it's default '/' or missing,
  // and we are in a known deployment context, we might want to enforce the repo name.
  // However, normally Vite replaces this correctly.
  // If we are debugging an issue where BASE_URL is lost, we can fallback.
  let baseUrl = (import.meta as any).env.BASE_URL;

  // Fallback if undefined or empty
  if (!baseUrl) {
    baseUrl = '/TimelineHistory/';
  }

  // Ensure baseUrl ends with '/'
  if (!baseUrl.endsWith('/')) {
    baseUrl += '/';
  }

  // Remove leading slash from path if present to avoid double slash
  const safePath = path.startsWith('/') ? path.slice(1) : path;

  return `${baseUrl}${safePath}`;
};
