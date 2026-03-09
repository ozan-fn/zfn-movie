"use client";

import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface TrailerDialogProps {
  trailerKey: string;
  title: string;
}

export function TrailerDialog({ trailerKey, title }: TrailerDialogProps) {
  return (
    <Dialog>
      <DialogTrigger
        className="inline-flex items-center justify-center rounded-full px-8 h-14 text-lg font-bold shadow-xl shadow-primary/20 bg-primary text-primary-foreground hover:scale-105 transition-transform"
        render={<button />}
      >
        <Play className="mr-2 h-6 w-6 fill-current" /> WATCH TRAILER
      </DialogTrigger>
      <DialogContent className="max-w-4xl p-0 overflow-hidden border-none bg-black/95">
        <DialogHeader className="p-4 bg-background/10 backdrop-blur-sm border-b border-white/10">
          <DialogTitle className="text-xl font-bold tracking-tight italic uppercase truncate pr-8">
            Trailer: {title}
          </DialogTitle>
        </DialogHeader>
        <div className="w-full">
          <AspectRatio ratio={16 / 9}>
            <iframe
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
              title={`${title} Trailer`}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </AspectRatio>
        </div>
      </DialogContent>
    </Dialog>
  );
}
