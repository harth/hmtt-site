# HMTT Ltd website

Static site on Firebase Hosting. Services and engagements live in Firestore and can be edited in the browser after signing in with Google.

```
firebase.json            Hosting + Firestore config
firestore.rules          Public read; writes only for the listed Google accounts
public/
  index.html
  css/styles.css
  js/app.js              Rendering, admin editor
  js/content.js          Default services & engagements (from the CV)
  js/firebase-config.js  ← paste your Firebase web config here
  img/                   Logo, favicon, portrait
```

## Run locally

```bash
cd public && python3 -m http.server 8080
```
With no Firebase config the site shows the default content from `content.js`.

## Set up Firebase (once)

1. **Create a project** at https://console.firebase.google.com and put its ID in `.firebaserc`.
2. **Add a web app** (Project settings → Your apps → `</>`). Copy the config object into `public/js/firebase-config.js`.
3. **Firestore**: Build → Firestore Database → Create database (production mode, `europe-west2` London).
4. **Google sign-in**: Build → Authentication → Sign-in method → enable **Google**.
   Then Authentication → Settings → **Authorised domains** → add `hmtt.co.uk` and `www.hmtt.co.uk`.
5. **Editors**: the allowed Google accounts are listed in *both* `firestore.rules` and `firebase-config.js`. Edit both if you change them.
6. Deploy:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase deploy
   ```

## First sign-in

1. Open the site, click **Admin** in the footer, sign in with Google.
2. Click **Publish default content** in the bar at the bottom. This copies the services and engagements into Firestore.
3. Each card now has **Edit / ↑ / ↓ / Delete**, and each section has an **Add** button. New engagements go to the top of the timeline; leave *End* blank to mark it as current (it then also appears in the "hmtt status" card in the hero).

## Pointing hmtt.co.uk at Firebase

Hosting → **Add custom domain** → `hmtt.co.uk` (and `www.hmtt.co.uk`, redirecting to the apex). Firebase gives you the A/TXT records to add at your DNS provider. SSL is issued automatically once DNS resolves. Keep the old host live until Firebase shows the domain as *Connected*.

## Notes

- The Toolkit and About sections are plain HTML in `index.html`.
- Security comes from `firestore.rules`; the admin list in the JS only controls whether edit buttons appear.
- All content is inserted as text (never HTML), so anything typed in the editor can't inject markup.
