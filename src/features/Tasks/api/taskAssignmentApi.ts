import apiClient from '../../../services/api';
import { Task } from '../../../types';

export const taskAssignmentApi = {
  getMyTasks: async (): Promise<Task[]> => {
    const response = await apiClient.get('/my-tasks');
    return response.data.data;
  },

  updateAssignmentStatus: async (
    taskId: number,
    status: 'accepted' | 'in_progress' | 'completed'
  ): Promise<Task> => {
    const response = await apiClient.patch(
      `/tasks/${taskId}/assignment-status`,
      { assignment_status: status }
    );
    return response.data.data;
  },
};