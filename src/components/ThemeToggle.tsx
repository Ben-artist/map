import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

type ThemeMode = 'light' | 'dark'

function getInitialMode(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'light'
  }

  const stored = window.localStorage.getItem('theme')
  if (stored === 'dark') return 'dark'
  if (stored === 'light') return 'light'

  // 兼容旧版 auto：按系统偏好解析一次
  if (stored === 'auto') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

function applyThemeMode(mode: ThemeMode) {
  document.documentElement.classList.remove('light', 'dark')
  document.documentElement.classList.add(mode)
  document.documentElement.setAttribute('data-theme', mode)
  document.documentElement.style.colorScheme = mode
}

export default function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>('light')

  useEffect(() => {
    const initialMode = getInitialMode()
    setMode(initialMode)
    applyThemeMode(initialMode)
  }, [])

  function toggleMode() {
    const nextMode: ThemeMode = mode === 'light' ? 'dark' : 'light'
    setMode(nextMode)
    applyThemeMode(nextMode)
    window.localStorage.setItem('theme', nextMode)
  }

  const isDark = mode === 'dark'
  const label = isDark
    ? '当前为深色模式，点击切换为浅色'
    : '当前为浅色模式，点击切换为深色'

  return (
    <button
      type="button"
      onClick={toggleMode}
      aria-label={label}
      title={label}
      className="inline-flex items-center gap-1.5 rounded-full border border-(--chip-line) bg-(--chip-bg) px-3 py-1.5 text-sm font-semibold text-(--sea-ink) shadow-[0_8px_22px_rgba(30,90,72,0.08)] transition hover:-translate-y-0.5"
    >
      {isDark ? (
        <>
          <Moon className="size-4" aria-hidden />
          Dark
        </>
      ) : (
        <>
          <Sun className="size-4" aria-hidden />
          Light
        </>
      )}
    </button>
  )
}
