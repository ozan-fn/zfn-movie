import { MetadataRoute } from "next";
import prisma from "@/lib/prisma";

const SITE_URL = "https://zfn-movie.vercel.app";

export const revalidate = 3600;
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const cacheData = await prisma.detailCache.findMany({
        select: {
            id: true,
            updatedAt: true,
            data: true,
        },
    });

    const entries: MetadataRoute.Sitemap = [
        {
            url: SITE_URL,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 1,
        },
        {
            url: `${SITE_URL}/?type=movies`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.8,
        },
        {
            url: `${SITE_URL}/?type=tv`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.8,
        },
    ];

    cacheData.forEach((item) => {
        try {
            const detail = JSON.parse(item.data);
            const type = item.id.startsWith("movie_") ? "movie" : "tv";
            const title = detail.title || detail.name;
            if (!title) return;

            const slugBase = title
                .toLowerCase()
                .replace(/[^a-z0-0\s-]/g, "")
                .replace(/\s+/g, "-");
            const slug = `${slugBase}-${detail.id}`;
            const image = detail.backdrop_path ? `https://image.tmdb.org/t/p/w1280${detail.backdrop_path}` : `https://image.tmdb.org/t/p/w500${detail.poster_path}`;

            // Halaman Detail
            entries.push({
                url: `${SITE_URL}/${type}/${slug}`,
                lastModified: item.updatedAt,
                changeFrequency: "weekly",
                priority: 0.7,
            });

            // Halaman Watch
            entries.push({
                url: `${SITE_URL}/${type}/${slug}/watch`,
                lastModified: item.updatedAt,
                changeFrequency: "weekly",
                priority: 0.6,
            });
        } catch (e) {
            // Skip
        }
    });

    return entries;
}
