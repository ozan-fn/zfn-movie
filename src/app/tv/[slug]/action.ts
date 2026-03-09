"use server";

import axios from "axios";
import prisma from "@/lib/prisma";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_ACCESS_TOKEN = process.env.TMDB_ACCESS_TOKEN;
const DETAIL_CACHE_TTL = 24 * 60 * 60 * 1000; // Cache selama 24 Jam

/**
 * Helper: Mengambil ID angka dari ujung slug
 * Contoh: "war-machine-1265609" -> "1265609"
 */
function extractIdFromSlug(slug: string): string {
    const parts = slug.split("-");
    return parts[parts.length - 1];
}

/**
 * Fungsi Utama untuk Get Details
 */
async function getDetails(type: "movie" | "tv", slug: string) {
    if (!slug) return null;

    const tmdbId = extractIdFromSlug(slug);
    const cacheId = `${type}_${tmdbId}`;

    try {
        const cachedDetail = await prisma.detailCache.findUnique({
            where: { id: cacheId },
        });

        const isCacheValid = cachedDetail && Date.now() - new Date(cachedDetail.updatedAt).getTime() < DETAIL_CACHE_TTL;

        if (isCacheValid) {
            return JSON.parse(cachedDetail.data);
        }

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

        await prisma.detailCache.upsert({
            where: { id: cacheId },
            update: { data: JSON.stringify(data) },
            create: {
                id: cacheId,
                data: JSON.stringify(data),
            },
        });

        return data;
    } catch (error) {
        console.error(`Error fetching ${type} details for ID ${tmdbId}:`, error);

        const fallbackCache = await prisma.detailCache.findUnique({ where: { id: cacheId } });
        if (fallbackCache) {
            return JSON.parse(fallbackCache.data);
        }

        return null;
    }
}

export async function getMovieDetails(slug: string) {
    return await getDetails("tv", slug);
}

export async function getTvDetails(slug: string) {
    return await getDetails("tv", slug);
}
