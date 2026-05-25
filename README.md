# entrahomes-01
Rental operation system (rentra OS)

## Deploying to Vercel

This project is a Vite + React SPA.

1. Import the repository in Vercel.
2. Keep the defaults (Framework Preset: **Vite**, Build command: `npm run build`, Output directory: `dist`).
3. Deploy.

If you see `404: NOT_FOUND` with `DEPLOYMENT_NOT_FOUND`, the URL does not currently point to an active deployment. In Vercel:

- Open your project
- Go to **Deployments**
- Open the latest successful deployment
- Use that deployment URL (or promote it to production)

SPA route fallback is configured in `vercel.json`.
