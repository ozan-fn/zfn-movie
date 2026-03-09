"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { MovieCard } from "@/components/movie-card";
import { searchMovies } from "./action";
import { Skeleton } from "@/components/ui/skeleton";
import { useInView } from "react-intersection-observer";
import { Search, Film, Tv } from "lucide-react";
import { SearchInput } from "./search-input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SearchClient() {
    const searchParams = useSearchParams();
    const query = searchParams.get("q") || "";

    const [type, setType] = useState<"movie" | "tv">("movie");
    const [movies, setMovies] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const { ref, inView } = useInView({
        threshold: 0,
        rootMargin: "200px",
    });

    const fetchResults = useCallback(
        async (pageNum: number, isNewQuery: boolean = false, currentType: "movie" | "tv" = type) => {
            if (!query) return;

            setLoading(true);
            const result = await searchMovies(query, pageNum, currentType);

            if (isNewQuery) {
                setMovies(result.results);
            } else {
                setMovies((prev) => [...prev, ...result.results]);
            }

            const hasMoreItems = result.nextPage !== null;
            setHasMore(hasMoreItems);
            setLoading(false);
        },
        [query, type],
    );

    // Effect for query or type change
    useEffect(() => {
        setPage(1);
        setHasMore(true);
        setMovies([]); // Clear results immediately on type/query change
        fetchResults(1, true, type);
    }, [query, type, fetchResults]);

    // Effect for infinite scroll
    useEffect(() => {
        if (inView && hasMore && !loading) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchResults(nextPage, false, type);
        }
    }, [inView, hasMore, loading, page, fetchResults, type]);

    const handleTypeChange = (newType: string) => {
        setType(newType as "movie" | "tv");
    };

    return (
        <div className="p-4 md:p-8 space-y-12 max-w-7xl mx-auto">
            <div className="relative overflow-hidden rounded-3xl bg-muted/30 p-8 md:p-12 border border-border">
                <div className="space-y-8 relative z-10 flex flex-col items-center text-center">
                    <div className="space-y-4">
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight">
                            {query ? (
                                <>
                                    Results for <span className="text-primary italic">"{query}"</span>
                                </>
                            ) : (
                                "Search Movies & TV"
                            )}
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">{query ? "Explore the matching titles from our extensive database. Scroll down to see more results." : "Explore thousands of movies and TV shows with a single keyword. Discover details, ratings, and more."}</p>
                    </div>

                    <div className="w-full">
                        <SearchInput />
                    </div>

                    {query && (
                        <div className="w-full max-w-md mx-auto pt-4">
                            <Tabs value={type} onValueChange={handleTypeChange} className="w-full">
                                <TabsList className="grid w-full grid-cols-2 p-1 bg-background/50 backdrop-blur-sm border border-border/50 rounded-xl">
                                    <TabsTrigger value="movie" className="flex items-center gap-2 py-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300">
                                        <Film className="w-4 h-4" />
                                        Movies
                                    </TabsTrigger>
                                    <TabsTrigger value="tv" className="flex items-center gap-2 py-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300">
                                        <Tv className="w-4 h-4" />
                                        TV Shows
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>
                    )}
                </div>
                {/* Background decorative blob */}
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
            </div>

            {movies.length === 0 && !loading && query && (
                <div className="flex flex-col items-center justify-center py-32 text-center space-y-4">
                    <div className="p-6 bg-muted rounded-full">
                        <Search className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                        <p className="text-2xl font-bold">No results found</p>
                        <p className="text-muted-foreground max-w-xs mx-auto">
                            We couldn't find any {type === "movie" ? "movies" : "TV shows"} matching "{query}". Try checking for typos or use broader terms.
                        </p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {movies.map((movie, index) => (
                    <MovieCard key={`${movie.id}-${index}`} movie={movie} />
                ))}

                {loading &&
                    Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="space-y-4 animate-pulse">
                            <div className="aspect-[2/3] w-full rounded-2xl bg-muted" />
                            <div className="space-y-2">
                                <div className="h-4 w-3/4 bg-muted rounded" />
                                <div className="h-4 w-1/2 bg-muted rounded" />
                            </div>
                        </div>
                    ))}
            </div>

            {hasMore && query && !loading && movies.length > 0 && (
                <div ref={ref} className="h-20 flex items-center justify-center pt-8">
                    <div className="flex gap-1">
                        <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                </div>
            )}
        </div>
    );
}
