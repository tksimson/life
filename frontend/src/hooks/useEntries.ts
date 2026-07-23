import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api } from '../api/client'
import type { Entry, Scale } from '../api/types'

// Fetch all entries for a scale and index them by anchor_date for O(1) lookup.
export function useEntries(scale: Scale) {
  const query = useQuery({
    queryKey: ['entries', scale],
    queryFn: () => api.get<Entry[]>(`/entries/?scale=${scale}`),
  })

  const byAnchor = useMemo(() => {
    const map = new Map<string, Entry>()
    for (const e of query.data ?? []) map.set(e.anchor_date, e)
    return map
  }, [query.data])

  return { ...query, byAnchor }
}

interface UpsertArgs {
  scale: Scale
  date: string // any day in the period; backend normalizes to the anchor
  text: string
}

// Save (or clear, when text is empty) one slot, then refresh that scale.
export function useUpsertEntry() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ scale, date, text }: UpsertArgs) =>
      api.post<Entry | undefined>('/entries/', { scale, date, text }),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['entries', vars.scale] })
    },
  })
}
