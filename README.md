# The Good Batch Bakery

A lightweight starter website for a bakery with:

- Menu browsing
- Cart-based ordering flow
- Checkout form that stores submitted orders in `localStorage`
- Customer reviews with ratings, also stored in `localStorage`

## Run locally

Because this is a static site, you can run any local server from the project root.

```bash
python3 -m http.server 4173
```

Then open <http://localhost:4173>.

## Deploy the site

This project is fully static (`index.html`, `styles.css`, `script.js`), so you can deploy it on any static host.

> Note: orders and reviews are saved in each visitor's browser `localStorage`. That means data is **not shared** across users and will not appear in an admin dashboard unless you add a backend API/database later.

### Option 1: Netlify (fastest)

1. Push this repository to GitHub.
2. In Netlify, click **Add new site → Import an existing project**.
3. Select the repository.
4. Build settings:
   - **Build command:** *(leave empty)*
   - **Publish directory:** `.`
5. Click **Deploy site**.

### Option 2: Vercel

1. Push this repository to GitHub.
2. In Vercel, click **Add New → Project** and import the repo.
3. Framework preset: **Other**.
4. Build settings:
   - **Build command:** *(leave empty)*
   - **Output directory:** `.`
5. Deploy.

### Option 3: GitHub Pages

1. Push repo to GitHub.
2. In your GitHub repo, open **Settings → Pages**.
3. Under **Build and deployment**, set:
   - **Source:** Deploy from a branch
   - **Branch:** `main` (or your default), folder `/root`
4. Save, then wait for the Pages URL to appear.

### Option 4: Any static web server / VPS

Upload `index.html`, `styles.css`, and `script.js` to your web root (for example, `/var/www/html`) and serve with Nginx/Apache/Caddy.

## Next step for production ordering/reviews

To make orders and reviews real (shared across users):

- Add a backend API (Node/Express, Django, Rails, etc.)
- Store data in a database (PostgreSQL, MySQL, etc.)
- Replace `localStorage` writes in `script.js` with API calls
