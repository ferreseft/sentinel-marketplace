# Sentinel Security Marketplace - Netlify Deployment

This repository is optimized for direct, one-click deployment to **Netlify** with a serverless backend and a responsive React frontend.

## Repo Structure

- **`public/`**: Contains static assets, including `index.html`, which holds the fully-wired client-side React UI.
- **`netlify/functions/`**: Serverless functions running on Node.js using `better-sqlite3` for rapid testing.
- **`netlify.toml`**: Router configuration. It forwards all `/api/*` calls directly to Netlify serverless functions.

## Database Note (Stateless Testing)

Netlify Functions are ephemeral and stateless, meaning SQLite databases running inside them do not persist modifications across cold starts. To solve this for testing, the functions use a Shared Helper (`db-helper.js`) that **automatically seeds the database on cold start** in the `/tmp` directory with our 4 security personnel profiles, 1 customer, 1 request, and initial matches.

*To scale for production, swap `better-sqlite3` for a serverless cloud database like **Turso**, **PlanetScale**, **Supabase**, or **CockroachDB`.*
