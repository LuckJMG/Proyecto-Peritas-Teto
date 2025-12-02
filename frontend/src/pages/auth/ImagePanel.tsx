import React from 'react';
import Image from '@/assets/casitasteto.png';

export const ImagePanel: React.FC = () => {
  return (
    <div className="hidden lg:block w-0 lg:w-[60%] bg-muted relative overflow-hidden h-screen">
      <img 
        src={Image} 
        alt="Edificio Casitas Teto"
        className="w-full h-full object-cover object-bottom"
      />
      {/* Overlay opcional para mejorar contraste si es necesario */}
      <div className="absolute inset-0 bg-black/10" />
    </div>
  );
};
