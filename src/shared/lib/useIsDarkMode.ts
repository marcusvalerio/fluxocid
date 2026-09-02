import { useEffect, useState } from 'react'
import { useThemeStore } from '../state/useThemeStore'

/** Resolves the theme store's light/dark/system choice down to a plain boolean, tracking the
 * OS preference live when the mode is 'system' — for the handful of canvas (Konva) draws that
 * can't consume CSS custom properties directly and need a literal color choice in JS. */
export function useIsDarkMode(): boolean {
  const theme = useThemeStore((s) => s.theme)
  const [systemDark, setSystemDark] = useState(
    () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches,
  )

  useEffect(() => {
    if (theme !== 'system' || typeof matchMedia === 'undefined') return
    const mql = matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => setSystemDark(mql.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [theme])

  if (theme === 'dark') return true
  if (theme === 'light') return false
  return systemDark
}
