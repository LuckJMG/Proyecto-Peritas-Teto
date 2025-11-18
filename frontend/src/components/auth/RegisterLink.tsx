import React from 'react';
import { useNavigate } from 'react-router-dom';

export const RegisterLink: React.FC = () => {
  const navigate = useNavigate();

  const handleRegisterClick = () => {
    navigate('/register'); // redirige a la ruta de registro
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