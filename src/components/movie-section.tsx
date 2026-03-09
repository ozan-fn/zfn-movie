"use client";

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { MovieCard } from "./movie-card";

interface Movie {
    id: number;
    title: string;
    poster_path: string;
    vote_average: number;
    release_date: string;
}

interface MovieSectionProps {
    title: string;
    movies: Movie[];
}

export function MovieSection({ title, movies }: MovieSectionProps) {
    if (!movies || movies.length === 0) return null;

    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
            </div>
            <Carousel
                opts={{
                    align: "start",
                    loop: false,
                }}
                className="w-full"
            >
                <CarouselContent className="-ml-2 md:-ml-4">
                    {movies.map((movie) => (
                        <CarouselItem key={movie.id} className="pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6">
                            <MovieCard movie={movie} />
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="hidden md:flex" />
                <CarouselNext className="hidden md:flex" />
            </Carousel>
        </section>
    );
}
