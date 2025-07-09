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

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Troubleshooting

### "WebSocket connection to 'ws://localhost:8098/' failed"
If you open the application with the React Developer Tools browser extension active, the extension tries to connect to a local debugging server on port 8098. In production such a server is not running, so the console reports a failed WebSocket connection. This warning is harmless and does not affect the widget.

### Data refresh frequency
The widget fetches data from `/api/month` every 15 seconds. Computed burn and earn rates are updated once per second to provide a smooth display. Network requests should therefore occur every 15 seconds.

### Automated cron job
Burn rate samples are stored server-side by a Vercel cron job. The job calls `/api/cron` every minute with the `CRON_SECRET` value in the `Authorization` header. Set the same secret in your project environment so the endpoint can authenticate the request.
