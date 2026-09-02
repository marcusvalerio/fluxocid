import { Moon, Sun, SunMoon } from 'lucide-react'
import { useThemeStore, type ThemeMode } from '../state/useThemeStore'
import { IconButton } from './IconButton'

const NEXT: Record<ThemeMode, ThemeMode> = {
  light: 'dark',
  dark: 'system',
  system: 'light',
}

const ICON: Record<ThemeMode, typeof Sun> = {
  light: Sun,
  dark: Moon,
  system: SunMoon,
}

const LABEL: Record<ThemeMode, string> = {
  light: 'Tema: claro',
  dark: 'Tema: escuro',
  system: 'Tema: automático (sistema)',
}

/** Cycles light → dark → system on tap; the icon always shows the *current* mode. */
export function ThemeToggle() {
  const theme = useThemeStore((s) => s.theme)
  const setTheme = useThemeStore((s) => s.setTheme)
  const Icon = ICON[theme]

  return (
    <IconButton label={LABEL[theme]} onClick={() => setTheme(NEXT[theme])}>
      <Icon size={18} />
    </IconButton>
  )
}
