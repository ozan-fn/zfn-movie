"use client";

import { Home, Compass, Search, Info } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import NextLink from "next/link";

const navItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Compass, label: "Discover", href: "/discover" },
    { icon: Search, label: "Search", href: "/search" },
    { icon: Info, label: "About", href: "/about" },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-16 z-40 hidden h-[calc(100vh-4rem)] w-20 flex-col border-r bg-background/50 backdrop-blur-xl md:flex">
            <div className="flex flex-1 flex-col items-center justify-center space-y-6 py-4">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

                    return (
                        <Tooltip key={item.label}>
                            <TooltipTrigger className={cn("relative flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300 group", isActive ? "bg-primary text-primary-foreground shadow-xl shadow-primary/20 scale-110" : "text-muted-foreground hover:bg-muted hover:text-foreground hover:scale-105")} render={<NextLink href={item.href} />}>
                                <item.icon className={cn("h-6 w-6 transition-transform group-hover:scale-110")} />

                                {isActive && <div className="absolute -left-1 h-6 w-1 rounded-r-full bg-primary" />}

                                <span className="sr-only">{item.label}</span>
                            </TooltipTrigger>
                            <TooltipContent side="right" sideOffset={15} className="font-bold bg-primary text-primary-foreground border-none">
                                <p>{item.label.toUpperCase()}</p>
                            </TooltipContent>
                        </Tooltip>
                    );
                })}
            </div>

            {/* Simple gradient glow at bottom */}
            <div className="p-4 flex flex-col items-center">
                <div className="h-[2px] w-8 rounded-full bg-linear-to-r from-transparent via-primary/20 to-transparent" />
            </div>
        </aside>
    );
}
