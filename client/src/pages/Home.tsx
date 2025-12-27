import Scene from "@/components/Scene";
import { Button } from "@/components/ui/button";
import { ArrowRight, CloudSnow, Snowflake } from "lucide-react";
import { Suspense } from "react";

export default function Home() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden font-sans text-foreground selection:bg-primary/30">
      {/* 3D Scene Background */}
      <Suspense fallback={<div className="absolute inset-0 bg-gray-200 animate-pulse" />}>
        <Scene />
      </Suspense>

      {/* Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-6 md:px-12">
        <div className="flex items-center gap-2 glass-panel px-4 py-2 rounded-full">
          <CloudSnow className="w-5 h-5 text-primary" />
          <span className="font-heading font-semibold tracking-wide text-sm">Central Park AI</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-8 glass-panel px-8 py-2 rounded-full text-sm font-medium">
          <a href="#" className="hover:text-primary transition-colors">About</a>
          <a href="#" className="hover:text-primary transition-colors">Writing</a>
          <a href="#" className="hover:text-primary transition-colors">Careers</a>
        </nav>

        <Button variant="default" className="rounded-full px-6 shadow-lg hover:shadow-xl transition-all duration-300 bg-primary text-primary-foreground hover:bg-primary/90">
          Get Cofounder <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </header>

      {/* Main Content Overlay */}
      <main className="relative z-10 flex flex-col justify-center min-h-screen px-6 md:px-12 pointer-events-none">
        <div className="container mx-auto">
          
          {/* Hero Text */}
          <div className="text-center mb-24 pointer-events-auto">
            <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white text-shadow-md mb-6 opacity-0 animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-forwards">
              The General Intelligence <br />
              <span className="italic font-light">Company Of New York</span>
            </h1>
          </div>

          {/* Glass Card */}
          <div className="max-w-xl mx-auto md:mx-0 glass-panel p-8 md:p-10 rounded-3xl pointer-events-auto opacity-0 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300 fill-mode-forwards">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <Snowflake className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="font-heading text-3xl font-bold text-white mb-2">
                  AI that runs businesses <br />
                  <span className="text-primary-foreground/80">autonomously</span>
                </h2>
              </div>
            </div>
            
            <p className="text-lg text-white/90 leading-relaxed mb-8 font-light">
              The General Intelligence Company is an applied AI lab working towards automating businesses full-stack with AI. We build systems that think, plan, and execute.
            </p>

            <div className="flex items-center gap-4">
              <Button variant="secondary" className="rounded-full px-6 py-6 text-base font-medium bg-white/90 hover:bg-white text-slate-900 shadow-sm hover:shadow-md transition-all">
                Get to know us <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>

        </div>
      </main>

      {/* Footer / Status */}
      <div className="fixed bottom-6 right-6 z-50 glass-panel px-4 py-2 rounded-full text-xs font-medium text-white/80 flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
        11:09 AM NYC
      </div>
    </div>
  );
}
