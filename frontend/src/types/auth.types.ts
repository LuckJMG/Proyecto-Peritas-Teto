// frontend/src/types/auth.types.ts

export interface LoginCredentials {
  email: string;
  password: string;
  remember: boolean;
}

export interface LoginFormProps {
  onSubmit: (credentials: LoginCredentials) => void;
  loading?: boolean;
}

export interface RegisterCredentials {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
}

export interface FormPanelProps {
  onLogin: (credentials: LoginCredentials) => void;
  loading?: boolean;
  error?: string;
}

export interface EmailFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export interface PasswordFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export interface RememberMeCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}