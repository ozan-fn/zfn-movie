import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Link from "next/link";

export function MovieCard({ movie }: { movie: any }) {
    const poster = movie.poster_path || movie.posterPath;
    const releaseDate = movie.release_date || movie.first_air_date || movie.releaseDate;
    const voteAverage = movie.vote_average || movie.voteAverage || 0;
    const title = movie.title || movie.name || "Untitled";

    // Determine media type for detail link
    const isTV = !!movie.name || !!movie.first_air_date || movie.media_type === "tv" || movie.category?.includes("tv");

    // Generate fallback slug if not provided
    const slug =
        movie.slug ||
        `${title
            .toLowerCase()
            .replace(/[^\w ]+/g, "")
            .replace(/ +/g, "-")}-${movie.id}`;

    return (
        <Link href={isTV ? `/tv/${slug}?from=tv` : `/movie/${slug}?from=movies`}>
            <Card className="overflow-hidden border-none bg-transparent group cursor-pointer transition-all hover:scale-105 duration-300">
                <CardContent className="p-0">
                    <div className="relative overflow-hidden rounded-2xl bg-muted aspect-2/3 ring-1 ring-white/5 shadow-2xl shadow-black/20">
                        <AspectRatio ratio={2 / 3}>{poster ? <Image src={`https://image.tmdb.org/t/p/w500${poster}`} alt={title} fill className="object-cover transition-transform duration-500 group-hover:scale-110" /> : <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs p-4 text-center italic">No Poster Available</div>}</AspectRatio>
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                            <Badge variant="secondary" className="bg-primary text-primary-foreground backdrop-blur-md border-none shadow-xl font-black italic">
                                ★ {Number(voteAverage).toFixed(1)}
                            </Badge>
                        </div>
                    </div>
                    <div className="mt-4 space-y-1 px-1">
                        <h3 className="font-black text-sm line-clamp-1 group-hover:text-primary transition-colors text-foreground italic uppercase tracking-tight">{title}</h3>
                        <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest italic">{releaseDate ? new Date(releaseDate).getFullYear() : "N/A"}</p>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
