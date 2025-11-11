import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';
import type { PasswordFieldProps } from '@/types/auth.types';

export const PasswordField: React.FC<PasswordFieldProps> = ({ value, onChange }) => {
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleRecoverPassword = () => {
    // Lógica de recuperar contraseña
    console.log('Recuperar contraseña');
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label htmlFor="password" className="text-gray-900 font-normal">
          Contraseña
        </Label>
        <button
          type="button"
          className="text-sm text-blue-600 hover:underline"
          onClick={handleRecoverPassword}
        >
          Recuperar
        </button>
      </div>
      <div className="relative">
        <Input
          id="password"
          type={showPassword ? "text" : "password"}
          placeholder="Contraseña"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-11 pr-10"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
    </div>
  );
};