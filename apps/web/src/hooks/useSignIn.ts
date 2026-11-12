'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { signIn } from '@/lib/api';

export function useSignIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      accountId,
      password,
    }: {
      accountId: string;
      password: string;
    }) => signIn(accountId, password),
    onSuccess: async (response) => {
      if (response.ok) await queryClient.clear();
    },
  });
}
