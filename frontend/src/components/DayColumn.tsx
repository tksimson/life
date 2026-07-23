import { useState } from 'react'

import { useEntries, useUpsertEntry } from '../hooks/useEntries'
import { monthsBack, parseISO } from '../lib/dates'
import { MonthBlock } from './MonthBlock'

interface Props {
  birthDate: string
}

const INITIAL = 6 // months shown before "load earlier"
const STEP = 12

// LEFT pane: day entries in monthly blocks, current month first, scroll into the past.
export function DayColumn({ birthDate }: Props) {
  const today = new Date()
  const { byAnchor } = useEntries('day')
  const upsert = useUpsertEntry()
  const allMonths = monthsBack(parseISO(birthDate), today)
  const [visible, setVisible] = useState(INITIAL)
  const months = allMonths.slice(0, visible)

  const onSave = (date: string, text: string) =>
    upsert.mutate({ scale: 'day', date, text })

  return (
    <div className="h-full overflow-y-auto px-4 py-6">
      <h2 className="mb-6 px-2 text-sm font-semibold tracking-wide text-neutral-400">
        Days
      </h2>
      {months.map(({ year, month }) => (
        <MonthBlock
          key={`${year}-${month}`}
          year={year}
          month={month}
          byAnchor={byAnchor}
          today={today}
          onSave={onSave}
        />
      ))}
      {visible < allMonths.length && (
        <button
          onClick={() => setVisible((v) => v + STEP)}
          className="mx-2 mb-8 rounded-md border border-neutral-800 px-3 py-1.5 text-xs text-neutral-400 transition-colors hover:bg-white/[0.04] hover:text-neutral-200"
        >
          Show earlier months
        </button>
      )}
    </div>
  )
}
