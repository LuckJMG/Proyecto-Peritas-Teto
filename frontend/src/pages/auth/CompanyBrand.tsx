import teto from '@/assets/tetnobg.png';

export function CompanyBrand() {
  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Logo con contenedor */}
      <div className="flex items-center justify-center w-full max-w-[250px] aspect-video bg-white rounded-xl overflow-hidden p-2">
        <img 
          src="/logocasitas.png"
          alt="Casitas Teto Logo"
          className="w-full h-full object-contain"
        />
      </div>
      
      {/* Texto y Mascota */}
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Casitas Teto
        </h1>
        <img 
          src={teto} 
          alt="Teto"
          className="w-15 h-15 object-contain"
        />
      </div>
    </div>
  );
}
