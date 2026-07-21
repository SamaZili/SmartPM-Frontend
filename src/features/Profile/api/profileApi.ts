import { get, put } from '../../../services/api';
import { User } from '../../../types';

export interface UpdateProfileDto {
  name?: string;
  email?: string;
  current_password?: string;
  new_password?: string;
  new_password_confirmation?: string;
}

export const profileApi = {
  getProfile: () => get<User>('/profile'),
  updateProfile: (data: UpdateProfileDto) => put<User>('/profile', data),
};