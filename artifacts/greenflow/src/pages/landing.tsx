import { Link } from "wouter";
import { Leaf, Zap, Car, Train, Wallet, MapPin, ArrowRight, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background dark text-foreground flex flex-col">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
            <Leaf className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <span className="font-bold text-lg leading-tight tracking-tight">GreenFlow</span>
            <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold ml-2">Gauteng MaaS</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/sign-in">
            <Button variant="ghost" size="sm">Sign In</Button>
          </Link>
          <Link href="/sign-up">
            <Button size="sm">Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="relative max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
            <Shield className="w-3.5 h-3.5" />
            NCIC 2026 — Inclusive Innovation for Clean Public Transport
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
            Inclusive Mobility.<br />
            <span className="text-primary">Sustainable Future.</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-xl mx-auto">
            Gauteng's inclusive Mobility-as-a-Service platform for all. Empowering communities with clean transport solutions, carbon tracking, and equitable access to sustainable mobility for youth, entrepreneurs, and underserved populations.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/sign-up">
              <Button size="lg" className="gap-2 w-full sm:w-auto">
                Join the Platform <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-20 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            icon: Car,
            title: "Virtual Taxi Pooling",
            desc: "Three or more commuters on the same route automatically form a virtual taxi — reducing cost and emissions in real time.",
            color: "text-primary bg-primary/10",
          },
          {
            icon: Zap,
            title: "Load-Shedding Routing",
            desc: "Routes actively avoid dead traffic lights and closed facilities during Eskom load shedding, with live stage alerts.",
            color: "text-yellow-500 bg-yellow-500/10",
          },
          {
            icon: Leaf,
            title: "CO₂ Carbon Ledger",
            desc: "Every trip earns CO₂ savings recorded on your personal ledger. Compare modes and climb the Green Commuter Leaderboard.",
            color: "text-green-500 bg-green-500/10",
          },
          {
            icon: Wallet,
            title: "Green Wallet",
            desc: "Earn Green Credits for every sustainable trip. Your wallet is POPIA-compliant with full consent control and masked identity.",
            color: "text-blue-500 bg-blue-500/10",
          },
          {
            icon: Train,
            title: "Gautrain Integration",
            desc: "Real-time Gautrain departure boards integrated into route planning across all 10 stations and Metrobus connections.",
            color: "text-purple-500 bg-purple-500/10",
          },
          {
            icon: Shield,
            title: "Inclusive Design",
            desc: "Multi-language support (English, Afrikaans, Zulu) and accessible UI ensuring all Gautengers can participate in clean transport innovation.",
            color: "text-indigo-500 bg-indigo-500/10",
          },
        ].map((f) => (
          <div key={f.title} className="rounded-xl border bg-card p-6 space-y-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${f.color}`}>
              <f.icon className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-base">{f.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Inclusivity Section */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl font-bold">Inclusive Innovation for All Gautengers</h2>
          <p className="text-lg text-muted-foreground">
            Building equitable access to clean public transport through community-driven technology
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Community Empowerment
            </h3>
            <p className="text-muted-foreground">
              Designed with input from Gauteng's diverse communities, including youth, women entrepreneurs, and underserved neighborhoods. Features like virtual taxi pooling reduce costs for low-income commuters while creating opportunities for local drivers.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Leaf className="w-5 h-5 text-green-500" />
              Environmental Justice
            </h3>
            <p className="text-muted-foreground">
              Addresses environmental racism by prioritizing clean transport access in historically polluted areas. Carbon tracking empowers individuals to make sustainable choices while building community resilience against climate impacts.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Youth Innovation
            </h3>
            <p className="text-muted-foreground">
              Open-source platform encouraging young developers and entrepreneurs to contribute. Hackathons and innovation challenges build skills while creating new green jobs in Gauteng's digital economy.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Wallet className="w-5 h-5 text-blue-500" />
              Economic Inclusion
            </h3>
            <p className="text-muted-foreground">
              Green wallet system creates micro-economies around sustainable transport. Credits earned through eco-friendly trips can be redeemed for services, supporting local businesses and circular economies.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6 px-6 flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5" /> POPIA Compliant · GreenFlow Beta v0.1.0
        </span>
        <div className="text-center">
          <div>NCIC 2026 Submission — Gauteng Provincial Challenge</div>
          <div className="text-muted-foreground/70">Inclusive Innovation for Clean Public Transport</div>
        </div>
        <span>Gauteng, South Africa</span>
      </footer>
    </div>
  );
}
