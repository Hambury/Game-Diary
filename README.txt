Game Diary (installable version)

Files (keep them together in one folder):
  index.html            the app (your original, plus a few PWA lines)
  manifest.webmanifest  name/icon info so browsers offer "Install"
  sw.js                 lets the app work offline
  icons/                app icons

To try it:
  The app must be served from a web address (http://localhost or https://), not opened by double-clicking.
  Quick local test: in this folder run   python -m http.server 8000
  then open http://localhost:8000 in Chrome or Edge and click the Install icon in the address bar.

To publish for real use: upload the whole folder to GitHub Pages or Netlify (Netlify Drop lets you drag the folder in).

Your data stays in your browser on each device. Export from your old file, then Import here to bring it across.
