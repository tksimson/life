import { DayColumn } from './components/DayColumn'
import { Onboarding } from './components/Onboarding'
import { ScalePanels } from './components/ScalePanels'
import { useProfile } from './hooks/useProfile'

function App() {
  const { data: profile, isLoading } = useProfile()

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-neutral-600">
        …
      </div>
    )
  }

  // Onboarding gate: no name or birth date yet.
  if (!profile || !profile.name || !profile.birth_date) {
    return <Onboarding />
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-baseline gap-3 border-b border-neutral-800/60 px-5 py-3">
        <span className="text-lg font-light tracking-tight text-neutral-100">life</span>
        <span className="text-xs text-neutral-600">{profile.name}</span>
      </header>
      <main className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_minmax(0,1fr)] divide-x divide-neutral-800/60">
        <DayColumn birthDate={profile.birth_date} />
        <ScalePanels birthDate={profile.birth_date} />
      </main>
    </div>
  )
}

export default App
