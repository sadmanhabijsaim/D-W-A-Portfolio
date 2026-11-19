# Sadman Habij Saim Portfolio

A responsive portfolio website with a scroll-animated background, interactive sections, and an EmailJS-powered contact form.

## Run locally

```bash
npm install
npm run dev
```

The Vite server runs the portfolio UI. To test the family FAQ API locally, create `.env.local` from `.env.example`, fill its values, then run `npx vercel dev`.

## Build and preview

```bash
npm run build
npm run preview
```

The production build is written to `dist/`.

## Toki family FAQ

Family facts are not stored in `app.js` or sent in the browser bundle. The `/api/toki` Vercel Function reads them from these server-only environment variables:

- `TOKI_FAMILY_FATHER_BN` and `TOKI_FAMILY_FATHER_EN`
- `TOKI_FAMILY_MOTHER_BN` and `TOKI_FAMILY_MOTHER_EN`
- `TOKI_FAMILY_SISTER_COUNT_BN` and `TOKI_FAMILY_SISTER_COUNT_EN`
- `TOKI_FAMILY_SISTER_MARITAL_STATUS_BN` and `TOKI_FAMILY_SISTER_MARITAL_STATUS_EN`

Set them in Vercel under **Project Settings → Environment Variables** for each deployment environment. For local testing, copy `.env.example` to `.env.local` and fill in the values there; `.env.local` is ignored by Git. Do not use a `VITE_` prefix for these values.

The public chatbot returns only the specific family detail asked for; broad questions prompt the visitor to be more specific. Because anyone can use a public chatbot, these facts are still available to anyone who asks. Environment variables hide them from the repository and browser source, but do not make the answers access-controlled.

## Deploy to Vercel

Import this repository into Vercel. The included `vercel.json` configures the Vite build and `dist` output directory. Vercel can also detect these settings automatically.

## Contact form

The contact form sends messages through EmailJS from the browser. The service ID, template ID, and public key are configured in `app.js`; keep the EmailJS public key restricted to the deployed site origin in the EmailJS dashboard. If sending fails, the form displays an error and visitors can email Sadman directly.
