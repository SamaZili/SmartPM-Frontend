import { useState, useEffect, useCallback } from 'react';
import { userApi } from '../api/userApi';
import { UserSimple } from '../../../types';

export function useUsers() {
  const [users, setUsers] = useState<UserSimple[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await userApi.getAll();
      setUsers(data);
    } catch (error) {
      console.error('Erreur chargement users:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUsers();
    }
  }, [fetchUsers]);

  return { users, isLoading, fetchUsers };
}