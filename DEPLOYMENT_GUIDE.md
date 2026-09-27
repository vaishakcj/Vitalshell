# VitalShell - Deployment Package

## Option 1: Deploy Pre-built Static Files (Fastest - No build needed)
The pre-built production files are in `dist/`.
You can upload the contents of `dist/` directly to:
- **Netlify**: Drag & drop the `dist/` folder into Netlify Drop (app.netlify.com/drop)
- **Vercel**: Import and set output directory to `dist`
- **Cloudflare Pages**: Direct upload `dist/`
- **GitHub Pages**: Push `dist/` contents to `gh-pages` branch
- **Apache / NGINX / Caddy**: Copy contents of `dist/` into `/var/www/html`
- **Firebase Hosting / AWS S3**: Deploy `dist/`

## Option 2: Build & Deploy from Source Code
Requirements: Node.js 18+ or 20+

1. Install dependencies:
   ```bash
   npm install
   ```

2. (Optional) Configure environment variables:
   Copy `.env.example` to `.env` if you want to connect Supabase:
   ```bash
   cp .env.example .env
   ```

3. Run locally in development mode:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```
   The production files will be output to `dist/`.
