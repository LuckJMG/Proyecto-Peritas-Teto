import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { RememberMeCheckboxProps } from '@/types/auth.types';

export const RememberMeCheckbox: React.FC<RememberMeCheckboxProps> = ({ 
  checked, 
  onChange 
}) => {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id="remember"
        checked={checked}
        onCheckedChange={onChange}
        className="h-5 w-5 rounded-none border-2 border-gray-300 data-[state=checked]:bg-gray-900 data-[state=checked]:border-gray-900"
      />
      <Label
        htmlFor="remember"
        className="text-sm font-normal cursor-pointer text-gray-700"
      >
        Recordarme
      </Label>
    </div>
  );
};