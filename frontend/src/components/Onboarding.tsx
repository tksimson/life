import { useState } from 'react'
import { motion } from 'framer-motion'

import { useSaveProfile } from '../hooks/useProfile'

// First run: capture name + birth date. Shown until the profile is complete.
export function Onboarding() {
  const [name, setName] = useState('')
  const [birth, setBirth] = useState('')
  const save = useSaveProfile()

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !birth) return
    save.mutate({ name: name.trim(), birth_date: birth })
  }

  return (
    <div className="flex h-full items-center justify-center px-6">
      <motion.form
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        onSubmit={submit}
        className="w-full max-w-sm"
      >
        <h1 className="mb-1 text-3xl font-light tracking-tight text-neutral-100">life</h1>
        <p className="mb-8 text-sm text-neutral-500">One line a day. For the rest of it.</p>

        <label className="mb-2 block text-xs tracking-wide text-neutral-500 uppercase">
          Your name
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          className="mb-6 w-full border-b border-neutral-700 bg-transparent py-2 text-lg text-neutral-100 outline-none focus:border-neutral-400"
        />

        <label className="mb-2 block text-xs tracking-wide text-neutral-500 uppercase">
          Date of birth
        </label>
        <input
          type="date"
          value={birth}
          onChange={(e) => setBirth(e.target.value)}
          className="mb-8 w-full border-b border-neutral-700 bg-transparent py-2 text-lg text-neutral-100 outline-none focus:border-neutral-400 [color-scheme:dark]"
        />

        <button
          type="submit"
          disabled={!name.trim() || !birth || save.isPending}
          className="w-full rounded-md bg-neutral-100 py-2.5 text-sm font-medium text-neutral-900 transition-opacity hover:opacity-90 disabled:opacity-30"
        >
          {save.isPending ? 'Saving…' : 'Begin'}
        </button>
      </motion.form>
    </div>
  )
}
