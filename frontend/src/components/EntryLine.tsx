import { useEffect, useRef, useState } from 'react'

import { LINE_MAX } from '../api/types'

interface Props {
  label: string
  value: string
  placeholder?: string
  muted?: boolean // e.g. future days: dimmer, still editable-off
  labelWidthClass?: string // widen for long period labels (weeks/months)
  onSave: (text: string) => void
}

// One inline-editable line: [label] [text]. Saves on blur or Enter, only if changed.
// Uses an auto-growing textarea so a long line wraps to a second row (narrow/mobile)
// instead of being truncated — but Enter still commits, so it stays "one line" in spirit.
export function EntryLine({
  label,
  value,
  placeholder,
  muted,
  labelWidthClass = 'w-10',
  onSave,
}: Props) {
  const [text, setText] = useState(value)
  const [focused, setFocused] = useState(false)
  const dirty = useRef(false)
  const ref = useRef<HTMLTextAreaElement>(null)

  // Grow the textarea to fit its (possibly wrapped) content.
  const resize = () => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }

  // Keep local text in sync when the server value changes and we're not editing.
  useEffect(() => {
    if (!focused) setText(value)
  }, [value, focused])

  useEffect(resize, [text])

  const commit = () => {
    setFocused(false)
    if (dirty.current && text.trim() !== value.trim()) {
      onSave(text.trim())
    }
    dirty.current = false
  }

  return (
    <div
      className={`group flex items-start gap-3 rounded-md px-2 py-1 transition-colors hover:bg-white/[0.03] ${
        muted ? 'opacity-40' : ''
      }`}
    >
      <span
        className={`${labelWidthClass} shrink-0 text-right font-mono text-xs leading-6 tabular-nums text-neutral-500 select-none`}
      >
        {label}
      </span>
      <textarea
        ref={ref}
        rows={1}
        value={text}
        maxLength={LINE_MAX}
        placeholder={placeholder ?? ''}
        onChange={(e) => {
          dirty.current = true
          setText(e.target.value)
        }}
        onFocus={() => setFocused(true)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            e.currentTarget.blur()
          } else if (e.key === 'Escape') {
            setText(value)
            dirty.current = false
            e.currentTarget.blur()
          }
        }}
        className="m-0 block w-full min-w-0 resize-none overflow-hidden border-0 bg-transparent p-0 text-sm leading-6 text-neutral-200 outline-none placeholder:text-neutral-700"
      />
      {focused && (
        <span className="shrink-0 font-mono text-[10px] leading-6 tabular-nums text-neutral-600">
          {text.length}/{LINE_MAX}
        </span>
      )}
    </div>
  )
}
