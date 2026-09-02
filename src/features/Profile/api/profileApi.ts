import { get, put } from '../../../services/api';
import { User, UpdateProfileDto } from '../../../types';

export const profileApi = {
  getProfile: () => get<User>('/profile'),
  updateProfile: (data: UpdateProfileDto) => put<User>('/profile', data),
};