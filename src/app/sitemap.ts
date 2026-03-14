import { MetadataRoute } from "next";
import prisma from "@/lib/prisma";

const SITE_URL = "https://zfn-movie.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const movies = await prisma.movie.findMany({
        select: {
            id: true,
            title: true,
            overview: true,
            media_type: true,
            backdrop_path: true,
            poster_path: true,
            updatedAt: true,
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

    movies.forEach((movie) => {
        try {
            const type = movie.media_type || "movie";
            const title = movie.title;
            if (!title) return;

            const slugBase = title
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, "")
                .trim()
                .replace(/\s+/g, "-");
            const slug = `${slugBase}-${movie.id}`;
            const image = movie.backdrop_path ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}` : movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : undefined;

            // Halaman Detail
            entries.push({
                url: `${SITE_URL}/${type}/${slug}`,
                lastModified: movie.updatedAt,
                changeFrequency: "weekly",
                priority: 0.7,
                ...(image && { images: [image] }),
            });
        } catch (e) {
            // Skip
        }
    });

    return entries;
}
