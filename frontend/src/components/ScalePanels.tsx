import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import type { Scale } from '../api/types'
import { useEntries, useUpsertEntry } from '../hooks/useEntries'
import { iso, periodsForward } from '../lib/dates'
import { EntryLine } from './EntryLine'

interface PanelProps {
  scale: Scale
  title: string
  initial: number
  step: number
  defaultOpen?: boolean
}

function PeriodPanel({ scale, title, initial, step, defaultOpen }: PanelProps) {
  const [open, setOpen] = useState(defaultOpen ?? true)
  const [visible, setVisible] = useState(initial)
  const { byAnchor } = useEntries(scale)
  const upsert = useUpsertEntry()

  // Goals look forward: current period at top, future below.
  const periods = periodsForward(scale, new Date(), visible)

  return (
    <section className="border-b border-neutral-800/60">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-white/[0.02]"
      >
        <span className="text-sm font-semibold tracking-wide text-neutral-300">{title}</span>
        <motion.span
          animate={{ rotate: open ? 90 : 0 }}
          className="text-base leading-none text-neutral-400"
        >
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
                  placeholder="1/ …"
                  onSave={(text) => upsert.mutate({ scale, date: iso(p.date), text })}
                />
              ))}
              <div className="mx-2 mt-2 flex gap-4 text-xs">
                <button
                  onClick={() => setVisible((v) => v + step)}
                  className="text-neutral-500 transition-colors hover:text-neutral-300"
                >
                  Show more
                </button>
                {visible > initial && (
                  <button
                    onClick={() => setVisible((v) => Math.max(initial, v - step))}
                    className="text-neutral-500 transition-colors hover:text-neutral-300"
                  >
                    Show fewer
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

// RIGHT pane: goals per week / month / year / decade, looking forward from now.
// One free line each (write them as "1/ … 2/ … 3/ …"), stacked and collapsible.
export function ScalePanels() {
  return (
    <div className="h-full overflow-y-auto">
      <h2 className="px-4 pt-6 pb-2 text-sm font-semibold tracking-wide text-neutral-400">
        Goals
      </h2>
      <PeriodPanel scale="week" title="Weeks" initial={7} step={8} />
      <PeriodPanel scale="month" title="Months" initial={5} step={6} />
      <PeriodPanel scale="year" title="Years" initial={3} step={5} />
      <PeriodPanel scale="decade" title="Decades" initial={2} step={3} />
    </div>
  )
}
