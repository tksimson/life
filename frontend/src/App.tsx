import { useState } from 'react'

import { DayColumn } from './components/DayColumn'
import { Onboarding } from './components/Onboarding'
import { ScalePanels } from './components/ScalePanels'
import { useProfile } from './hooks/useProfile'

function App() {
  const { data: profile, isLoading, isError, refetch } = useProfile()
  // On narrow screens only one pane fits, so we fold to a single active pane.
  // On wide screens (lg+) both show side by side and this toggle is hidden.
  const [active, setActive] = useState<'days' | 'goals'>('days')

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-neutral-600">
        …
      </div>
    )
  }

  // A failed fetch is not an empty profile. Showing Onboarding here would look
  // like lost data, and saving the form would overwrite the real profile.
  if (isError) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-sm text-neutral-500">
        <span>Can't reach the backend. Your data is safe.</span>
        <button
          onClick={() => refetch()}
          className="border border-neutral-700 px-3 py-1 text-xs text-neutral-300"
        >
          Retry
        </button>
      </div>
    )
  }

  // Onboarding gate: fetch succeeded and there is no name or birth date yet.
  if (!profile || !profile.name || !profile.birth_date) {
    return <Onboarding />
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-baseline gap-3 border-b border-neutral-800/60 px-5 py-3">
        <span className="text-lg font-light tracking-tight text-neutral-100">life</span>
        <span className="text-xs text-neutral-600">{profile.name}</span>
        <nav className="ml-auto flex gap-4 text-xs lg:hidden">
          <button
            onClick={() => setActive('days')}
            className={active === 'days' ? 'text-neutral-200' : 'text-neutral-600'}
          >
            Days
          </button>
          <button
            onClick={() => setActive('goals')}
            className={active === 'goals' ? 'text-neutral-200' : 'text-neutral-600'}
          >
            Goals
          </button>
        </nav>
      </header>
      <main className="grid min-h-0 flex-1 grid-cols-1 divide-neutral-800/60 lg:grid-cols-2 lg:divide-x">
        <div className={`min-h-0 overflow-hidden ${active === 'days' ? '' : 'hidden'} lg:block`}>
          <DayColumn birthDate={profile.birth_date} />
        </div>
        <div className={`min-h-0 overflow-hidden ${active === 'goals' ? '' : 'hidden'} lg:block`}>
          <ScalePanels />
        </div>
      </main>
    </div>
  )
}

export default App
