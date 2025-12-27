import Scene from "@/components/Scene";
import { UIOverlay } from "@/components/UIOverlay";
import { Suspense, useState } from "react";

export default function Home() {
  const [activeLayer, setActiveLayer] = useState<'surface' | 'underground' | 'deep'>('surface');

  return (
    <div className="relative h-screen w-full overflow-hidden bg-slate-50">
      <UIOverlay activeLayer={activeLayer} setActiveLayer={setActiveLayer} />
      
      <Suspense fallback={<div className="absolute inset-0 flex items-center justify-center text-slate-400 font-mono text-sm">INITIALIZING MAP DATA...</div>}>
        <Scene activeLayer={activeLayer} />
      </Suspense>
    </div>
  );
}
