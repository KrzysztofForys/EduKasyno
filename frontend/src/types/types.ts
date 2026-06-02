export interface HeroProps {
  title: string;
  description: string;
  image: string;
}
export interface GameCardProps {
  title: string;
  desc: string;
  link: string;
  image: string;
}

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface LoginErrors {
  email?: string;
  password?: string;
  form?: string;
}

// Dodaj to do swojego pliku z typami
export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export interface RegisterErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  acceptTerms?: string;
  form?: string;
}