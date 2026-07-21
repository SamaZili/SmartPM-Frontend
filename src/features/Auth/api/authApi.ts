import { post } from '../../../services/api';
import { User } from '../../../types';

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  type: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  password: string;
  password_confirmation: string;
}

export const authApi = {
  login: (data: LoginDto) => post<{ user: User; token: string }>('/login', data),
  register: (data: RegisterDto) => post<{ user: User; token: string }>('/register', data),
  forgotPassword: (data: ForgotPasswordDto) => post('/forgot-password', data),
  resetPassword: (data: ResetPasswordDto) => post('/reset-password', data),
};