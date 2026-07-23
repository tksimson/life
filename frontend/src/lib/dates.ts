import type { Scale } from '../api/types'

// --- local-date helpers (no UTC drift) --------------------------------------

export function iso(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function parseISO(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function daysInMonth(year: number, month: number): number {
  // month is 0-indexed
  return new Date(year, month + 1, 0).getDate()
}

// Mirror of backend core.utils.anchor_for: canonical first day of the period.
export function anchorFor(scale: Scale, d: Date): Date {
  switch (scale) {
    case 'day':
      return new Date(d.getFullYear(), d.getMonth(), d.getDate())
    case 'week': {
      // Monday = 0
      const dow = (d.getDay() + 6) % 7
      const monday = new Date(d.getFullYear(), d.getMonth(), d.getDate() - dow)
      return monday
    }
    case 'month':
      return new Date(d.getFullYear(), d.getMonth(), 1)
    case 'year':
      return new Date(d.getFullYear(), 0, 1)
    case 'decade':
      return new Date(d.getFullYear() - (d.getFullYear() % 10), 0, 1)
  }
}

export function anchorISO(scale: Scale, d: Date): string {
  return iso(anchorFor(scale, d))
}

// ISO week number, for labels.
export function isoWeek(d: Date): number {
  const t = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const dayNum = (t.getDay() + 6) % 7
  t.setDate(t.getDate() - dayNum + 3)
  const firstThursday = new Date(t.getFullYear(), 0, 4)
  const diff = t.getTime() - firstThursday.getTime()
  return 1 + Math.round(diff / (7 * 24 * 3600 * 1000))
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const MONTHS_SHORT = MONTHS.map((m) => m.slice(0, 3))

export function monthName(month: number): string {
  return MONTHS[month]
}

// --- period lists (newest first), from `now` back to `start` ----------------

export interface Period {
  key: string // anchor ISO, used to key entries + React
  label: string
  date: Date // the anchor date
}

export function periodsBack(scale: Scale, start: Date, now: Date): Period[] {
  const out: Period[] = []
  const seen = new Set<string>()
  const cursor = new Date(now)

  const step = () => {
    switch (scale) {
      case 'week':
        cursor.setDate(cursor.getDate() - 7)
        break
      case 'month':
        cursor.setMonth(cursor.getMonth() - 1)
        break
      case 'year':
        cursor.setFullYear(cursor.getFullYear() - 1)
        break
      case 'decade':
        cursor.setFullYear(cursor.getFullYear() - 10)
        break
      default:
        cursor.setDate(cursor.getDate() - 1)
    }
  }

  const startAnchor = anchorFor(scale, start).getTime()
  // Cap iterations so a bad range can never spin forever.
  for (let i = 0; i < 5000; i++) {
    const anchor = anchorFor(scale, cursor)
    if (anchor.getTime() < startAnchor) break
    const key = iso(anchor)
    if (!seen.has(key)) {
      seen.add(key)
      out.push({ key, label: periodLabel(scale, anchor), date: anchor })
    }
    step()
  }
  return out
}

export function periodLabel(scale: Scale, anchor: Date): string {
  switch (scale) {
    case 'week':
      return `W${isoWeek(anchor)} · ${MONTHS_SHORT[anchor.getMonth()]} ${anchor.getDate()}`
    case 'month':
      return `${MONTHS_SHORT[anchor.getMonth()]} ${anchor.getFullYear()}`
    case 'year':
      return `${anchor.getFullYear()}`
    case 'decade':
      return `${anchor.getFullYear()}s`
    default:
      return iso(anchor)
  }
}

// Months from `now` back to `start`, newest first — for the left day column.
export function monthsBack(start: Date, now: Date): { year: number; month: number }[] {
  const out: { year: number; month: number }[] = []
  const cursor = new Date(now.getFullYear(), now.getMonth(), 1)
  const startMonth = new Date(start.getFullYear(), start.getMonth(), 1).getTime()
  for (let i = 0; i < 2000; i++) {
    if (cursor.getTime() < startMonth) break
    out.push({ year: cursor.getFullYear(), month: cursor.getMonth() })
    cursor.setMonth(cursor.getMonth() - 1)
  }
  return out
}
