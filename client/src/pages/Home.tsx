import Scene from "@/components/Scene";
import { Suspense } from "react";

export default function Home() {
  return (
    <div className="relative h-screen w-full overflow-hidden bg-slate-900">
      <Suspense fallback={<div className="absolute inset-0 flex items-center justify-center text-white">Loading 3D World...</div>}>
        <Scene />
      </Suspense>
    </div>
  );
}
