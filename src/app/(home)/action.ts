"use server";

import axios from "axios";
import prisma from "@/lib/prisma"; // Pastikan path prisma client sesuai

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_ACCESS_TOKEN = process.env.TMDB_ACCESS_TOKEN;
const CACHE_TTL = 60 * 60 * 1000; // 1 Jam dalam milidetik

/**
 * Fungsi Helper untuk Cache Management
 */
async function getOrFetchMovies(category: string, endpoint: string) {
    try {
        // 1. Cek data di DB berdasarkan kategori
        const cachedMovies = await prisma.movie.findMany({
            where: { category },
        });

        // 2. Cek apakah cache masih valid (di bawah 1 jam)
        const now = new Date();
        const isCacheValid = cachedMovies.length > 0 && now.getTime() - new Date(cachedMovies[0].updatedAt).getTime() < CACHE_TTL;

        if (isCacheValid) {
            return cachedMovies;
        }

        // 3. Jika expired atau kosong, fetch dari TMDB pakai Axios
        const response = await axios.get(`${TMDB_BASE_URL}${endpoint}`, {
            headers: {
                Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
                Accept: "application/json",
            },
        });

        const movies = response.data.results;

        // 4. Update Database: Gunakan upsert untuk setiap movie agar tidak terjadi error Unique Constraint (P2002)
        // Karena satu film bisa muncul di beberapa kategori (misal: "popular" dan "trending")
        // dan ID film di DB adalah Primary Key.
        await Promise.all(
            movies.map((m: any) =>
                prisma.movie.upsert({
                    where: {
                        id_category: {
                            id: m.id,
                            category: category,
                        },
                    },
                    update: {
                        title: m.title || m.name || "Untitled",
                        original_title: m.original_title || m.original_name || "",
                        overview: m.overview || "",
                        backdrop_path: m.backdrop_path,
                        poster_path: m.poster_path,
                        media_type: m.media_type || (category.includes("_tv") ? "tv" : "movie"),
                        original_language: m.original_language,
                        release_date: m.release_date || m.first_air_date || "",
                        popularity: m.popularity || 0,
                        vote_average: m.vote_average || 0,
                        vote_count: m.vote_count || 0,
                        adult: m.adult ?? false,
                        video: m.video ?? false,
                    },
                    create: {
                        id: m.id,
                        category: category,
                        title: m.title || m.name || "Untitled",
                        original_title: m.original_title || m.original_name || "",
                        overview: m.overview || "",
                        backdrop_path: m.backdrop_path,
                        poster_path: m.poster_path,
                        media_type: m.media_type || (category.includes("_tv") ? "tv" : "movie"),
                        original_language: m.original_language,
                        release_date: m.release_date || m.first_air_date || "",
                        popularity: m.popularity || 0,
                        vote_average: m.vote_average || 0,
                        vote_count: m.vote_count || 0,
                        adult: m.adult ?? false,
                        video: m.video ?? false,
                    },
                }),
            ),
        );

        return movies;
    } catch (error) {
        console.error(`Error fetching category ${category}:`, error);
        // Jika API gagal, coba kembalikan data lama saja daripada error total
        const fallbackData = await prisma.movie.findMany({ where: { category } });
        return fallbackData;
    }
}

/**
 * EXPORTED ACTIONS (MOVIE)
 */
export const getTrendingToday = async () => getOrFetchMovies("trending_today", "/trending/movie/day");
export const getTrendingWeek = async () => getOrFetchMovies("trending_week", "/trending/movie/week");
export const getPopularMovies = async () => getOrFetchMovies("popular", "/movie/popular");
export const getNowPlayingMovies = async () => getOrFetchMovies("now_playing", "/movie/now_playing");
export const getUpcomingMovies = async () => getOrFetchMovies("upcoming", "/movie/upcoming");
export const getTopRatedMovies = async () => getOrFetchMovies("top_rated", "/movie/top_rated");

/**
 * EXPORTED ACTIONS (TV)
 */
export const getTrendingTodayTV = async () => getOrFetchMovies("trending_today_tv", "/trending/tv/day");
export const getTrendingWeekTV = async () => getOrFetchMovies("trending_week_tv", "/trending/tv/week");
export const getPopularTV = async () => getOrFetchMovies("popular_tv", "/tv/popular");
export const getAiringTodayTV = async () => getOrFetchMovies("airing_today_tv", "/tv/airing_today");
export const getOnTheAirTV = async () => getOrFetchMovies("on_the_air_tv", "/tv/on_the_air");
export const getTopRatedTV = async () => getOrFetchMovies("top_rated_tv", "/tv/top_rated");
