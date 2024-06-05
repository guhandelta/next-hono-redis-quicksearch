import { Redis } from "@upstash/redis/cloudflare";
import { Hono } from "hono";
import { env } from "hono/adapter";
import { handle } from "hono/vercel"; // homo/netlify for hosting this app in Netlify

// If the app is going to be deployed into Cloudflare workers, this line is not required and even though Vercel Uses Cloudflare workers under the hood, But with this configuration, this app would be both compatible with Vercel and Cloudflare workers directly without any modifications
export const runtime = "edge";

const app = new Hono().basePath("/api");

// IN regular NextJS app, the environment variables can be accessed anywhere through process.env.*, but that is not available or valid in CloudFlare worker runtime, as process.env.* is a NodeJS thing.
type ENVCONFIG = {
    UPSTASH_REDIS_REST_URL: string,
    UPSTASH_REDIS_REST_TOKEN: string
};

app.get("/search", async (c) => {
    try {
        // Accessing environment variables in Cloudflare and making it typesafe
        const { 
            UPSTASH_REDIS_REST_URL, 
            UPSTASH_REDIS_REST_TOKEN 
        } = env<ENVCONFIG>(c);

        const start = performance.now();

        // Instantiate a Redis instance to communicate with the Redis DB, inside of this API route
        const redis = new Redis({
            url: 'https://amusing-lemming-53777.upstash.io',
            token: 'AdIRAAIncDFlOTJiZTFmMWI3NGI0Zjc3OWZhNzkwMGY5ZjUxOTViOXAxNTM3Nzc'
        });

        // Getting access to the search query from the client/UI
        const query = c.req.query("q")?.toLocaleUpperCase(); // Query parameter that is sent from the client => http://.../api/search?q=coim

        if(!query){
            return c.json({ message: "No search query provided"}, { status: 400 });
        }

        const res = [];
        /* zrank gives the rank of the query in the sorted set, if it exists, else it returns null
        C - CO - COI - COIM - COIMB - COIMBA - COIMBAT - COIMBATO - COIMBATORE => COIMBATORE* | each item in the sorted set has a score and the rank is the position(how many-th item) of the item in the sorted set
        The Query is case sensitive, so the query is converted to uppercase, to make the search much easier, without worrying about the case of the query*/
        const rank = await redis.zrank("districts", query.toLocaleUpperCase());

        if(rank !== null || rank !== undefined){
            // zrange gives the items in the sorted set within the range of the rank and the rank+50 (i.e.) 100 items from the element at the current rank | Eg: when typing Coi, look in all the elements, in the next 100 elements from the element in the current rank to find the complete name COIMBATORE* with the *
            const temp = await redis.zrange<string[]>( "districts", Number(rank), rank!+100 ); // Returns a string array with all the possible combinations of the district name
            console.log("Temp:\t",temp);

            for(const el of temp){
                
                if(!el.startsWith(query)) break;
                
                // Send back the entire word without the *
                if(el.endsWith("*")) {
                    console.log("El:\t",el.substring(0, el.length - 1));
                    
                    res.push(el.substring(0, el.length - 1));
                }
                console.log("Res:\t",res);
                
            }
        }

        const end = performance.now();
        

        return c.json({ duration: end - start, results: res });
    } catch (error) {
        console.error("Error:\t",error);   

        return c.json({ message: "Something went wrong" }, { status: 500 });
    }
});

// Though this set up of the high-performance API does not use regular NextJS syntax, It can be made compactible with the basic NextJS syntax. This offers the performance benefits of deploying this to Cloudflare and also to Vercel without any modifications.
export const GET = handle(app);
export default app as never // Just to make the NextJS compiler happy, as it doesn't expect a default export from an API route, and will throw an error, `as never` bypasses that