import apiClient from '../../../services/api';
import { UserSimple } from '../../../types';

export const userApi = {
  getAll: async (): Promise<UserSimple[]> => {
    const response = await apiClient.get('/users');
    return response.data.data;
  },
};