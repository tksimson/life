import { motion } from 'framer-motion'

import type { Entry } from '../api/types'
import { anchorISO, daysInMonth, iso, isoWeek, monthName } from '../lib/dates'
import { EntryLine } from './EntryLine'

interface Props {
  year: number
  month: number // 0-indexed
  byAnchor: Map<string, Entry>
  today: Date
  onSave: (date: string, text: string) => void
}

// One month = a block of day rows: [week#] │ [day#] [line].
// The vertical rule is a per-row left border; rows sit flush, so it reads as one
// continuous spine. Week numbers print only on the row that opens a week.
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
      {/* ml-9 = week gutter (w-7) + ml-2, so the header lines up with the days. */}
      <h3 className="mb-2 ml-9 px-2 text-xs font-medium tracking-widest text-neutral-500 uppercase">
        {monthName(month)} {year}
      </h3>
      <div>
        {days.map((day) => {
          const d = new Date(year, month, day)
          const key = anchorISO('day', d)
          const entry = byAnchor.get(key)
          const isFuture = d > today
          // A new week starts on Monday; the month's first row opens one too,
          // so every run of days carries its week number.
          const startsWeek = d.getDay() === 1 || day === 1
          return (
            <div key={key} className="flex items-stretch">
              <span className="w-7 shrink-0 py-1 text-right font-mono text-[10px] leading-6 tabular-nums text-neutral-600 select-none">
                {startsWeek ? `W${isoWeek(d)}` : ''}
              </span>
              <div className="ml-2 min-w-0 flex-1 border-l border-neutral-800/60">
                <EntryLine
                  label={String(day)}
                  value={entry?.text ?? ''}
                  placeholder={isFuture ? '' : '—'}
                  muted={isFuture}
                  onSave={(text) => onSave(iso(d), text)}
                />
              </div>
            </div>
          )
        })}
      </div>
    </motion.section>
  )
}
