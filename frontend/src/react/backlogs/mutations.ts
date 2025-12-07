import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getMetaContent } from 'core-app/core/setup/globals/global-helpers';
import { useEffect, useState } from 'react';
import { Backlog, Story } from './queries';


function useMetaContent(name:string) {
  const [value, setValue] = useState('');

  useEffect(() => { setValue(getMetaContent(name)); }, [name]);

  return value;
}

export function useSubmitForm(projectId:string, sprintId:string, storyId:string) {
  const csrfToken = useMetaContent('csrf-token');
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData:Partial<Story>) => {
      const response = await fetch(`/projects/${projectId}/sprints/${sprintId}/stories/${storyId}.json`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'X-Authentication-Scheme': 'Session',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['backlogs', projectId] });
    },
  });
}
