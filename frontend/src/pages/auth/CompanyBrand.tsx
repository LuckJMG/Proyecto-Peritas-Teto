import React from 'react';
import teto from '@/assets/tetnobg.png'

export const CompanyBrand: React.FC = () => {
  return (
    <div className="flex flex-col items-center gap-3">
      {/* Logo con contenedor */}
      <div className="w-200 h-56 bg-white rounded-xl flex items-center justify-center overflow-hidden">
        <img 
          src="/logocasitas.png"
          alt="Casitas Teto Logo"
          className="max-w-full max-h-full object-contain"
        />
      </div>
      {/* Texto y emoji */}
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold text-gray-900">Casitas Teto</h1>
        <img 
          src={teto} 
          alt="Teto"
          className="w-15 h-15 object-contain"
        />
      </div>
    </div>
  );
};
