import { Hono } from "hono";
import { handle } from "hono/vercel"; // homo/netlify for hosting this app in Netlify

// If the app is going to be deployed into Cloudflare workers, this line is not required and even though Vercel Uses Cloudflare workers under the hood, But with this configuration, this app would be both compatible with Vercel and Cloudflare workers directly without any modifications
export const runtime = "edge";

const app = new Hono().basePath("/api");

app.get("/search", async (c) => {
    return c.json({ message: "Hello from Hono server"});
});

// Though this set up of the high-performance API does useregulat NextJS syntax, It can be made compactible with the basic NextJS syntax. This offers the performance benefits of deploying this to Cloudflare and also to Vercel without any modifications.
export const GET = handle(app);
export default app as never // Just to make the NextJS compiler happy, as it doesn't expect a default export from an API route, and will throw an error, `as never` bypasses that