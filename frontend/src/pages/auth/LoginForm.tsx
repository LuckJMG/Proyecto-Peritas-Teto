import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { EmailField } from './EmailField';
import { PasswordField } from './PasswordField';
import type { LoginFormProps } from '@/types/auth.types';

export const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, loading = false }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const remember = false; 

  const handleSubmit = () => {
    if (!loading && email && password) {
      onSubmit({ email, password, remember });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !loading) {
      handleSubmit();
    }
  };

  return (
    <div className="space-y-5 w-full" onKeyDown={handleKeyPress}>
      <EmailField value={email} onChange={setEmail} />
      <PasswordField value={password} onChange={setPassword} />

      <Button
        onClick={handleSubmit}
        disabled={loading || !email || !password}
        className="w-full h-11 bg-[#99D050] hover:bg-[#88bf40] text-white font-medium rounded-lg transition-colors"
      >
        {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
      </Button>
    </div>
  );
};
