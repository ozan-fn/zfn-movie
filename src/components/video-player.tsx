"use client";

import { useState, useEffect } from "react";
import { PlayersProps } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Play, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoPlayerProps {
    players: PlayersProps[];
    title: string;
}

export function VideoPlayer({ players, title }: VideoPlayerProps) {
    const [activePlayer, setActivePlayer] = useState(players[0]);
    const [isLoading, setIsLoading] = useState(false);

    // Reset to the first player when players array changes (e.g., episode change)
    useEffect(() => {
        setIsLoading(true);
        setActivePlayer(players[0]);
        // Small delay to ensure iframe re-renders properly
        const timer = setTimeout(() => setIsLoading(false), 500);
        return () => clearTimeout(timer);
    }, [players]);

    return (
        <div className="space-y-6">
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-2xl ring-1 ring-white/10 flex items-center justify-center">
                {isLoading ? (
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        <span className="text-sm font-bold italic uppercase tracking-widest animate-pulse text-muted-foreground">Initializing Player...</span>
                    </div>
                ) : (
                    <iframe
                        key={activePlayer.source} // Key forces iframe refresh
                        src={activePlayer.source}
                        className="h-full w-full"
                        allowFullScreen
                        allow="autoplay; encrypted-media"
                    />
                )}
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold italic uppercase tracking-tight">
                        Select Server <span className="text-primary italic">— {activePlayer.title}</span>
                    </h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {players.map((player) => (
                        <button
                            key={player.title}
                            onClick={() => setActivePlayer(player)}
                            className={cn("flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-black italic transition-all duration-300 border uppercase tracking-wider", activePlayer.title === player.title ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105" : "bg-muted/50 text-muted-foreground border-border/50 hover:bg-muted hover:text-foreground")}
                        >
                            <Play className={cn("h-3 w-3", activePlayer.title === player.title ? "fill-current" : "")} />
                            {player.title}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
