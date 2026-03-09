"use server";

import axios from "axios";
import prisma from "@/lib/prisma";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_ACCESS_TOKEN = process.env.TMDB_ACCESS_TOKEN;
const DETAIL_CACHE_TTL = 24 * 60 * 60 * 1000; // Cache selama 24 Jam

/**
 * Helper: Mengambil ID angka dari ujung slug
 */
function extractIdFromSlug(slug: string): string {
    const match = slug.match(/-(\d+)$/);
    return match ? match[1] : "";
}

/**
 * Fungsi Utama untuk Get Details (Meniru pola dari home/action.ts)
 */
async function getDetails(type: "movie" | "tv", slug: string) {
    if (!slug) return null;

    const idStr = extractIdFromSlug(slug);
    const tmdbId = parseInt(idStr);

    console.log(`[DetailAction] Fetching ${type} for slug: ${slug} -> ID: ${tmdbId}`);

    if (isNaN(tmdbId)) {
        console.error(`[DetailAction] Invalid ID extracted from slug: ${slug}`);
        return null;
    }

    const cacheId = `${type}_${tmdbId}`;

    try {
        // 1. Cek cache di Database (Table DetailCache)
        const cachedDetail = await prisma.detailCache.findUnique({
            where: { id: cacheId },
        });

        // 2. Cek validitas cache (24 jam)
        const isCacheValid = cachedDetail && Date.now() - new Date(cachedDetail.updatedAt).getTime() < DETAIL_CACHE_TTL;

        if (isCacheValid) {
            return JSON.parse(cachedDetail.data);
        }

        // 3. Jika expired atau tidak ada, fetch dari TMDB via Axios
        const response = await axios.get(`${TMDB_BASE_URL}/${type}/${tmdbId}`, {
            headers: {
                Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
                Accept: "application/json",
            },
            params: {
                append_to_response: "credits,videos,similar",
                language: "en-US",
            },
        });

        const data = response.data;

        // 4. Update/Upsert Cache di Database
        await prisma.detailCache.upsert({
            where: { id: cacheId },
            update: {
                data: JSON.stringify(data),
                updatedAt: new Date(), // Paksa update timestamp
            },
            create: {
                id: cacheId,
                data: JSON.stringify(data),
            },
        });

        return data;
    } catch (error) {
        console.error(`Error fetching detail ${type} for ID ${tmdbId}:`, error);

        // Jika API TMDB gagal (misal rate limit), kembalikan data lama dari cache jika ada
        const fallbackCache = await prisma.detailCache.findUnique({ where: { id: cacheId } });
        if (fallbackCache) {
            return JSON.parse(fallbackCache.data);
        }

        return null;
    }
}

export async function getMovieDetails(slug: string) {
    return await getDetails("movie", slug);
}

export async function getTvDetails(slug: string) {
    return await getDetails("tv", slug);
}
