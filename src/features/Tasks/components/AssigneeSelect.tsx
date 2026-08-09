import React from 'react';
import { useUsers } from '../../Users/hooks/useUsers';
import { UserSimple } from '../../../types';

interface AssigneeSelectProps {
  value: number | null;
  onChange: (userId: number | null) => void;
  disabled?: boolean;
  className?: string;
}

const AssigneeSelect: React.FC<AssigneeSelectProps> = ({
  value,
  onChange,
  disabled = false,
  className = '',
}) => {
  const { users, isLoading } = useUsers();

  // Filtrer uniquement les développeurs
  const developers = users.filter((u: UserSimple) => u.type === 'developer');

  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
      disabled={disabled || isLoading}
      className={className}
    >
      <option value="">
        {isLoading ? 'Chargement...' : '-- Non assigné --'}
      </option>
      {developers.map((dev: UserSimple) => (
        <option key={dev.id} value={dev.id}>
          {dev.name} ({dev.email})
        </option>
      ))}
    </select>
  );
};

export default AssigneeSelect;