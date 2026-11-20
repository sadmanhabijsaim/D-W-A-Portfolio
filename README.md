# Sadman Habij Saim Portfolio

A responsive portfolio website with a scroll-animated background, interactive sections, and an EmailJS-powered contact form.

## Run locally

```bash
npm install
npm run dev
```

Vite runs both the portfolio and the local `/api/toki` endpoint. Create `.env.local` from `.env.example`, fill `TOKI_FAQ_RESPONSES` with the private response configuration, then run `npm run dev` or `npm run preview`. Both commands load the ignored local value without exposing it in the browser bundle.

## Build and preview

```bash
npm run build
npm run preview
```

The production build is written to `dist/`.

## Toki FAQ

FAQ answer content is not embedded in `app.js`, the browser bundle, or the GitHub source. The `/api/toki` Vercel Function matches questions and reads answer content from the server-only `TOKI_FAQ_RESPONSES` environment variable.
The response configuration must include a `relationshipStatus` answer for questions about whether Sadman is single or married.

For local development, create `.env.local` from `.env.example` and add the private response configuration. `.env.local` is ignored by Git. In Vercel, add the `.env.local` variable under **Project Settings → Environment Variables** for Production and Preview, mark it as Secret, then redeploy. Do not use a `VITE_` prefix.

If the deployed chatbot says it is unavailable, confirm `TOKI_FAQ_RESPONSES` is set for the deployment's environment and redeploy. A missing or invalid value makes `/api/toki` return `503`; the function logs the configuration problem without logging the answer content.

The public chatbot only returns the specific detail asked for. Its endpoint is public, so visitors can still ask it for those answers; keeping them in environment variables hides them from the repository and browser source but does not restrict who can receive them.

## Deploy to Vercel

Import this repository into Vercel. The included `vercel.json` configures the Vite build and `dist` output directory. Vercel can also detect these settings automatically.

## Contact form

The contact form sends messages through EmailJS from the browser. The service ID, template ID, and public key are configured in `app.js`; keep the EmailJS public key restricted to the deployed site origin in the EmailJS dashboard. If sending fails, the form displays an error and visitors can email Sadman directly.
