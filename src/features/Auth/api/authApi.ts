import { post } from '../../../services/api';
import { User, LoginDto, RegisterDto, ForgotPasswordDto, ResetPasswordDto } from '../../../types';

export const authApi = {
  login: (data: LoginDto) => post<{ user: User; token: string }>('/login', data),
  register: (data: RegisterDto) => post<{ user: User; token: string }>('/register', data),
  forgotPassword: (data: ForgotPasswordDto) => post<{ message: string }>('/forgot-password', data),
  resetPassword: (data: ResetPasswordDto) => post<{ message: string }>('/reset-password', data),
};