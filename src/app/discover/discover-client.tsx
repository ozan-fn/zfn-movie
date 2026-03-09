"use client";

import { useEffect, useState, useRef } from "react";
import { getDiscoverMovies } from "./action";
import { MovieCard } from "@/components/movie-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useInView } from "react-intersection-observer";

interface DiscoverClientProps {
    initialMovies: any[];
    initialNextPage: number | null;
    type: "movie" | "tv";
}

export default function DiscoverClient({ initialMovies, initialNextPage, type }: DiscoverClientProps) {
    const [movies, setMovies] = useState<any[]>(initialMovies);
    const [page, setPage] = useState(initialNextPage || 1);
    const [loading, setLoading] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(!!initialNextPage);

    const { ref, inView } = useInView();

    const fetchNextPage = async () => {
        if (loading || !hasNextPage) return;

        setLoading(true);
        const data = await getDiscoverMovies(page, type);

        if (data.results.length > 0) {
            setMovies((prev) => [...prev, ...data.results]);
            setPage(data.nextPage || page);
            setHasNextPage(!!data.nextPage);
        } else {
            setHasNextPage(false);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (inView) {
            fetchNextPage();
        }
    }, [inView]);

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {movies.map((movie, index) => (
                    <MovieCard key={`${movie.id}-${index}`} movie={movie} />
                ))}
            </div>

            {/* Pagination / Infinite Scroll Trigger */}
            <div ref={ref} className="flex justify-center py-10">
                {loading && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 w-full">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} className="space-y-3">
                                <Skeleton className="aspect-[2/3] w-full rounded-xl" />
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-1/2" />
                            </div>
                        ))}
                    </div>
                )}
                {!hasNextPage && movies.length > 0 && <p className="text-muted-foreground">You've reached the end.</p>}
            </div>
        </div>
    );
}
