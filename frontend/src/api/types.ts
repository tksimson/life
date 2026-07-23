export type Scale = 'day' | 'week' | 'month' | 'year' | 'decade'

export const LINE_MAX = 140

export interface Profile {
  name: string
  birth_date: string | null // ISO yyyy-mm-dd
}

export interface Entry {
  id: number
  scale: Scale
  anchor_date: string // ISO yyyy-mm-dd, canonical first day of the period
  text: string
  updated_at: string
}
