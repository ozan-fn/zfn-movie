import { getMovieDetails } from "./action";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, Star, Play, Users, Film, ChevronRight, ChevronLeft } from "lucide-react";
import Image from "next/image";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { TrailerDialog } from "@/components/trailer-dialog";
import Link from "next/link";

export default async function MovieDetailPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ from?: string }> }) {
    const [{ slug }, { from }] = await Promise.all([params, searchParams]);
    const movie = await getMovieDetails(slug);
    const backHref = from === "movies" ? "/?type=movies" : "/";

    if (!movie) {
        return (
            <div className="flex h-[80vh] items-center justify-center text-center">
                <div className="space-y-4">
                    <h1 className="text-4xl font-bold">Movie not found</h1>
                    <p className="text-muted-foreground">The movie you are looking for does not exist or has been removed.</p>
                </div>
            </div>
        );
    }

    const year = movie.release_date?.split("-")[0] || "N/A";
    const runtime = movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : "N/A";
    const cast = movie.credits?.cast?.slice(0, 10) || [];
    const director = movie.credits?.crew?.find((person: any) => person.job === "Director")?.name || "Unknown";
    const trailer = movie.videos?.results?.find((video: any) => video.type === "Trailer" && video.site === "YouTube");

    return (
        <div className="relative min-h-screen">
            {/* Backdrop Section */}
            <div className="absolute inset-0 h-[70vh] w-full">
                <Image src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`} alt={movie.title} fill priority className="object-cover opacity-20 blur-sm" />
                <div className="absolute inset-0 bg-linear-to-t from-background via-background/80 to-transparent" />
            </div>

            <div className="relative container mx-auto px-4 py-12 md:py-20 lg:px-8">
                <Link href={backHref} className="inline-flex items-center gap-2 mb-8 text-sm font-bold text-muted-foreground hover:text-primary transition-colors group">
                    <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    BACK TO EXPLORE
                </Link>
                <div className="flex flex-col gap-12 lg:flex-row">
                    {/* Poster Sidebar */}
                    <div className="w-full shrink-0 lg:w-[350px]">
                        <div className="sticky top-24 overflow-hidden rounded-3xl shadow-2xl shadow-primary/10 border border-primary/10 ring-1 ring-white/10">
                            <AspectRatio ratio={2 / 3}>
                                <Image src={`https://image.tmdb.org/t/p/w780${movie.poster_path}`} alt={movie.title} fill className="object-cover" />
                            </AspectRatio>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 space-y-10">
                        <div className="space-y-6">
                            <div className="flex flex-wrap gap-2">
                                {movie.genres?.map((genre: any) => (
                                    <Badge key={genre.id} variant="secondary" className="bg-primary/10 text-primary border-none text-xs font-bold uppercase tracking-wider">
                                        {genre.name}
                                    </Badge>
                                ))}
                            </div>

                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-tight italic">{movie.title.toUpperCase()}</h1>

                            <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-muted-foreground italic">
                                <div className="flex items-center gap-2">
                                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                                    <span className="text-lg font-bold text-foreground">{movie.vote_average?.toFixed(1)}</span>
                                    <span>({movie.vote_count?.toLocaleString()} votes)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>{year}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    <span>{runtime}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            {trailer && <TrailerDialog trailerKey={trailer.key} title={movie.title} />}
                            <Button size="lg" variant="outline" className="rounded-full px-8 h-14 text-lg font-bold border-2 hover:bg-muted/50 transition-all">
                                ADD TO WATCHLIST
                            </Button>
                        </div>

                        <div className="space-y-4 max-w-3xl">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <Film className="text-primary h-6 w-6" /> OVERVIEW
                            </h2>
                            <p className="text-lg leading-relaxed text-muted-foreground italic">"{movie.overview}"</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold flex items-center gap-2">
                                    <Users className="text-primary h-6 w-6" /> TOP CAST
                                </h2>
                                <div className="grid grid-cols-2 gap-4">
                                    {cast.map((actor: any) => (
                                        <div key={actor.id} className="flex items-center gap-3 p-3 rounded-2xl bg-muted/30 border border-border/50">
                                            {actor.profile_path ? (
                                                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full ring-2 ring-primary/20">
                                                    <Image src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`} alt={actor.name} fill className="object-cover" />
                                                </div>
                                            ) : (
                                                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                                                    <Users className="h-6 w-6 text-muted-foreground" />
                                                </div>
                                            )}
                                            <div className="overflow-hidden">
                                                <p className="font-bold text-sm truncate">{actor.name}</p>
                                                <p className="text-xs text-muted-foreground truncate italic">{actor.character}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold">PRODUCTION INFO</h2>
                                <Card className="bg-muted/20 border-border/50 rounded-3xl overflow-hidden">
                                    <CardContent className="p-6 space-y-4">
                                        <div className="flex justify-between items-center py-2 border-b border-border/30">
                                            <span className="text-muted-foreground italic">Director</span>
                                            <span className="font-bold">{director}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-border/30">
                                            <span className="text-muted-foreground italic">Status</span>
                                            <span className="font-bold text-primary">{movie.status}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-border/30">
                                            <span className="text-muted-foreground italic">Budget</span>
                                            <span className="font-bold">${movie.budget?.toLocaleString() || "N/A"}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2">
                                            <span className="text-muted-foreground italic">Revenue</span>
                                            <span className="font-bold">${movie.revenue?.toLocaleString() || "N/A"}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
