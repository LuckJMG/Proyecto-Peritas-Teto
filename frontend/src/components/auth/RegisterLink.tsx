import React from 'react';

export const RegisterLink: React.FC = () => {
  const handleRegisterClick = () => {
    // Navegar a registro
    console.log('Navegar a registro');
  };

  return (
    <div className="text-center text-sm">
      <span className="text-gray-600">¿Eres residente y no tienes cuenta? </span>
      <button
        type="button"
        className="text-blue-600 hover:underline font-medium"
        onClick={handleRegisterClick}
      >
        Regístrate
      </button>
    </div>
  );
};