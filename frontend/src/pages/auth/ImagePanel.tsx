import React from 'react';
import Image from '@/assets/casitasteto.png';


export const ImagePanel: React.FC = () => {
  return (
    <div className="w-0 lg:w-[60%] bg-gray-100 relative overflow-hidden h-screen">
      <img 
        src={Image} 
        alt="Edificio Casitas Teto"
        className="w-full h-full object-cover object-bottom"
      />
    </div>
  );
};
