# Yaojia Zeng — Film & Narrative

A film, screenwriting and interactive-narrative portfolio with a spatial gallery, a work index and an About page. Personal projects and cinema references are separate collections.

Current website: https://yaojia-zeng-film-portfolio.grandbrook16.chatgpt.site

## What this repository contains

- Complete website source, styling and spatial interactions.
- Owner project and profile editors, video uploads and cover uploads.
- English descriptions for the cinema-reference collection and credited film stills.
- Database schema and migrations.
- `data/portfolio-content-export.json`: a snapshot of the latest project edits and uploaded-file metadata.

The existing website remains the running service. Committing source to this repository does not replace or erase its database or uploaded files. Video and cover uploads live outside Git, and the content export includes their metadata rather than their binary files.

## Run locally

Use Node.js 22.13 or later and the pnpm version declared in `package.json`.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Copy `.env.example` to `.env` and fill in the values for your environment. Local previews have their own database and file storage; they do not load the production uploads automatically. See `docs/development-reference.md` for local migrations and the existing runtime contract.

## Build

```sh
pnpm build
```

This produces a server application for Cloudflare Workers. It uses D1 for project information and R2 for media, with the existing Sites service providing authenticated owner identity.

## Hosting

GitHub stores and versions the source. The current complete application also needs a server, a database, file storage and owner authentication. A static GitHub Pages deployment cannot run the upload and editing endpoints.

Keep the existing website and its storage when using this repository as a source backup. To move the running application to a different host, transfer the exported content and the actual uploaded media, configure D1/R2 or equivalent services, and supply trusted authentication. The current identity headers are injected by Sites; an independent host must not accept those headers as proof of identity from public requests.

Do not commit `.env`, credentials, local runtime directories or upload-session data. `.env.example` contains placeholders only.

## Important files

- `components/portfolio.tsx`: pages, project details and the owner editors.
- `components/spatial-gallery.tsx`: spatial browsing and focus interactions.
- `lib/cinema-data.ts`: cinema-reference descriptions.
- `lib/portfolio-store.ts`: persistent project/profile reads and editor authorization.
- `app/api/`: uploads, media delivery and content saving.
- `public/images/`: bundled covers and credited cinema stills.
- `data/portfolio-content-export.json`: latest live-content metadata snapshot.

Film image credits and source links are kept in `lib/cinema-sources.ts`.
