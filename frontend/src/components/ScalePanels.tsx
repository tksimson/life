import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import type { Scale } from '../api/types'
import { useEntries, useUpsertEntry } from '../hooks/useEntries'
import { iso, parseISO, periodsBack } from '../lib/dates'
import { EntryLine } from './EntryLine'

interface PanelProps {
  scale: Scale
  title: string
  birthDate: string
  initial: number
  step: number
  defaultOpen?: boolean
}

function PeriodPanel({ scale, title, birthDate, initial, step, defaultOpen }: PanelProps) {
  const [open, setOpen] = useState(defaultOpen ?? true)
  const [visible, setVisible] = useState(initial)
  const { byAnchor } = useEntries(scale)
  const upsert = useUpsertEntry()

  const all = periodsBack(scale, parseISO(birthDate), new Date())
  const periods = all.slice(0, visible)

  return (
    <section className="border-b border-neutral-800/60">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-sm font-semibold tracking-wide text-neutral-300">{title}</span>
        <motion.span animate={{ rotate: open ? 90 : 0 }} className="text-neutral-600">
          ›
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-2 pb-4">
              {periods.map((p) => (
                <EntryLine
                  key={p.key}
                  label={p.label}
                  labelWidthClass="w-24"
                  value={byAnchor.get(p.key)?.text ?? ''}
                  placeholder="—"
                  onSave={(text) => upsert.mutate({ scale, date: iso(p.date), text })}
                />
              ))}
              {visible < all.length && (
                <button
                  onClick={() => setVisible((v) => v + step)}
                  className="mx-2 mt-2 text-xs text-neutral-500 transition-colors hover:text-neutral-300"
                >
                  Show more
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

interface Props {
  birthDate: string
}

// RIGHT pane: weeks / months / years / decades, stacked and collapsible.
export function ScalePanels({ birthDate }: Props) {
  return (
    <div className="h-full overflow-y-auto">
      <h2 className="px-4 pt-6 pb-2 text-sm font-semibold tracking-wide text-neutral-400">
        The longer view
      </h2>
      <PeriodPanel scale="week" title="Weeks" birthDate={birthDate} initial={12} step={26} />
      <PeriodPanel scale="month" title="Months" birthDate={birthDate} initial={12} step={24} />
      <PeriodPanel scale="year" title="Years" birthDate={birthDate} initial={60} step={60} />
      <PeriodPanel scale="decade" title="Decades" birthDate={birthDate} initial={20} step={20} />
    </div>
  )
}
