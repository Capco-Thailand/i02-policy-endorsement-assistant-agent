'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { signOut } from '@/lib/api';

export function useSignOut() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: signOut,
    onSuccess: async (response) => {
      if (response.ok || response.status === 401) await queryClient.clear();
    },
  });
}
