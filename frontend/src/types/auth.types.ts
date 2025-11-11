export interface LoginCredentials {
  email: string;
  password: string;
  remember: boolean;
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

export interface LoginFormProps {
  onSubmit: (credentials: LoginCredentials) => void;
}

export interface FormPanelProps {
  onLogin: (credentials: LoginCredentials) => void;
}