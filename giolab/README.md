# GiOLab Virtual Laboratory

## Run locally

From the repository root, install the app dependencies and start the development server:

```powershell
npm install --prefix giolab
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173`). To create a production build, run `npm run build`.

The React app and its simulation source are in `giolab/src/`. The original `giolab_virtual_laboratory.tsx` path remains as a re-export for compatibility.

## GitHub Pages

The GitHub Actions workflow builds and deploys `giolab/dist` whenever changes are pushed to `main`. In the repository's **Settings > Pages**, set the build and deployment source to **GitHub Actions**. The published site is at `https://gvrevillac.github.io/virtual-labs/`.
