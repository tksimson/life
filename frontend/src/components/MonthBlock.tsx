import { motion } from 'framer-motion'

import type { Entry } from '../api/types'
import { anchorISO, daysInMonth, iso, monthName } from '../lib/dates'
import { EntryLine } from './EntryLine'

interface Props {
  year: number
  month: number // 0-indexed
  byAnchor: Map<string, Entry>
  today: Date
  onSave: (date: string, text: string) => void
}

// One month = a block of day rows [day#] [line].
export function MonthBlock({ year, month, byAnchor, today, onSave }: Props) {
  const total = daysInMonth(year, month)
  const days = Array.from({ length: total }, (_, i) => i + 1)

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="mb-8"
    >
      <h3 className="mb-2 px-2 text-xs font-medium tracking-widest text-neutral-500 uppercase">
        {monthName(month)} {year}
      </h3>
      <div>
        {days.map((day) => {
          const d = new Date(year, month, day)
          const key = anchorISO('day', d)
          const entry = byAnchor.get(key)
          const isFuture = d > today
          return (
            <EntryLine
              key={key}
              label={String(day)}
              value={entry?.text ?? ''}
              placeholder={isFuture ? '' : '—'}
              muted={isFuture}
              onSave={(text) => onSave(iso(d), text)}
            />
          )
        })}
      </div>
    </motion.section>
  )
}
