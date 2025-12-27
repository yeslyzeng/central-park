import React from 'react';

interface UIOverlayProps {
  activeLayer: 'surface' | 'underground' | 'deep';
  setActiveLayer: (layer: 'surface' | 'underground' | 'deep') => void;
}

export const UIOverlay: React.FC<UIOverlayProps> = ({ activeLayer, setActiveLayer }) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 z-10">
      {/* Header */}
      <header className="flex flex-col items-start pointer-events-auto">
        <h1 className="text-6xl font-black tracking-tighter text-slate-900 leading-none">
          NYC <span className="text-red-500">UNFOLD</span>
        </h1>
        <p className="mt-2 text-sm font-medium text-slate-500 max-w-xs leading-relaxed">
          Explore the hidden layers of Manhattan's urban fabric. From skyscrapers to bedrock.
        </p>
      </header>

      {/* Layer Controls */}
      <div className="flex flex-col gap-2 pointer-events-auto self-end mb-12">
        <LayerButton 
          label="SURFACE" 
          isActive={activeLayer === 'surface'} 
          onClick={() => setActiveLayer('surface')}
          color="bg-slate-900"
        />
        <LayerButton 
          label="UNDERGROUND" 
          isActive={activeLayer === 'underground'} 
          onClick={() => setActiveLayer('underground')}
          color="bg-blue-600"
        />
        <LayerButton 
          label="DEEP INFRA" 
          isActive={activeLayer === 'deep'} 
          onClick={() => setActiveLayer('deep')}
          color="bg-orange-500"
        />
      </div>

      {/* Footer / Legend */}
      <div className="absolute bottom-8 left-8 pointer-events-auto">
         <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <span>Lat: 40.7829° N</span>
            <span>Long: 73.9654° W</span>
         </div>
      </div>
    </div>
  );
};

const LayerButton = ({ label, isActive, onClick, color }: { label: string, isActive: boolean, onClick: () => void, color: string }) => (
  <button
    onClick={onClick}
    className={`
      relative flex items-center justify-between w-64 px-6 py-4 
      transition-all duration-300 ease-out border-2
      ${isActive ? 'border-transparent shadow-xl translate-x-[-10px]' : 'border-slate-200 bg-white hover:border-slate-300'}
      ${isActive ? color : ''}
    `}
  >
    <span className={`text-sm font-bold tracking-widest ${isActive ? 'text-white' : 'text-slate-400'}`}>
      {label}
    </span>
    
    {/* Indicator Dot */}
    <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-white' : 'bg-slate-200'}`} />
  </button>
);
