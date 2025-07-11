# Nginx Configuration for Micro-Frontend Testing

This directory contains nginx configuration files for testing the production micro-frontend setup locally.

## Files

### `nginx.conf`
Main nginx configuration file that:
- Limits worker processes to 2 (for cleaner test logs)
- Sets up basic nginx settings for development/testing
- Includes standard logging and MIME type handling

### `default.conf`
Server configuration for the micro-frontend application:
- **Root location (`/`)**: Serves the container app with SPA routing support
- **Micro-frontend locations (`/headerMfe/`, `/projectListMfe/`)**: Serves individual micro-frontends
- **Remote entry handling**: Special caching and CORS headers for `remoteEntry.js` files
- **Health check**: Simple health endpoint at `/health`

## Caching Strategy

| Resource Type | Cache Control | Purpose |
|---------------|---------------|---------|
| Container app files | `no-cache` | Always fetch latest for testing |
| Micro-frontend assets | `max-age=31536000` | Cache static assets for 1 year |
| `remoteEntry.js` files | `no-cache` | Always fetch latest module federation entries |

## CORS Configuration

Remote entry files include CORS headers to support module federation:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type`

## Usage

These files are automatically used by the Docker test environment:

```bash
# Start test environment
npm run test:prod:start

# Access the application
open http://localhost:8080
```

## Directory Structure in Container

```
/usr/share/nginx/html/
├── index.html              # Container app
├── main.*.js               # Container app bundles
├── headerMfe/
│   ├── remoteEntry.js      # Header micro-frontend entry
│   └── *.js                # Header micro-frontend assets
└── projectListMfe/
    ├── remoteEntry.js      # Project list micro-frontend entry
    └── *.js                # Project list micro-frontend assets
```

This mirrors the exact structure that will be deployed to S3.
