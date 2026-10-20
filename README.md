This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

The Engineering Lab gallery is available at `/connect`; project details are
available under `/engineering-lab/<project-slug>`. Testimonials, certifications,
and contact remain on the main portfolio page.

### Updating Engineering Lab projects

Edit `data/engineeringProjects.ts` to update project descriptions, technologies,
status, links, overview, features, dates, related projects, or teammates. Use
only verified project information; optional fields are hidden when omitted.

- Add cover art or a screenshot to `public/projects/<project-slug>/` and set
  `coverImage` in the matching project entry. Until then, the gallery uses
  original CSS artwork rather than presenting an illustration as a screenshot.
- Add larger detail-page imagery to `screenshots` with its `src`, descriptive
  `alt`, and optional caption. A `bannerImage` can be set separately.
- Add teammate photos to `public/team/`, then set each team member's `photo`,
  name, role, contribution, and any verified profile links in `team`.
- Add `githubUrl`, `liveDemoUrl`, or `demoVideoUrl` only when those destinations
  are ready; unavailable actions are not rendered.

## Google Sign-In for Testimonials

Copy `.env.example` to `.env.local` and set `GOOGLE_CLIENT_ID`,
`GOOGLE_CLIENT_SECRET`, and `NEXTAUTH_SECRET`. Create a Google OAuth client in
Google Cloud Console with `http://localhost:3000` as an authorized JavaScript
origin and `http://localhost:3000/api/auth/callback/google` as an authorized
redirect URI. For deployment, add the corresponding production URL and callback
URI, and set `NEXTAUTH_URL` to the deployed site URL.

Testimonials can only be submitted after signing in with Google. The author's
name and profile photo are taken from their Google account. Testimonials remain
stored in the submitting browser's local storage; they are not shared with other
visitors or devices.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
