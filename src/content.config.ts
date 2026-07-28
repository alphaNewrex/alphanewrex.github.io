import { z, defineCollection } from "astro:content";
import { glob } from "astro/loaders";

const blogCollection = defineCollection({
    loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
    schema: z.object({
        title: z.string(),
        description: z.string(),
        pubDate: z.coerce.date(),
        updatedDate: z.string().optional(),
        heroImage: z.string().optional(),
        badge: z.string().optional(),
        tags: z.array(z.string()).refine(items => new Set(items).size === items.length, {
            message: 'tags must be unique',
        }).optional(),
    }),
});

const storeCollection = defineCollection({
    loader: glob({ pattern: "**/*.md", base: "./src/content/store" }),
    schema: z.object({
        title: z.string(),
        description: z.string(),
        custom_link_label: z.string(),
        custom_link: z.string().optional(),
        updatedDate: z.coerce.date(),
        pricing: z.string().optional(),
        oldPricing: z.string().optional(),
        badge: z.string().optional(),
        checkoutUrl: z.string().optional(),
        heroImage: z.string().optional(),
    }),
});

export type BlogSchema = z.infer<typeof blogCollection.schema>;
export type StoreSchema = z.infer<typeof storeCollection.schema>;

export const collections = {
    'blog': blogCollection,
    'store': storeCollection
}
