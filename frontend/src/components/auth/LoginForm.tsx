import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { EmailField } from './EmailField';
import { PasswordField } from './PasswordField';
import { RememberMeCheckbox } from './RememberMeCheckbox';
import type { LoginFormProps } from '@/types/auth.types';

export const LoginForm: React.FC<LoginFormProps> = ({ onSubmit }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [remember, setRemember] = useState<boolean>(false);

  const handleSubmit = () => {
    onSubmit({ email, password, remember });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="space-y-5 w-full" onKeyPress={handleKeyPress}>
      <EmailField value={email} onChange={setEmail} />
      <PasswordField value={password} onChange={setPassword} />
      <RememberMeCheckbox checked={remember} onChange={setRemember} />
      
      <Button
        onClick={handleSubmit}
        className="w-full h-11 #4285F4 hover:bg-gray-800 text-white font-medium rounded-lg"
      >
        Iniciar sesión
      </Button>
    </div>
  );
};