import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { EmailFieldProps } from '@/types/auth.types';

export const EmailField: React.FC<EmailFieldProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="email" className="text-foreground font-normal">
        Correo
      </Label>
      <Input
        id="email"
        type="email"
        placeholder="nombre@ejemplo.com"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-11"
      />
    </div>
  );
};
