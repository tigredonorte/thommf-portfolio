/**
 * CloudFront Function for Single Page Application (SPA) Routing
 *
 * Purpose:
 * This function handles client-side routing for the React SPA by ensuring that:
 * 1. Static assets (CSS, JS, images, fonts) are served directly from their paths
 * 2. Client-side routes (paths without file extensions) are served the index.html file
 *
 * Why it's needed:
 * - SPAs use client-side routing where URLs like /projects or /about don't correspond to actual files
 * - Without this function, CloudFront would return 404 errors for these client-side routes
 * - The function rewrites requests for routes to serve index.html, allowing React Router to handle routing
 * - Static assets with file extensions are passed through unchanged to be served normally
 *
 * This ensures the portfolio site works correctly with:
 * - Direct URL access to any route (e.g., thomfilg.com/projects)
 * - Browser refresh on any route
 * - Proper loading of all CSS, JavaScript, and other static assets
 */
function handler(event) {
  const request = event.request;
  const uri = request.uri;

  // Check if the request is for a file with an extension (static asset)
  // Common static file extensions
  const staticExtensions = [
    '.js',
    '.css',
    '.html',
    '.json',
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
    '.svg',
    '.ico',
    '.woff',
    '.woff2',
    '.ttf',
    '.eot',
    '.map',
    '.txt',
    '.xml',
  ];

  // Check if URI has a file extension
  const hasExtension = staticExtensions.some(function (ext) {
    return uri.toLowerCase().endsWith(ext);
  });

  // If it has an extension, pass through as-is (let it 404 if not found)
  if (hasExtension) {
    return request;
  }

  // For paths without extensions (SPA routes), rewrite to index.html
  // but keep the original URI for client-side routing
  if (!hasExtension && !uri.endsWith('/')) {
    // This is likely a client-side route, serve index.html
    request.uri = '/index.html';
  }

  return request;
}
