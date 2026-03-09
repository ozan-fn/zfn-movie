import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Github, Globe, Linkedin, Mail, Film, Zap, Search, Smartphone, ShieldCheck, Heart } from "lucide-react";

export default function AboutPage() {
    return (
        <div className="container mx-auto p-4 md:p-8 space-y-16 max-w-5xl">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-primary/20 via-background to-muted p-8 md:p-16 border border-primary/10">
                <div className="relative z-10 text-center space-y-6">
                    <div className="flex justify-center">
                        <div className="p-4 bg-primary text-primary-foreground rounded-2xl shadow-xl shadow-primary/20 animate-bounce-slow">
                            <Film className="h-12 w-12" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter">
                            ZFN <span className="text-primary italic">MOVIE</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-muted-foreground font-medium max-w-2xl mx-auto">Reimagining the way you discover and enjoy cinematic masterpieces.</p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-3 pt-4">
                        <Badge variant="secondary" className="px-4 py-1.5 text-sm font-semibold rounded-full bg-background/50 backdrop-blur-sm border-primary/20">
                            Next.js 15
                        </Badge>
                        <Badge variant="secondary" className="px-4 py-1.5 text-sm font-semibold rounded-full bg-background/50 backdrop-blur-sm border-primary/20">
                            Prisma Edge
                        </Badge>
                        <Badge variant="secondary" className="px-4 py-1.5 text-sm font-semibold rounded-full bg-background/50 backdrop-blur-sm border-primary/20">
                            Tailwind V4
                        </Badge>
                        <Badge variant="secondary" className="px-4 py-1.5 text-sm font-semibold rounded-full bg-background/50 backdrop-blur-sm border-primary/20">
                            TMDB API
                        </Badge>
                    </div>
                </div>

                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
            </div>

            {/* Content Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                        <Heart className="h-3 w-3 fill-current" /> Our Story
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold leading-tight">Built for lovers of the big screen.</h2>
                    <p className="text-lg text-muted-foreground leading-relaxed">ZFN Movie was born from a passion for cinema and technology. We believe that finding your next favorite film shouldn't be a chore. Using high-performance data caching and a sleek, minimalist interface, we've created a platform that's as beautiful as it is functional.</p>
                </div>
                <div className="bg-muted/30 rounded-3xl p-8 border border-border/50">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <ShieldCheck className="text-primary" /> Technical Specs
                    </h2>
                    <ul className="space-y-4">
                        {[
                            { label: "Data Source", value: "TMDB API v3" },
                            { label: "Rendering", value: "Server-Side & Infinite Loading" },
                            { label: "Caching", value: "Prisma PostgreSQL Layer" },
                            { label: "Components", value: "Shadcn UI Library" },
                        ].map((spec, i) => (
                            <li key={i} className="flex justify-between items-center border-b border-border/50 pb-2">
                                <span className="text-muted-foreground font-medium">{spec.label}</span>
                                <span className="font-bold text-foreground">{spec.value}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                {[
                    { title: "Lightning Fast", desc: "Optimized with Prisma caching layers for instant content retrieval.", icon: <Zap className="h-8 w-8 text-yellow-500" /> },
                    { title: "Smart Search", desc: "Our intuitive engine finds the exact movie you're looking for.", icon: <Search className="h-8 w-8 text-blue-500" /> },
                    { title: "Design First", desc: "Every pixel is carefully placed to ensure a premium browsing experience.", icon: <Smartphone className="h-8 w-8 text-green-500" /> },
                ].map((feature, i) => (
                    <div key={i} className="group p-8 rounded-3xl bg-card hover:bg-muted/50 border border-border transition-all duration-300 hover:-translate-y-1">
                        <div className="mb-4 p-3 inline-block rounded-2xl bg-muted group-hover:bg-background transition-colors">{feature.icon}</div>
                        <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                    </div>
                ))}
            </div>

            {/* Contact / Footer */}
            <div className="pt-16 border-t border-border/50 text-center space-y-10">
                <div className="space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">Connect With Us</h2>
                    <p className="text-muted-foreground">Follow the project or get in touch for collaborations.</p>
                </div>
                <div className="flex justify-center gap-4">
                    {[
                        { icon: <Github />, label: "GitHub" },
                        { icon: <Linkedin />, label: "LinkedIn" },
                        { icon: <Globe />, label: "Portfolio" },
                        { icon: <Mail />, label: "Email" },
                    ].map((social, i) => (
                        <button key={i} className="p-4 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                            {social.icon}
                        </button>
                    ))}
                </div>
                <div className="space-y-4">
                    <p className="text-sm font-medium text-muted-foreground">&copy; {new Date().getFullYear()} ZFN Movie Dashboard. All Rights Reserved.</p>
                    <div className="flex justify-center gap-6 text-xs text-muted-foreground/60 uppercase tracking-widest font-bold font-mono">
                        <span>Clean Code</span>
                        <span>High Performance</span>
                        <span>User Centric</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
