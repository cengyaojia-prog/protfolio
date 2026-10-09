# Yaojia Zeng — Film & Narrative

Source code for a three-page film, screenplay and creative-research portfolio: Space, Index and About. Own work and cinema references are presented as separate collections.

Current website: https://yaojia-zeng-film-portfolio.grandbrook16.chatgpt.site

## Included

- Full application source, styling and spatial gallery interactions.
- Owner-only project editing, uploads and profile management.
- English cinema descriptions, bundled cover images and film credits.
- Database schema and migrations.
- `data/portfolio-public-content.json`: current portfolio text for 11 works and the personal introduction, excluding contact addresses, private links, upload names and storage records.

The live website and its uploaded media remain in their existing storage. Committing this source does not overwrite or remove the owner's live changes. Uploaded video and cover file bytes are not included in this repository.

## Run locally

Use Node 22.13 or newer and the pnpm version declared in `package.json`.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Copy `.env.example` to a local `.env` and supply your own settings. Local storage is separate from the live website. See `docs/development-reference.md` for the development setup and authentication contract.

## Build

```sh
pnpm build
```

This is a Cloudflare Worker application with D1 database, R2 file storage and Sites authentication.

## Hosting

GitHub hosts this source repository. The current running website also needs its server, database, media storage and trusted owner authentication. GitHub Pages is static hosting and cannot run this application's upload and editing endpoints.

Keep the current hosted website for the full existing experience. An independent deployment requires provisioned storage, transferred media, restored data and trusted authentication. Never trust client-supplied `oai-authenticated-user-*` headers on a publicly accessible independent deployment.

Contact information is blank in the public source defaults and may be configured privately through the site's profile editor. No credentials, local environment files, contact-email export, upload sessions or live storage records are included.

## Main files

- `components/portfolio.tsx`: pages and owner editors.
- `components/spatial-gallery.tsx`: gallery layout and interactions.
- `lib/cinema-data.ts`: English cinema descriptions.
- `lib/portfolio-store.ts` and `app/api/`: database, media and editing endpoints.
- `data/portfolio-public-content.json`: current public-facing portfolio text.
- `lib/cinema-sources.ts`: cinema image credits.
