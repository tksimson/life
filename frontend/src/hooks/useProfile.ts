import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api } from '../api/client'
import type { Profile } from '../api/types'

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => api.get<Profile>('/profile/'),
  })
}

export function useSaveProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Profile) => api.put<Profile>('/profile/', data),
    onSuccess: (data) => qc.setQueryData(['profile'], data),
  })
}
