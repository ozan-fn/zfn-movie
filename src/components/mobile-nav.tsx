"use client";

import Link from "next/link";
import { Home, Compass, Search, Info } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Compass, label: "Discover", href: "/discover" },
    { icon: Search, label: "Search", href: "/search" },
    { icon: Info, label: "About", href: "/about" },
];

export function MobileNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 z-50 flex h-16 w-full items-center justify-around border-t bg-background/95 backdrop-blur px-4 md:hidden">
            {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                    <Link key={item.label} href={item.href} className={cn("flex flex-col items-center justify-center space-y-1 py-1 transition-colors", isActive ? "text-primary" : "text-muted-foreground hover:text-foreground")}>
                        <item.icon className={cn("h-6 w-6", isActive && "fill-primary/20")} />
                        <span className="text-[10px] font-medium">{item.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
