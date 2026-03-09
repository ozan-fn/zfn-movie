import { getDiscoverMovies } from "./action";
import DiscoverClient from "./discover-client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Film, Tv } from "lucide-react";

export default async function DiscoverPage() {
    // Initial fetch for both movies and tv shows
    const [movieData, tvData] = await Promise.all([getDiscoverMovies(1, "movie"), getDiscoverMovies(1, "tv")]);

    return (
        <main className="container mx-auto py-10 px-4 space-y-8 min-h-screen">
            <div className="space-y-4">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">Discover Content</h1>
                <p className="text-xl text-muted-foreground italic">Explore thousands of movies and TV shows and find your next favorite binge.</p>
            </div>

            <Tabs defaultValue="movie" className="w-full space-y-8">
                <TabsList className="grid w-full max-w-md grid-cols-2 p-1 bg-muted/30 backdrop-blur-sm border border-white/5 shadow-2xl rounded-xl ring-1 ring-white/10">
                    <TabsTrigger value="movie" className="flex items-center gap-2 py-2.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-300">
                        <Film className="w-4 h-4" />
                        Movies
                    </TabsTrigger>
                    <TabsTrigger value="tv" className="flex items-center gap-2 py-2.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-300">
                        <Tv className="w-4 h-4" />
                        TV Shows
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="movie" className="mt-0 focus-visible:outline-none focus:outline-none animate-in fade-in-0 duration-500">
                    <DiscoverClient initialMovies={movieData.results} initialNextPage={movieData.nextPage} type="movie" />
                </TabsContent>

                <TabsContent value="tv" className="mt-0 focus-visible:outline-none focus:outline-none animate-in fade-in-0 duration-500">
                    <DiscoverClient initialMovies={tvData.results} initialNextPage={tvData.nextPage} type="tv" />
                </TabsContent>
            </Tabs>
        </main>
    );
}
